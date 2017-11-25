export const DEBUG = true;
export const NUM_GENERATIONS = 5; // lightning tree depth
export const DRAWING_MODE = 1;  // 0 points, 1 triangles
export const INSTANCED = 0;

import Stats from 'stats-js';
import WebGL2 from './webgl.js';
import Config from './config';
import { PerspectiveCamera } from 'three';
import OrbitControls from 'three-orbitcontrols';
import Lightning from './lightning';
import LightningInstanced from './lightningInstanced';

import './style.scss';

function init(callback, update) {

  var framework = {};

  window.addEventListener('load', function() {

    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    if (DEBUG)
      document.body.appendChild(stats.domElement);
    
    framework.stats = stats;
    framework.webgl = new WebGL2();
    framework.canvas = framework.webgl.canvas;
    framework.config = new Config();

    framework.camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    framework.cameraControls = new OrbitControls(framework.camera, framework.canvas);
    framework.cameraControls.enableDamping = true;
    framework.cameraControls.enableZoom = true;
    framework.cameraControls.rotateSpeed = 0.5;

    framework.camera.position.set(0, 0, 75);
    framework.cameraControls.target.set(0, 0, 0);

    framework.lightning = new Lightning(NUM_GENERATIONS, framework.webgl);
    framework.lightningInstanced = new LightningInstanced(NUM_GENERATIONS, DRAWING_MODE, framework.webgl);

    (function tick() {
      stats.begin();
      framework.cameraControls.update();
      update(framework);
      stats.end();
      requestAnimationFrame(tick);
    })();

    return callback(framework);
  });
}

export default {
  init: init
}