import Framework from './framework'

function onLoad(framework) {
  framework.config.setUpGUI();
  //framework.lightning.init();
  framework.lightningInstanced.init();
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

  //framework.lightning.onUpdate(config, framework.camera);
  framework.lightningInstanced.onUpdate(config, framework.camera);
}

Framework.init(onLoad, onUpdate);