#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('solwink')
  .description('Interactive CLI to scaffold production-ready Solana Actions/Blinks')
  .version('1.0.0');

program.action(async () => {
  console.log(chalk.cyan('\n Welcome to the SolWink - Solana Blink Generator! 🌊\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateType',
      message: 'Which Blink template would you like to scaffold?',
      choices: [
        { name: '💰 SOL Donation (Crowdfund)', value: 'donation' },
        { name: '🖼️ NFT Mint (Metaplex Candy Machine', value: 'nft-mint'}
      ]
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: 'my-solana-blink',
    },
    {
    type: 'input',
    name: 'treasuryWallet',
    message: 'Enter the destination wallet address (to receive funds):',
    when: (answers) => answers.templateType === 'donation',
    validate: (input) => input.length >= 32 || 'Please enter a valid Solana public key.',
    },
    {
    type: 'input',
    name: 'candyMachineID',
    message: 'Enter your Metaplex Candy Machine Id:',
    when: (answers) => answers.templateType === 'nft-mint',
    validate: (input) => input.length >= 32 || 'Please enter a valid Solana public key'
        }
  ]);

  const targetPath = path.join(process.cwd(), answers.projectName);
  
  const templatePath = path.join(__dirname, `../templates/${answers.templateType}`);

  console.log(chalk.blue(`\nScaffolding ${answers.templateType} Blink in ${targetPath}...`));

  try {
    await fs.copy(templatePath, targetPath);

    if (answers.templateType == 'donation') {
    const routePath = path.join(targetPath, 'api/index.ts');
    
    if (await fs.pathExists(routePath)) {
      let routeContent = await fs.readFile(routePath, 'utf8');
      
      routeContent = routeContent.replace(
        '{{TREASURY_WALLET}}', 
        answers.treasuryWallet
      );
      
      await fs.writeFile(routePath, routeContent);
    } }

    else if (answers.templateType == 'nft-mint') {
        const routePath = path.join(targetPath, 'api/index.ts');

        if (await fs.pathExists(routePath)) {
            let routeContent = await fs.readFile(routePath, 'utf-8');

            routeContent = routeContent.replace(
                '{{CANDY_MACHINE_ID}}',
                answers.candyMachineID
            );

            await fs.writeFile(routePath, routeContent)
        }
    }

    console.log(chalk.green('\n✅ Success! Your production-ready Blink is generated.'));
    console.log(chalk.yellow(`\nNext steps:\n  cd ${answers.projectName}\n  npm install\n  npm run dev\n`));

  } catch (err) {
    console.error(chalk.red('\n❌ Failed to generate project:'), err);
  }
});

program.parse(process.argv);