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

const createTargetHandler =
  (target: Target): express.RequestHandler =>
  async (req, res, next) => {
    const pathParameters = req.params;
    const queryStringParameters = req.params;
    const body = req.body;
    const event = { pathParameters, queryStringParameters, body };

    const { file, method, endpoint } = target;
    const filepath = resolve(file);

    console.log(`[${method}] ${endpoint} called.`, event, {
      ...target,
      filepath,
    });

    try {
      if (!existsSync(filepath)) {
        throw new Error(`not found file.(${filepath})`);
      }

      const { handler } = await import(filepath);
      if (!handler) {
        throw new Error(`not found handler.(${filepath})`);
      }

      const payload = await handler(event);
      res.status(200).json(payload);
    } catch (error) {
      console.error('failed handler.', error, target, event);
      next(error);
    }
  };

const errorHandler: express.ErrorRequestHandler = (err, _req, res) => {
  console.error(err);
  res.status(500).json({ message: 'something wrong.' });
};

const main = async () => {
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

  targets.forEach((target) => {
    const handler = createTargetHandler(target);

    const { method, endpoint } = target;
    // e.g.) "/foo/{id}"->"/foo/:id"
    const route = endpoint.replace(/{(\w+)}/g, ':$1');

    switch (method) {
      case 'GET':
        app.get(route, handler);
        break;
      case 'POST':
        app.post(route, handler);
        break;
      case 'PATCH':
        app.patch(route, handler);
        break;
      case 'PUT':
        app.put(route, handler);
        break;
      case 'DELETE':
        app.delete(route, handler);
        break;
      default:
        console.warn('not match target.', target);
        break;
    }
  });

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main().catch((e) => console.error(e));
