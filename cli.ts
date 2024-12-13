import yargs from 'https://deno.land/x/yargs/deno.ts';
import { setupCommand } from './commands/setup.ts';

console.log('Welcome to the Camunda CLI!');

yargs(Deno.args)
  .scriptName('csap')
  .command(setupCommand)
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .parse(Deno.args); // Ensure Deno.args is passed to parse()