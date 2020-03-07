import {ObjectTypeDefinitionNode, TypeNode, ValueNode} from 'graphql';
import {Type, Argument, NamedArgument} from './plugins/pluginOptions';
import {DirectiveNode, InputValueDefinitionNode} from 'graphql/language/ast';

function evaluateValueNode(value: ValueNode): any {
  switch (value.kind) {
    case 'Variable':
      throw 'variable not supported';
    case 'IntValue':
      return parseInt(value.value);
    case 'FloatValue':
      return parseFloat(value.value);
    case 'StringValue':
      return value.value;
    case 'BooleanValue':
      return value.value;
    case 'NullValue':
      return null;
    case 'EnumValue':
      return value.value;
    case 'ListValue':
      return value.values.map(evaluateValueNode);
    case 'ObjectValue':
      return value.fields.reduce((previousValue, currentValue) => {
        return {...previousValue, [currentValue.name.value]: evaluateValueNode(currentValue.value)};
      }, {});
  }
}

function getArgument(type: TypeNode): Argument {
  switch (type.kind) {
    case 'NamedType':
      return {
        type: type.name.value,
        array: false,
        nonNull: false,
      };
    case 'ListType':
      return {
        ...getArgument(type.type),
        array: true,
      };
    case 'NonNullType':
      return {
        ...getArgument(type.type),
        nonNull: true,
      };
  }
}

function getNamedArgument(node: InputValueDefinitionNode): NamedArgument {
  return {
    ...getArgument(node.type),
    name: node.name.value,
    defaultValue: node.defaultValue ? evaluateValueNode(node.defaultValue) : undefined,
  };
}

function getDirective(directive: DirectiveNode) {
  return {
    name: directive.name.value,
    parameters: directive.arguments?.map(param => ({
      name: param.name.value,
      value: evaluateValueNode(param.value),
    })),
  };
}

export function buildType(definition: ObjectTypeDefinitionNode): Type {
  return {
    name: definition.name.value,
    directives: definition.directives?.map(getDirective) ?? [],
    methods: definition.fields.map(field => ({
      name: field.name.value,
      arguments: field.arguments.map(getNamedArgument),
      returnType: getArgument(field.type),
      directives: field.directives?.map(getDirective) ?? [],
    })),
  };
}
