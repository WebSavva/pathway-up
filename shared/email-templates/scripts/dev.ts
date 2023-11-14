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

import { templates, TemplateName } from '../src';

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

      const template = templates[id! as TemplateName];

      const query = getQuery(event);

      const { html } = template(
        query as unknown as Parameters<typeof template>[0],
      );

      return send(event, html, 'text/html;charset=utf-8');
    }),
  )
  .get(
    '/',
    eventHandler((event) => {
      const pageLinks = Object.entries(TemplateName)
        .map(([name, key]) => {
          return `<a href="/templates/${key}">${name}</a>`;
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
