// Steps for OP-03: runs ./run.sh as a developer would.

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { chmod, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCommand, type Result } from './run-command.ts';

type World = { path: string | undefined; result: Result };

// Puts a fake command first on PATH: a tiny shell script that runs `script` instead of the real one.
async function fakeCommand(world: World, name: string, script: string) {
  const dir = await mkdtemp(join(tmpdir(), `${name}-`));
  await writeFile(join(dir, name), `#!/bin/sh\n${script}\n`);
  await chmod(join(dir, name), 0o755);
  world.path = `${dir}:${world.path ?? process.env.PATH}`;
}

Given('the installed Node is version {int}', async function (this: World, version: number) {
  await fakeCommand(this, 'node', `echo v${version}.0.0`);
});

Given("Cucumber is replaced by a stand-in, so these specs don't start themselves", async function (this: World) {
  await fakeCommand(this, 'npx', 'echo "stand-in npx $@"');
});

Given('npm and Expo are replaced by stand-ins, so nothing is installed or built', async function (this: World) {
  await fakeCommand(this, 'npm', 'echo "stand-in npm $@ in $(pwd)"');
  await fakeCommand(this, 'npx', 'echo "stand-in npx $@"');
});

When('I run {string}', async function (this: World, commandLine: string) {
  const [command, ...args] = commandLine.split(' ');
  this.result = await runCommand(command, args, this.path ? { PATH: this.path } : {});
});

Then(
  'it lists the commands {string}, {string}, {string} and {string}',
  function (this: World, a: string, b: string, c: string, d: string) {
    for (const command of [a, b, c, d]) assert.match(this.result.output, new RegExp(`^  ${command} `, 'm'));
  },
);

Then('it fails with {string}', function (this: World, message: string) {
  assert.notEqual(this.result.code, 0);
  assert.match(this.result.output, new RegExp(message));
});

Then('it reports that no test failed', function (this: World) {
  assert.match(this.result.output, /^ℹ fail 0$/m);
});

Then('it starts Cucumber on {string}', function (this: World, folder: string) {
  assert.ok(this.result.output.includes(`stand-in npx cucumber-js ${folder} `), this.result.output);
});

Then('it starts an Expo build of the Android app with the {string} profile', function (this: World, profile: string) {
  const command = `stand-in npx --yes eas-cli@latest build --platform android --profile ${profile}`;
  assert.ok(this.result.output.includes(command), this.result.output);
});

Then('it runs {string} in the repository and in the app', function (this: World, command: string) {
  const root = process.cwd();
  assert.ok(this.result.output.includes(`stand-in ${command} in ${root}\n`), this.result.output);
  assert.ok(this.result.output.includes(`stand-in ${command} in ${join(root, 'mobile')}\n`), this.result.output);
});
