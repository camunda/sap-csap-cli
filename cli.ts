import yargs from "https://deno.land/x/yargs/deno.ts"
import { setupCommand } from "./commands/setup.ts"

console.log(
  "\nWelcome to %cCamunda's %cSAP %cIntegration CLI (csap)!",
  "color: orange",
  "color: blue",
  "color: auto",
)
console.log(
  `
%c  *@#%       %c  
%c :@* :@      %c/////////////////////     
%c :@*         %c(    ((  ((     (((        
%c :@*         %c(    (    (               
%c :@* :@      %c#      ##    #            
%c  #@*%       %c###########     
                
%c :=====:         
 :=====:         
`,
  "color:orange",
  "color: blue",
  "color:orange",
  "color: blue",
  "color:orange",
  "color: blue",
  "color:orange",
  "color: blue",
  "color:orange",
  "color: blue",
  "color:orange",
  "color: blue",
  "color: auto",
)

yargs(Deno.args)
  .scriptName("csap")
  .version(
    (await import("./deno.json", {
      with: { type: "json" },
    })).default.version,
  )
  .command(setupCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .help()
  .parse()
