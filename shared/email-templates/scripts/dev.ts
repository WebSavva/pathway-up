import { createServer } from 'node:http';

import {
  createApp,
  send,
  getRouterParam,
  toNodeListener,
  createRouter,
  setResponseHeader,
  fromNodeMiddleware,
  eventHandler,
  getQuery,
} from 'h3';
import serveStatic from 'serve-static';
import { staticPath } from '@pathway-up/static';
import toKebabCase from 'lodash-es/kebabCase';

import * as emailTemplates from '../src';
import type { createTemplate } from '../src/utils/template';

const emailTemplatesMap = Object.fromEntries(
  Object.entries(emailTemplates).map(([camelCasedName, template]) => {
    return [
      toKebabCase(camelCasedName.replace(/EmailTemplate$/, '')),
      template,
    ];
  }),
) as Record<string, ReturnType<typeof createTemplate>>;

const app = createApp();

app.use(
  eventHandler((event) => {
    setResponseHeader(event, 'Cache-Control', 'no-store');
  }),
);

app.use(fromNodeMiddleware(serveStatic(staticPath)));

const router = createRouter()
  .get(
    '/templates/:id',
    eventHandler((event) => {
      const id = getRouterParam(event, 'id');

      const template = emailTemplatesMap[id!];

      const query = getQuery(event);

      const { text } = template(query);

      return send(event,text, 'text/html;charset=utf-8');
    }),
  )
  .get(
    '/',
    eventHandler((event) => {
      const templateNames = Object.keys(emailTemplatesMap);

      const pageLinks = templateNames
        .map((name) => {
          return `<a href="/templates/${name}">${name}</a>`;
        })
        .join('\n');

      return send(event, pageLinks, 'text/html;charset=utf-8');
    }),
  );

app.use(router);

export const startDevServer = () =>
  createServer(toNodeListener(app)).listen(3e3, () =>
    console.log('Server is up and running !'),
  );

startDevServer();
