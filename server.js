#!/usr/bin/env node

const express = require('express');
const webpack = require('webpack');
const program = require('commander');
const glob = require('glob-promise');
const path = require('path');
const fs = require('fs');
const pack = require('./package');

const commonTemplate = require('./templates/common.html');
const managerTemplate = require('./templates/manager.html');
const managerHeadTemplate = require('./templates/manager_head.html');
const previewTemplate = require('./templates/preview.html');

const webpackMiddleware = require('webpack-dev-middleware');


// read arguments
program
  .version(pack.version)
  .option('-p, --port <n>', 'Port')
  .parse(process.argv);


// settings
const PORT = program.port || 3000;
const TARGET_DIR = process.cwd();
const PROJECT_DIR = __dirname;


let projectConfig = {};
try {
  projectConfig = require(path.resolve(TARGET_DIR, '.storybook', 'config.js'));
} catch (e) {
}

const defaultConfig = require('./defaults/config.js');

const config = Object.assign({}, defaultConfig, projectConfig);


let webpackConfig = {};
try {
  webpackConfig = require(path.resolve(TARGET_DIR, '.storybook', 'webpack.config.js'));
} catch (e) {
  console.log('using default webpack config');
  webpackConfig = require('./defaults/webpack.config.js');
}


// app
const app = express();
const stories = glob(config.stories, {
  ignore: config.ignore,
});

const readFile = file => new Promise((resolve) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      resolve(false);
      return;
    }
    resolve(data.toString());
  });
});
const checkFile = file => readFile(file).then(content => (content ? file : false));

Promise.all([
  stories,
  readFile(path.resolve(TARGET_DIR, '.storybook', 'preview-header.html')),
  checkFile(path.resolve(TARGET_DIR, '.storybook', 'additional.js')),
]).then((values) => {
  const storyFiles = values[0].map(file => path.resolve(TARGET_DIR, path.resolve(TARGET_DIR, file)));
  const header = values[1];
  const additional = values[2];

  const common = [].concat(additional || [], storyFiles);

  webpackConfig.resolve || (webpackConfig.resolve = {});
  webpackConfig.resolve.modules || (webpackConfig.resolve.modules = []);
  webpackConfig.resolve.modules.push(path.resolve(PROJECT_DIR, 'node_modules'));
  webpackConfig.resolve.modules.push(path.resolve(TARGET_DIR, 'node_modules'));

  const webpackConfigPrepared = Object.assign({}, webpackConfig, {
    entry: {
      manager: common.concat(path.resolve(PROJECT_DIR, 'js/manager.js')),
      preview: common.concat(path.resolve(PROJECT_DIR, 'js/preview.js')),
    },
    resolve: webpackConfig.resolve,
  });

  const compiler = webpack(webpackConfigPrepared);

  app.use(webpackMiddleware(compiler, {
    serverSideRender: true,
    stats: 'minimal',
  }));
  app.use((req, res, next) => {
    res.header = header || '';
    next();
  });
  app.get('/preview.html', previewMiddleware);
  app.use(appMiddleware);

  app.listen(PORT, () => {
    console.log('Target Dir: ', TARGET_DIR);
    console.log(`Found ${storyFiles.length} Stories`);
    console.log(`App listening on port ${PORT}\nOpen http://localhost:${PORT}/ on browser`);
  });
});


function normalizeAssets(assets) {
  return [].concat(assets || []);
}

function appMiddleware(req, res) {
  const assetsByChunkName = res.locals.webpackStats.toJson().assetsByChunkName;
  const hash = res.locals.webpackStats.toJson().hash;

  res.send(commonTemplate({
    headContent: managerHeadTemplate(),
    bodyContent: managerTemplate({
      assets: normalizeAssets(assetsByChunkName.manager),
      hash,
    }),
  }));
}

function previewMiddleware(req, res) {
  const assetsByChunkName = res.locals.webpackStats.toJson().assetsByChunkName;

  res.send(commonTemplate({
    headContent: `
      <title>Story preview</title>
      ${res.header}
    `,
    bodyContent: previewTemplate({
      assets: normalizeAssets(assetsByChunkName.preview),
    }),
  }));
}
