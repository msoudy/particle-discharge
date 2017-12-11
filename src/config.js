import { webgl } from './framework';
import { vec3 } from 'gl-matrix';
import DAT from 'dat-gui';
import Grid from './grid';
import ParticleBolt from './particleBolt';

const PARTICLE_BOLT = "Particle Bolt";

const RENDERER_TYPE = PARTICLE_BOLT;

const SCENARIO_DEFAULT = 'Default';
const SCENARIO_GRID = 'Grid';

const SCENARIO = SCENARIO_GRID;

Config.prototype.setUpGUI = function() {

  this.gui.add(this, 'pause').name("Pause Scene").onChange(function(value) {
    if (value) {
      this.pause = value;
    } else {
      this.pause = value;
    }
  });

  this.gui.add(this, 'showGrid').name("Grid");
  //this.gui.add(this, 'activateMouse').name("Activate Mouse");

  this.gui.add(this, 'numBalls', 2.0, 1000.0).step(1.0).name("Num Balls").onChange( function() {
    this.object.resetRenderer();
  });

  this.gui.add(this, 'maxNeighbors', 0.0, 10.0).step(1.0).name("Max Neighbors").onChange( function() {
    this.object.resetRenderer();
  });

  this.gui.add(this, 'neighborRadius', 0.1, 0.7).name("Neighbor Radius");

  this.gui.add(this, 'ballRadius', 0.01, 1.0).name("Ball Radius").onChange( function() {
    this.object.resetRenderer();
  });

  this.gui.add(this, 'particlePhysics').name("Particle Physics");


  this.gui.add(this, 'current').name("Current");
  this.gui.add(this, 'randomizeCurrent').name("Random Current");

  // this.gui.add(this, 'scenario', [SCENARIO_DEFAULT, SCENARIO_GRID]).name("Scenario").onChange(function() {
  //   this.object.resetRenderer();
  // });

}

Config.prototype.resetRenderer = function() {
  var config = this;
  if (config.rendererType == PARTICLE_BOLT) {
    config.renderer = new ParticleBolt(config, this.numBalls, 0.02, config.gridWidth);
  }
  config.renderer.init();
}

export default function Config(webgl) {

  this.gui = new DAT.GUI();
  this.webgl = webgl;

  this.pause = false;
  this.rendererType = RENDERER_TYPE;

  this.gridWidth = 10;
  this.grid = new Grid(this, this.gridWidth, 10);
  this.grid.init();
  this.showGrid = false;
  this.activateMouse = false;

  this.numBalls = 400;
  this.maxNeighbors = 4;
  this.neighborRadius = 0.6;
  this.ballRadius = 0.01;
  this.particlePhysics = true;
  this.current = true;
  this.randomizeCurrent = true;
  this.scenario = SCENARIO_DEFAULT;

  this.mousePoint;
  this.mouseActive = false;


  this.resetRenderer();
}