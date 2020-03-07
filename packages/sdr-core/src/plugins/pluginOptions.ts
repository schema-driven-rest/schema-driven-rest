import {DocumentNode, GraphQLSchema} from 'graphql';

export type Type = {
  name: string;
  directives: TypeDirective[];
  methods: TypeMethod[];
};

export type NamedArgument = {name: string; defaultValue?: any} & Argument;
export type Argument = {type: string; array: boolean; nonNull: boolean};
export type TypeMethod = {
  name: string;
  arguments: Argument[];
  returnType: Argument;
  directives: TypeDirective[];
};

export type TypeDirective = {
  name: string;
  parameters: {name: string; value: string}[];
};

export type PluginOptions = {
  schema: GraphQLSchema;
  document: DocumentNode;
  schemaString: string;
  types: Type[];
};

export type PluginConfig = {
  dependsOn?: string[];
  requiredParameters?: string[];
};

export type PluginFunction = (options: PluginOptions, config: any) => string;
