import {transformComment, indent, DeclarationBlock} from '@graphql-codegen/visitor-plugin-common';
import {TypeGraphQLPluginConfig} from './config';
import * as autoBind from 'auto-bind';
import {
  FieldDefinitionNode,
  EnumTypeDefinitionNode,
  InputValueDefinitionNode,
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  TypeNode,
  NameNode,
  GraphQLEnumType,
} from 'graphql';
import {
  TypeScriptOperationVariablesToObject,
  TypeScriptPluginParsedConfig,
  TsVisitor,
  AvoidOptionalsConfig,
} from '@graphql-codegen/typescript';
import {InputObjectTypeDefinitionNode} from 'graphql';

export interface TypeGraphQLPluginParsedConfig extends TypeScriptPluginParsedConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
}

const MAYBE_REGEX = /^Maybe<(.*?)>$/;
const ARRAY_REGEX = /^Array<(.*?)>$/;
const SCALAR_REGEX = /^Scalars\['(.*?)'\]$/;
const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];
const SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];
const TYPE_GRAPHQL_SCALARS = ['ID', 'Int', 'Float'];

interface Type {
  type: string;
  isNullable: boolean;
  isArray: boolean;
  isScalar: boolean;
}

export class TypeGraphQLVisitor<
  TRawConfig extends TypeGraphQLPluginConfig = TypeGraphQLPluginConfig,
  TParsedConfig extends TypeGraphQLPluginParsedConfig = TypeGraphQLPluginParsedConfig
> extends TsVisitor<TRawConfig, TParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      avoidOptionals: pluginConfig.avoidOptionals || false,
      maybeValue: pluginConfig.maybeValue || 'T | null',
      constEnums: pluginConfig.constEnums || false,
      enumsAsTypes: pluginConfig.enumsAsTypes || false,
      immutableTypes: pluginConfig.immutableTypes || false,
      declarationKind: {
        type: 'interface',
        interface: 'interface',
        arguments: 'interface',
        input: 'interface',
        scalar: 'type',
      },
      ...(additionalConfig || {}),
    } as TParsedConfig);
    autoBind(this);

    const enumNames = Object.values(schema.getTypeMap())
      .map(type => (type instanceof GraphQLEnumType ? type.name : undefined))
      .filter(t => t);
    this.setArgumentsTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName,
        this.config.avoidOptionals.object,
        this.config.immutableTypes,
        null,
        enumNames,
        this.config.enumPrefix,
        this.config.enumValues
      )
    );
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
    });
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    let declarationBlock = this.getObjectTypeDeclarationBlock(node, originalNode);
    if (GRAPHQL_TYPES.indexOf((node.name as unknown) as string) === -1) {
      // Add type-graphql ObjectType decorator
      const interfaces = originalNode.interfaces.map(i => this.convertName(i));
      let decoratorOptions = '';
      if (interfaces.length > 1) {
        decoratorOptions = `{ implements: [${interfaces.join(', ')}] }`;
      } else if (interfaces.length === 1) {
        decoratorOptions = `{ implements: ${interfaces[0]} }`;
      }
    }

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    let declarationBlock = this.getInputObjectDeclarationBlock(node);

    return declarationBlock.string;
  }

  getArgumentsObjectDeclarationBlock(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(field.arguments.map(argument => this.InputValueDefinition(argument)).join('\n'));
  }

  getArgumentsObjectTypeDefinition(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): string {
    let declarationBlock = this.getArgumentsObjectDeclarationBlock(node, name, field);

    return declarationBlock.string;
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as InterfaceTypeDefinitionNode;

    let declarationBlock = this.getInterfaceTypeDeclarationBlock(node, originalNode);

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  buildTypeString(type: Type): string {
    if (!type.isArray && !type.isScalar && !type.isNullable) {
      type.type = `FixDecorator<${type.type}>`;
    }
    if (type.isScalar) {
    }
    if (type.isArray) {
      type.type = `Array<${type.type}>`;
    }
    if (type.isNullable) {
      type.type = `Maybe<${type.type}>`;
    }

    return type.type;
  }

  parseType(rawType: TypeNode | string): Type {
    const typeNode = rawType as TypeNode;
    if (typeNode.kind === 'NamedType') {
      return {
        type: typeNode.name.value,
        isNullable: true,
        isArray: false,
        isScalar: SCALARS.includes(typeNode.name.value),
      };
    } else if (typeNode.kind === 'NonNullType') {
      return {
        ...this.parseType(typeNode.type),
        isNullable: false,
      };
    } else if (typeNode.kind === 'ListType') {
      return {
        ...this.parseType(typeNode.type),
        isArray: true,
        isNullable: true,
      };
    }

    const isNullable = !!(rawType as string).match(MAYBE_REGEX);
    const nonNullableType = (rawType as string).replace(MAYBE_REGEX, '$1');
    const isArray = !!nonNullableType.match(ARRAY_REGEX);
    const singularType = nonNullableType.replace(ARRAY_REGEX, '$1');
    const isScalar = !!singularType.match(SCALAR_REGEX);
    const type = singularType.replace(SCALAR_REGEX, (match, type) => {
      if (TYPE_GRAPHQL_SCALARS.includes(type)) {
        // This is a TypeGraphQL type
        return `TypeGraphQL.${type}`;
      } else if ((global as any)[type]) {
        // This is a JS native type
        return type;
      } else if (this.scalars[type]) {
        // This is a type specified in the configuration
        return this.scalars[type];
      } else {
        throw new Error(`Unknown scalar type ${type}`);
      }
    });

    return {type, isNullable, isArray, isScalar};
  }

  fixDecorator(type: Type, typeString: string) {
    return type.isArray || type.isNullable || type.isScalar ? typeString : `FixDecorator<${typeString}>`;
  }

  FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string {
    let typeString = (node.type as any) as string;
    const comment = transformComment((node.description as any) as string, 1);

    const type = this.parseType(typeString);

    typeString = this.fixDecorator(type, typeString);

    return comment + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}: ${typeString};`);
  }

  InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string {
    let rawType = node.type as TypeNode | string;
    const comment = transformComment((node.description as any) as string, 1);

    const type = this.parseType(rawType);
    const nameString = (node.name as NameNode).kind ? (node.name as NameNode).value : node.name;
    const typeString = (rawType as TypeNode).kind
      ? this.buildTypeString(type)
      : this.fixDecorator(type, rawType as string);

    return comment + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${nameString}: ${typeString};`);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    return super.EnumTypeDefinition(node) + `\n`;
  }
}
