// Steps for OP-03: runs ./run.sh as a developer would.

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { chmod, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCommand, type Result } from './run-command.ts';

type World = { path: string | undefined; result: Result };

Given('the installed Node is version {int}', async function (this: World, version: number) {
  // A fake `node` placed first on PATH, which only prints its version.
  const dir = await mkdtemp(join(tmpdir(), 'node-'));
  await writeFile(join(dir, 'node'), `#!/bin/sh\necho v${version}.0.0\n`);
  await chmod(join(dir, 'node'), 0o755);
  this.path = `${dir}:${process.env.PATH}`;
});

When('I run {string}', async function (this: World, commandLine: string) {
  const [command, ...args] = commandLine.split(' ');
  this.result = await runCommand(command, args, this.path ? { PATH: this.path } : {});
});

Then('it lists the commands {string}, {string} and {string}', function (this: World, a: string, b: string, c: string) {
  for (const command of [a, b, c]) assert.match(this.result.output, new RegExp(`^  ${command} `, 'm'));
});

Then('it fails with {string}', function (this: World, message: string) {
  assert.notEqual(this.result.code, 0);
  assert.match(this.result.output, new RegExp(message));
});

Then('it reports that no test failed', function (this: World) {
  assert.match(this.result.output, /^ℹ fail 0$/m);
});
