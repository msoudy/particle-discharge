import { webgl } from './framework';
import DAT from 'dat-gui';
import Lightning from './lightning';
import LightningInstanced from './lightningInstanced';

const DRAWING_MODE = 1; // 0 points, 1 triangles

const LINE = 'Line';
const INSTANCE = 'Instance';

Config.prototype.setUpGUI = function() {

  this.gui.add(this, 'pause').name("Pause Scene").onChange(function(value) {
    if (value) {
      this.pause = value;
    } else {
      this.pause = value;
    }
  });

  this.gui.add(this, 'rendererType', [LINE, INSTANCE]).name("Mode").onChange(function() {
    this.object.resetRenderer();
  });

  this.gui.add(this, 'branching').name("Branching").onChange( function() {
    this.object.resetRenderer();
  });

  this.gui.add(this, 'branchWidth', 1.0, 5.0).name("Branch Width").onChange( function() {
    this.object.resetRenderer();
  });

  this.gui.add(this, 'numGenerations', 0.0, 10.0).step(1.0).name("Generations").onChange( function() {
    this.object.resetRenderer();
  });

  this.gui.add(this, 'glow').name("Glow").onChange( function() {
    this.object.resetRenderer();
  });

}

Config.prototype.resetRenderer = function() {
  var config = this;
  if (config.rendererType == LINE) {
    config.renderer = new Lightning(config);
  } else if (config.rendererType == INSTANCE) {
    config.renderer = new LightningInstanced(DRAWING_MODE, config);
  }
  config.renderer.init();
}

export default function Config(webgl) {

  this.gui = new DAT.GUI();
  this.webgl = webgl;

  // Lightning Tree Variables
  this.numGenerations = 5.0;
  this.branching = true;
  this.glow = true;

  // Instance Variables
  this.branchWidth = 1.5;

  this.pause = false;
  this.rendererType = INSTANCE;
  this.renderer = new LightningInstanced(DRAWING_MODE, this);
}