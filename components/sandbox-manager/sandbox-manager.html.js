module.exports = scope => `
  <style>
    .fullscreen-icon,
    .arrows-overlap {
      background-color: Gainsboro;
      border-radius: 3px;
    }
    .fullscreen-icon {
      display: block;
      font-style: normal;
      height: 25px;
      position: absolute;
      right: 15px;
      top: 15px;
      width: 25px;
    }
    .fullscreen-icon:after,
    .fullscreen-icon:before {
      color: gray;
      content: "\u2192";
      display: block;
      font-size: 18px;
      position: absolute;
    }
    .fullscreen-icon:after {
      transform: rotate(-45deg);
      top: -3px;
      right: -2px;
    }
    .fullscreen-icon:before {
      transform: rotate(135deg);
      bottom: -3px;
      left: -2px;
    }
    .arrows-overlap {
      display: inline-block;
      background-color: gainsboro;
      height: 8px;
      width: 8px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -4px;
      margin-top: -4px;
      z-index: 50;
    }

    sandbox-manager-application {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    #right-panel stories-tree {
      display: none;
    }
    #mobile-head {
      display: none;
    }
    .shown {
      display: block !important;
    }
    .hidden {
      display: none !important;
    }
    @media screen and (max-width: 768px){
      #mobile-head,
      #right-panel stories-tree {
        display: block !important;
      }
      .mobile-active #right-panel {
        display: none !important;
      }
      .mobile-active #left-panel {
        display: block !important;
      }
      .addon-active #right-panel {
        display: none !important;
      }
      .addon-active #left-panel {
        display: block !important;
      }
      #left-panel,
      .gutter {
        display: none !important;
      }

      #mobile-head {
        padding: 5px;
        width: 100%;
        position: relative;
        box-sizing: border-box;
      }
      /*
      #toggleMenu,
      #toggleAddon {
        position: absolute;
      }
      #toggleMenu {
        left: 0;
      }
      #toggleAddon {
        right: 0;
      }
      */
    }
  </style>

  <div id="left-panel" class="split split-horizontal left-panel">
  <div id="mobile-head">Storybook
    <button id="distractionFree">Distraction Free</button>
    <span id="buttons" class="hidden">
      <button id="toggleMenu">Toggle Menu</button>
      <button id="toggleAddon">Toggle Addon</button>
    </span>
  </div>
  </div>
  <div id="right-panel" class="split split-horizontal right-panel">
  </div>
`;
