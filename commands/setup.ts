import { CommandModule } from 'https://deno.land/x/yargs/deno-types.ts';
import { prompt } from '../prompt.ts';

import { btpIntegration } from "./modules/btp_integration.ts";
import { odataConnector } from "./modules/odata_connector.ts";
import { rfcConnector } from "./modules/rfc_connector.ts";

export const setupCommand: CommandModule = {
  command: 'setup',
  describe: 'Set up Camunda options',
  builder: (yargs) => {
    return yargs
      .option('version', {
        alias: 'v',
        type: 'string',
        description: 'Camunda version',
        choices: ['8.7', '8.6', '8.5'],
        default: '8.7',
      })
      .option('deployment', {
        alias: 'd',
        type: 'string',
        description: 'Camunda deployment option',
        choices: ['SaaS'], // 'Self-Managed' option deactivated
        default: 'SaaS',
      })
      .option('module', {
        alias: 'm',
        type: 'string',
        description: 'SAP integration module',
        choices: ['BTP integration', 'OData connector', 'RFC connector'],
      });
  },
  handler: async (argv) => {
    const version = argv.version || await prompt('Camunda version (8.7, 8.6, 8.5) [8.7]: ', '8.7');
    const deployment = argv.deployment || await prompt('Deployment option (SaaS) [SaaS]: ', 'SaaS');
    const module = argv.module || await prompt('SAP integration module (BTP integration, OData connector, RFC connector): ');
  
    console.log(`Selected Camunda version: ${version}`);
    console.log(`Selected deployment option: ${deployment}`);
    console.log(`Selected SAP integration module: ${module}`);
  
    if (module === 'BTP integration') {
      btpIntegration();
    } else if (module === 'OData connector') {
      odataConnector();
    } else if (module === 'RFC connector') {
      rfcConnector();
    }
  },
};