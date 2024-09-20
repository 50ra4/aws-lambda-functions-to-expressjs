import express from 'express';
import { Command } from 'commander';
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const getOptions = () =>
  new Command()
    .requiredOption(
      '-t, --template [relative template json filepath]',
      'Specify the template json file path.',
    )
    .option(
      '-p, --port [port number]',
      'Specify express.js port number.',
      '3000',
    )
    .parse(process.argv)
    .opts();

type Target = {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  file: string;
};

const main = () => {
  const port = +getOptions()['port'];
  const templatePath: string = resolve(getOptions()['template']);

  if (!existsSync(templatePath)) {
    throw new Error(`not found template file.(${templatePath})`);
  }

  const targets: Target[] = JSON.parse(readFileSync(templatePath, 'utf-8'));
  console.info('==== targets', targets);

  const app: express.Express = express();
  app.get('/', (_req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

try {
  main();
} catch (error) {
  console.error(error);
}
