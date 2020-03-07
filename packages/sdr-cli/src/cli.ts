import * as prettier from 'prettier/standalone';
import * as prettierGQL from 'prettier/parser-graphql';
import * as yargs from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import {PluginBody, PluginDetails, processPlugin, SDRConfig} from '@sdr/core';
import {globFileContents} from './utils/globFileContents';

export async function cli() {
  if (yargs.argv._.some(a => a === 'init')) {
    await init();
    return;
  }
  if (yargs.argv._.some(a => a === 'schema' || a === 'base')) {
    await emitSchema(yargs.argv.schema as string);
    return;
  }
  if (yargs.argv._.some(a => a === 'watch' || a === 'w')) {
    console.log('Watching files...');
    await run(true);
    return;
  }
  if (yargs.argv._.some(a => a === 'build' || a === 'b')) {
    console.log('Building files...');
    await run(false);
    return;
  }
  console.log('Usage: ');
  console.log(' sdr init');
  console.log('     Initialize the project with an sdr.yaml and update your package.json');
  console.log(' sdr schema');
  console.log('     Pulls down the base schema from your plugins for better IDE support');
  console.log(' sdr build');
  console.log('     Runs the generator based on your configuration');
  console.log(' sdr build');
  console.log('     Watches your graphql schema and runs the generator automatically');
}

async function emitSchema(location: string) {
  console.log('Emitting base schema from plugins');
  const currentDirectory = process.cwd();

  const configPath = path.join(currentDirectory, 'sdr.yaml');
  if (!fs.existsSync(configPath)) {
    throw 'Could not find sdr.yaml in this directory';
  }

  const sdrConfig = YAML.parse(fs.readFileSync(configPath, {encoding: 'utf8'})) as SDRConfig;
  sdrConfig.config = sdrConfig.config || {};

  const schemas: {schema: string; name: string}[] = [];
  for (const outputFile in sdrConfig.generates) {
    const pluginBodies = await getPluginBodies(outputFile, sdrConfig);
    for (const pluginBody of pluginBodies) {
      if (schemas.some(a => a.name === pluginBody.name)) {
        continue;
      }
      schemas.push({name: pluginBody.name, schema: pluginBody.body.schema});
    }
  }
  sdrConfig.ignoreSchema = location;

  fs.writeFileSync(configPath, YAML.stringify(sdrConfig), {encoding: 'utf8'});
  fs.writeFileSync(
    location,
    prettier.format(schemas.map(a => a.schema).join('\r\n'), {parser: 'graphql', plugins: [prettierGQL]}),
    {
      encoding: 'utf8',
    }
  );
}

async function init() {
  const currentDirectory = process.cwd();

  if (fs.existsSync(path.join(currentDirectory, 'sdr.yaml'))) {
    console.log('An sdr.yaml file already exists.');
    return;
  }

  let hasPrettier = false;
  if (fs.existsSync(path.join(currentDirectory, '.prettierrc'))) {
    hasPrettier = true;
  }

  fs.writeFileSync(
    path.join(currentDirectory, 'sdr.yaml'),
    `
schema: ./*.graphql                      # change this to your schema location
${hasPrettier ? 'prettier: ./.prettierrc' : ''}
config:
generates:
  src/models.ts:                         # add plugins to generate new code
    plugins:
      - @sdr/models
`,
    {encoding: 'utf8'}
  );

  const packageJson = JSON.parse(fs.readFileSync(path.join(currentDirectory, 'package.json'), {encoding: 'utf8'}));
  const dev = packageJson.devDependencies || {};
  packageJson.devDependencies = dev;
  packageJson.devDependencies['@sdr/controller'] = 'latest';
  packageJson.devDependencies['@sdr/models'] = 'latest';
  fs.writeFileSync(path.join(currentDirectory, 'package.json'), {encoding: 'utf8'});

  console.log('An sdr.yaml file has been created.');
}

async function getPluginBodies(outputFile: string, sdrConfig: SDRConfig): Promise<PluginDetails[]> {
  const config = sdrConfig.generates[outputFile];
  const {plugins} = config;

  const pluginDetails: PluginDetails[] = [];
  for (const plugin of plugins) {
    if (plugin.includes('!')) {
      let name = plugin.split('!')[0];
      let type = plugin.split('!')[1];
      if (type !== 'schema') {
        throw 'Error: Bang syntax can only be used to import schema only';
      }
      let details = {
        name: name,
        method: 'index',
        body: getPlugin(name, 'index'),
      };
      details.body.plugin = () => '';
      pluginDetails.push(details);
    } else if (plugin.includes('#')) {
      let name = plugin.split('#')[0];
      let method = plugin.split('#')[1];
      pluginDetails.push({
        name: name,
        method: method,
        body: getPlugin(name, method),
      });
    } else {
      pluginDetails.push({name: plugin, method: 'index', body: getPlugin(plugin, 'index')});
    }
  }

  for (let i = pluginDetails.length - 1; i >= 0; i--) {
    const pluginBody = pluginDetails[i];
    // console.log('Adding Plugin: ' + pluginBody.name, pluginBody.body.config);
    if (pluginBody.body.config.dependsOn) {
      for (const dependency of pluginBody.body.config.dependsOn) {
        if (pluginDetails.some(p => p.name === dependency)) {
          continue;
        }
        // console.log('Adding Plugin: ' + dependency);
        pluginDetails.push({name: dependency, method: 'index', body: getPlugin(dependency, 'index')});
        //todo support better recursive
      }
    }
  }
  return pluginDetails;
}

async function run(watch: boolean) {
  const currentDirectory = process.cwd();

  const configPath = path.join(currentDirectory, 'sdr.yaml');
  if (!fs.existsSync(configPath)) {
    throw 'Could not find sdr.yaml in this directory';
  }
  const sdrConfig = YAML.parse(fs.readFileSync(configPath, {encoding: 'utf8'})) as SDRConfig;
  sdrConfig.config = sdrConfig.config || {};

  globFileContents(sdrConfig.schema, sdrConfig.ignoreSchema, watch, async contents => {
    const schemaContent = contents.join('\n');

    for (const outputFile in sdrConfig.generates) {
      console.log(`Processing file: ${outputFile}`);
      const pluginBodies = await getPluginBodies(outputFile, sdrConfig);

      let schemaWithPlugins = schemaContent;

      for (const pluginBody of pluginBodies) {
        schemaWithPlugins = pluginBody.body.schema + '\r\n' + schemaWithPlugins;
      }

      let outputResult = processPlugin(
        schemaWithPlugins,
        pluginBodies,
        sdrConfig,
        sdrConfig.prettier &&
          (outputFile.endsWith('.js') ||
            outputFile.endsWith('.ts') ||
            outputFile.endsWith('.jsx') ||
            outputFile.endsWith('.tsx')),
        sdrConfig.prettier && readJson(path.join(process.cwd(), sdrConfig.prettier))
      );
      if (!fs.existsSync(path.dirname(outputFile))) {
        fs.mkdirSync(path.dirname(outputFile), {recursive: true});
      }
      fs.writeFileSync(outputFile, outputResult, {encoding: 'utf8'});
    }
  });
}

export function getPlugin(moduleName: string, file: string): PluginBody {
  let loadedModule = require('import-from')(process.cwd(), moduleName);

  if (!loadedModule) {
    throw 'Could not find plugin: ' + moduleName;
  }

  if (file !== 'index') {
    loadedModule = {
      plugin: loadedModule[file + 'Plugin'],
      config: loadedModule[file + 'Config'],
    };
  }
  if (!loadedModule.plugin || !loadedModule.config) {
    throw `Could not find plugin: ${moduleName}/${file}`;
  }

  const schema = fs.readFileSync(path.join(process.cwd(), 'node_modules', moduleName, 'schema.graphql'), {
    encoding: 'utf8',
  });
  return {config: loadedModule.config, plugin: loadedModule.plugin, schema};
}

const readJson = (path: string) => {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
  }
  return null;
};
