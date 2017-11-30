import { webgl } from './framework';
import { vec3 } from 'gl-matrix';
import DAT from 'dat-gui';
import Lightning from './lightning';
import LightningInstanced from './lightningInstanced';
import Grid from './grid';
import Ball from './ball';

const LINE = 'Line';
const INSTANCE = 'Instance';
const BOLT = "Bolt";

const DRAWING_MODE = 1; // 0 points, 1 triangles
const RENDERER_TYPE = BOLT;

Config.prototype.setUpGUI = function() {

  this.gui.add(this, 'pause').name("Pause Scene").onChange(function(value) {
    if (value) {
      this.pause = value;
    } else {
      this.pause = value;
    }
  });

  this.gui.add(this, 'rendererType', [LINE, INSTANCE, BOLT]).name("Mode").onChange(function() {
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

  this.gui.add(this, 'glow').name("Glow");

}

Config.prototype.resetRenderer = function() {
  var config = this;
  if (config.rendererType == LINE) {
    config.renderer = new Lightning(config);
  } else if (config.rendererType == INSTANCE) {
    config.renderer = new LightningInstanced(DRAWING_MODE, config);
  } else if (config.rendererType == BOLT) {
    config.renderer = new Ball(config, 50, 0.2, config.gridWidth);
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
  this.startPoint = vec3.fromValues(0,15,0);
  this.endPoint = vec3.fromValues(0,-15,0);

  // Instance Variables
  this.branchWidth = 1.5;

  this.pause = false;
  this.rendererType = RENDERER_TYPE;

  this.gridWidth = 10;
  this.grid = new Grid(this, this.gridWidth, 10);
  this.grid.init();

  this.resetRenderer();
}