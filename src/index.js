import Framework from './framework'

function onLoad(framework) {
  framework.config.setUpGUI(framework.webgl);
  framework.config.renderer.init();
}

function onUpdate(framework) {
  var config = framework.config;
  var programs = framework.webgl.programs;
  var program = framework.webgl.program;

  if (config.pause)
    return;

  if (!programs[program.PARTICLES] || !programs[program.DRAW]) {
    return;
  }

  config.renderer.onUpdate(config, framework.camera);
}

Framework.init(onLoad, onUpdate);