const { Delegate } = require('ascesis/delegate');
const { Router } = require('ascesis/router');
const { getStories } = require('./story');
const Channel = require('./channel');

const channel = new Channel(window.parent);
const stories = getStories();


const router = new Router({ useHash: true });

const $container = document.querySelector('#container');
let c = {
  log: () => {
    channel.emit('console.log', ...arguments)
  },
  error: () => {
    channel.emit('console.log', ...arguments)
  }
}
window.console = c
router.add('/:story/:substory?', (story, substory) => {
  //redirect to first substory path
  console.log('preview', story, substory);
  $container.innerHTML = (stories[story][substory] || (() => ``))()
});

router.resolve();

