import { readCachedProjectGraph } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const argsObj = process.argv.slice(2).reduce((acc, arg) => {
  const key = arg.split('=')[0].replace('--', '');
  const value = arg.split('=')[1];
  acc[key] = value;
  return acc;
}, {});
console.log('argsObj: ', argsObj);

if (!argsObj.name) {
  console.error(
    `missing args or env - name: ${argsObj.name}, NPM_AUTH_TOKEN: ${process.env.NPM_AUTH_TOKEN}`
  );
  process.exit(1);
}

const graph = readCachedProjectGraph();
const project = graph.nodes[argsObj.name];

console.log('project', project);
if (!project) {
  console.error(
    `Could not find project "${argsObj.name}" in the workspace. Is the project.json configured correctly?`
  );
  process.exit(1);
}

const outputPath = project.data?.targets?.build?.options?.outputPath;

if (!project) {
  console.error(
    `Could not find "build.options.outputPath" of project "${argsObj.name}". Is project.json configured  correctly?`
  );
  process.exit(1);
}

process.chdir(outputPath);

// Updating the version in "package.json" before publishing
try {
  const json = JSON.parse(readFileSync(`package.json`).toString());
  //   json.version = version;
  //   writeFileSync(`package.json`, JSON.stringify(json, null, 2));

  console.log('current version', json.version);
} catch (e) {
  console.error(
    chalk.bold.red(`Error reading package.json file from library build output.`)
  );
}

// Execute "npm publish" to publish
execSync(`npm publish --access public --tag latest`);
