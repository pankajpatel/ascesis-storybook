const Split = require('split.js');
const { Delegate } = require('ascesis/delegate');
const { Router } = require('ascesis/router');
const { getStories } = require('./story');
const Channel = require('./channel');

const storiesTreeTemplate = require('../templates/stories_tree.html');

const stories = getStories();
const router = new Router({ useHash: true });

const $previewFrame = document.querySelector('#preview-frame');
const $fullscreenAnchor = document.querySelector('#fullscreen-anchor');

const channel = new Channel($previewFrame.contentWindow);

Split(['.left-panel', '.right-panel'], {
  sizes: [20, 80],
  gutterSize: 8,
  cursor: 'col-resize'
});

Split(['#preview-block', '#info-block'], {
  direction: 'vertical',
  sizes: [75, 25],
  gutterSize: 8,
  cursor: 'row-resize'
});

document.querySelector('#stories-tree').innerHTML = storiesTreeTemplate({ stories });

router.add('/:story/:substory', (story, substory) => {
  const url = `/preview.html#${story}/${substory}`;

  $previewFrame.src = url;
  $fullscreenAnchor.href = url;
});

router.add('/:story', (story) => {
  //redirect to first substory path
  console.log(`story ${story}`);
});

router.add('/', () => {
  //redirect to first story path
  console.log('root route');
});

router.resolve();

const infoBlock = document.querySelector('#info-block');

channel.on('console.log', (data) => {
  console.log(data)
  infoBlock.querySelector('ul').innerHTML +=  `<li>${JSON.stringify(data)}</li>`
})
