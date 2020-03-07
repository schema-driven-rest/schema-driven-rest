import * as prettier from 'prettier/standalone';
import * as prettierTS from 'prettier/parser-typescript';
import {buildSchema, ObjectTypeDefinitionNode, parse} from 'graphql';
import {PluginConfig, PluginFunction, PluginOptions} from './plugins/pluginOptions';
import {buildType} from './actions';

export type PluginBody = {config: PluginConfig; plugin: PluginFunction; schema: string};

export function processPlugin(
  schemaWithPlugins: string,
  pluginBodies: {name: string; method: string; body: PluginBody}[],
  sdrConfig: SDRConfig,
  processPrettier: boolean,
  prettierOptions: any
) {
  const schema = buildSchema(schemaWithPlugins);
  const document = parse(schemaWithPlugins);

  let pluginOptions: PluginOptions = {
    schema,
    document,
    schemaString: schemaWithPlugins,
    types: document.definitions
      .filter(a => a.kind === 'ObjectTypeDefinition')
      .map(a => buildType(a as ObjectTypeDefinitionNode)),
  };

  let outputResult = '';
  for (const pluginBody of pluginBodies) {
    outputResult +=
      pluginBody.body.plugin(
        pluginOptions,
        sdrConfig.config[pluginBody.name + (pluginBody.method === 'index' ? '' : +'#' + pluginBody.method)] || {}
      ) ?? '';
    outputResult += '\r\n';
  }

  if (processPrettier) {
    prettierOptions.parser = 'typescript';
    if (prettierOptions) {
      outputResult = prettier.format(outputResult, {...prettierOptions, plugins: [prettierTS]});
    }
  }

  return outputResult;
}

export type SDRConfig = {
  schema: string;
  ignoreSchema?: string;
  prettier?: string;
  config: {[puginName: string]: {[entry: string]: string}};
  generates: {[name: string]: {plugins: string[]}};
};
