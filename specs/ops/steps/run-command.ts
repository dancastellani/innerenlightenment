// Runs a command from the repository root and collects its exit code and output,
// with the steps that check the result, shared by every feature.

import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

export type Result = { code: number; output: string };

export function runCommand(command: string, args: string[], env: Record<string, string> = {}): Promise<Result> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { env: { ...process.env, ...env } });
    let output = '';
    child.stdout.on('data', (data) => (output += data));
    child.stderr.on('data', (data) => (output += data));
    child.on('close', (code) => resolve({ code: code ?? 1, output }));
  });
}

Then('it succeeds', function (this: { result: Result }) {
  assert.equal(this.result.code, 0, this.result.output);
});

Then('it fails', function (this: { result: Result }) {
  assert.notEqual(this.result.code, 0, this.result.output);
});
