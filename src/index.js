const THREE = require('three');
import Framework from './framework'

function onLoad(framework) {
  framework.config.setUpGUI(framework.webgl);
}

function onUpdate(framework) {
  var config = framework.config;
  var programs = config.renderer.programs;

  if (config.pause)
    return;

  if (!programs[0] || !programs[1] ) {
    return;
  }

  config.renderer.onUpdate(config, framework.camera);
  if (config.rendererType == 'Bolt' || config.rendererType == 'Electric CPU')
    config.grid.onUpdate(config, framework.camera);
}

Framework.init(onLoad, onUpdate);