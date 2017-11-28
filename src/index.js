import Framework from './framework'
const THREE = require('three');

function onLoad(framework) {
  framework.config.setUpGUI(framework.webgl);
  framework.config.renderer.init();
}

function onUpdate(framework) {
  var config = framework.config;
  var programs = framework.webgl.programs;

  if (config.pause)
    return;

  if (!programs[0] || !programs[1]) {
    return;
  }

  config.renderer.onUpdate(config, framework.camera);
}

Framework.init(onLoad, onUpdate);