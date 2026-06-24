import yargs from "yargs"
import { setupCommand } from "./commands/setup.ts"

console.log(
  `
Welcome to csap - Camunda’s SAP Integration CLI

https://docs.camunda.io/docs/components/camunda-integrations/sap/csap-cli/

  __      __   _   ___ 
 / _| __ / _| / \\ | o \\
| |_  __ \\_ \\| o ||  _/
 \\__|    |__/|_n_||_|  
                                 
`)

yargs(Deno.args)
  .wrap(null)
  .scriptName("csap")
  .usage("Usage: \n  $0 <command>")
  .version(
    (await import("./deno.json", {
      with: { type: "json" },
    })).default.version,
  )
  .alias("version", "v")
  .command(setupCommand)
  .demandCommand(1, "Choose a command to continue (Ex: csap setup)")
  .strict()
  .help()
  .alias("help", "h")
  .parse()
