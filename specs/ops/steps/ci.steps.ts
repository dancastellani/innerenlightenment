// Steps for OP-04: reads the workflow files in .github/workflows and checks what they do.

import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

type World = { workflow: string };

// Returns the text of the workflow whose first line is `name: <name>`.
function workflow(name: string): string {
  for (const file of readdirSync('.github/workflows')) {
    const text = readFileSync(`.github/workflows/${file}`, 'utf8');
    if (text.startsWith(`name: ${name}\n`)) return text;
  }
  throw new Error(`no workflow named "${name}"`);
}

Then('the {string} workflow runs on every pull request and every push to main', function (this: World, name: string) {
  this.workflow = workflow(name);
  assert.match(this.workflow, /^ {2}pull_request:/m);
  assert.match(this.workflow, /^ {2}push:\n {4}branches: \[main\]/m);
});

Then('it runs {string}', function (this: World, command: string) {
  assert.ok(this.workflow.includes(`run: ${command}\n`), `missing "run: ${command}"`);
});

Then('the {string} workflow is started by hand', function (this: World, name: string) {
  this.workflow = workflow(name);
  assert.match(this.workflow, /^on:\n {2}workflow_dispatch:/m);
});

Then('it opens a pull request that changes only {string}', function (this: World, path: string) {
  assert.match(this.workflow, /uses: peter-evans\/create-pull-request@/);
  assert.match(this.workflow, new RegExp(`^ +add-paths: ${path}$`, 'm'));
});
