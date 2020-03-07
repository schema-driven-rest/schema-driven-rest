import * as prettier from 'prettier/standalone';
import * as prettierTS from 'prettier/parser-typescript';
import {buildSchema, ObjectTypeDefinitionNode, parse} from 'graphql';
import {PluginConfig, PluginFunction, PluginOptions} from './plugins/pluginOptions';
import {buildType} from './actions';

export type PluginBody = {config: PluginConfig; plugin: PluginFunction; schema: string};
export type PluginDetails = {name: string; method: string; body: PluginBody};

export function processPlugin(
  schemaWithPlugins: string,
  pluginDetails: PluginDetails[],
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
  if (pluginOptions.types.length === 0) {
    throw 'Error: No types found in schema.';
  }
  console.log(`  ${pluginOptions.types.length} types being processed`);

  let outputResult = '';
  for (const pluginDetail of pluginDetails) {
    let pluginName = pluginDetail.name + (pluginDetail.method === 'index' ? '' : +'#' + pluginDetail.method);
    let configOptions = sdrConfig.config[pluginName] || {};
    const requiredParameters = pluginDetail.body.config.requiredParameters ?? [];
    for (const requiredParameter of requiredParameters) {
      if (!configOptions[requiredParameter]) {
        throw `Error: ${pluginName} Requires the config parameter ${requiredParameter}.`;
      }
    }
    outputResult += pluginDetail.body.plugin(pluginOptions, configOptions) ?? '';
    outputResult += '\r\n';
  }

  if (processPrettier) {
    prettierOptions.parser = 'typescript';
    outputResult = prettier.format(outputResult, {...prettierOptions, plugins: [prettierTS]});
  }
  console.log(`  ${outputResult.length} bytes written`);

  return outputResult;
}

export type SDRConfig = {
  schema: string;
  ignoreSchema?: string;
  prettier?: string;
  config: {[puginName: string]: {[entry: string]: string}};
  generates: {[name: string]: {plugins: string[]}};
};
