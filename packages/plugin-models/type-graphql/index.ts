import {Types, PluginFunction} from '@graphql-codegen/plugin-helpers';
import {parse, printSchema, visit, GraphQLSchema} from 'graphql';
import {TypeGraphQLVisitor} from './visitor';
import {TsIntrospectionVisitor, includeIntrospectionDefinitions} from '@graphql-codegen/typescript';
import {TypeGraphQLPluginConfig} from './config';

export {TypeGraphQLPluginParsedConfig} from './visitor';

const DECORATOR_FIX = `type FixDecorator<T> = T;`;
const isDefinitionInterface = (definition: string) => definition.indexOf('@TypeGraphQL.InterfaceType()') !== -1;

export const plugin: PluginFunction<TypeGraphQLPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeGraphQLPluginConfig
) => {
  const visitor = new TypeGraphQLVisitor(schema, config);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const maybeValue = `export type Maybe<T> = ${visitor.config.maybeValue};`;
  const visitorResult = visit(astNode, {leave: visitor});
  const introspectionDefinitions = includeIntrospectionDefinitions(schema, documents, config);
  const scalars = visitor.scalarsDefinition;

  let definitions = visitorResult.definitions;
  // Sort output by interfaces first, classes last to prevent TypeScript errors
  definitions.sort((definition1: any, definition2: any) => (isDefinitionInterface(definition1) ? -1 : 1));

  return {
    prepend: [...visitor.getEnumsImports(), maybeValue, DECORATOR_FIX],
    content: [scalars, ...definitions, ...introspectionDefinitions].join('\n'),
  };
};

export {TypeGraphQLVisitor, TsIntrospectionVisitor};
