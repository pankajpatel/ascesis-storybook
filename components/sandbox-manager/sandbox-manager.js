const Split = require('split.js');
const { fireEvent } = require('ascesis');
const { delegate } = require('ascesis/delegate');
const { Router } = require('ascesis/router');
const { getStories } = require('../../js/story');
const Channel = require('../../js/channel');
const AddonsApi = require('../../addons');

const template = require('./sandbox-manager.html');

require('../addons-panel/addons-panel');
require('../stories-tree/stories-tree');
require('../preview-frame/preview-frame');


const createElement = (name, attributes) => {
  const $el = document.createElement(name);
  Object.keys(attributes).forEach((attr) => {
    if (attr in $el) {
      $el[attr] = attributes[attr];
    } else {
      $el.setAttribute(attr, attributes[attr]);
    }
  });
  return $el;
};

class ManagerApp extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template();

    this.name = this.getAttribute('name') || '';
    this.isMobile = this.hasAttribute('mobile') || false;

    const stories = getStories();
    const firstStory = stories[Object.keys(stories)[0]];
    const addonPanels = AddonsApi.getPanels();

    const DEFAULT_PARAMS = {
      width: this.isMobile ? 100 : 80,
      height: this.isMobile ? 100 : 75,
      story: firstStory.storyName,
      storyKind: Object.keys(firstStory.getStories())[0],
      addon: Object.keys(addonPanels)[0],
    };

    this.router = new Router();

    this.state = Object.assign({}, DEFAULT_PARAMS, this.router.getParams());

    // build panels
    this.$leftPanel = this.querySelector('#left-panel');

    this.$storiesTree = createElement('stories-tree', {
      class: 'split content',
      state: stories,
      name: this.name,
    });
    this.$leftPanel.appendChild(this.$storiesTree);

    /*  build right panels
    *  correct order of components creation matters a lot here
    *  channel should be established before rendering plugins
    * */
    this.$rightPanel = this.querySelector('#right-panel');
    // this.$rightPanel.appendChild(this.$storiesTree);

    this.$rightPanel.appendChild(this.$previewFrame = createElement('preview-frame', {
      class: 'split content',
    }));

    this.$previewFrame.render();
    const channel = new Channel(this.$previewFrame.getWindow());
    AddonsApi.setChannel(channel);

    this.$rightPanel.appendChild(this.$addonsPanel = createElement('sandbox-addons-panel', {
      class: 'split content',
      state: addonPanels,
    }));

    // resizable grid
    const _self = this;

    const vSplit = Split([this.$leftPanel, this.$rightPanel], {
      direction: 'horizontal',
      gutterSize: 8,
      cursor: 'col-resize',
      onDragEnd() {
        const width = Math.round(vSplit.getSizes()[1]);
        fireEvent('size-changed', _self, { width });
      },
    });

    const hSplit = Split([this.$previewFrame, this.$addonsPanel], {
      direction: 'vertical',
      gutterSize: 8,
      cursor: 'row-resize',
      onDragEnd() {
        const height = Math.round(hSplit.getSizes()[0]);
        fireEvent('size-changed', _self, { height });
      },
    });


    // handle state change
    delegate.on('size-changed', this, null, this.updateState.bind(this));
    delegate.on('addon-changed', this, null, this.updateState.bind(this));
    delegate.on('story-changed', this, null, this.updateState.bind(this));

    delegate.on('story-changed', this, null, ({ eventData }) => {
      this.renderStory(this.state.story, this.state.storyKind);
    });

    this.querySelector('#toggleMenu').addEventListener('click', () => {
      if (this.classList.contains('mobile-active')) {
        vSplit.setSizes([0, 100]);
        this.classList.remove('mobile-active');
      } else {
        vSplit.setSizes([100, 0]);
        this.classList.add('mobile-active');
      }
    });

    this.querySelector('#toggleAddon').addEventListener('click', () => {
      if (this.classList.contains('mobile-active')) {
        hSplit.setSizes([0, 100]);
        // hSplit.collapse(1);
        this.classList.remove('addon-active');
      } else {
        // hSplit.collapse(1);
        hSplit.setSizes([100, 0]);
        this.classList.add('addon-active');
      }
    });

    this.querySelector('#distractionFree').addEventListener('click', () => {
      if (this.classList.contains('distraction-free')) {
        this.classList.remove('distraction-free');
      } else {
        this.classList.add('distraction-free');
      }
    });

    /*  routing
     *  here all routes changes will be observed
     *  only query parameters will be used
     * */
    this.router.add('*', (path, query) => {
      // set sizes
      const width = Number(query.width);
      const height = Number(query.height);
      vSplit.setSizes([100 - width, width]);
      hSplit.setSizes([height, 100 - height]);

      // set active addons panel
      this.$addonsPanel.setActive(query.addon);

      // set active story in stories tree
      this.$storiesTree.setActive(query.story, query.storyKind);

      this.renderStory(query.story, query.storyKind);
    });

    // initial update of paramters + router resolve
    this.router.updateParams(this.state, { replace: true });
  }

  // render active story in frame + notify onStory listeners
  renderStory(story, storyKind) {
    this.$previewFrame.setActive(story, storyKind);

    AddonsApi.notifyOnStoryListeners(story, storyKind);
  }

  // update manager state + silent update of query paramters
  updateState({ eventData }) {
    this.state = Object.assign({}, this.state, eventData);
    this.router.updateParams(this.state, { silent: true });
  }
}

customElements.define('sandbox-manager-application', ManagerApp);
