import yargs from "https://deno.land/x/yargs/deno.ts"
import { setupCommand } from "./commands/setup.ts"

console.log(
  `
Welcome to csap - Camunda’s SAP Integration CLI`,
)
console.log(
  "https://docs.camunda.io/docs/components/camunda-integrations/sap/csap-cli.md",
)
console.log(
  ` 
  __      __   _   ___ 
 / _| __ / _| / \\ | o \\
| |_  __ \\_ \\| o ||  _/
 \\__|    |__/|_n_||_|  
                                 
`,
)

yargs(Deno.args)
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
