export const DEBUG = true;

import Stats from 'stats-js';
import WebGL2 from './webgl.js';
import Config from './config';
import { PerspectiveCamera } from 'three';
import OrbitControls from 'three-orbitcontrols';
import { Spector } from 'spectorjs';

import './style.scss';

function init(callback, update) {

  var framework = {};

  window.addEventListener('load', function() {

    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    if (DEBUG) {
      const spector = new Spector();
      spector.displayUI();
      document.body.appendChild(stats.domElement);
    }
    
    framework.stats = stats;
    framework.webgl = new WebGL2();
    framework.canvas = framework.webgl.canvas;
    framework.config = new Config(framework.webgl);

    framework.camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    framework.cameraControls = new OrbitControls(framework.camera, framework.canvas);
    framework.cameraControls.enableDamping = true;
    framework.cameraControls.enableZoom = true;
    framework.cameraControls.rotateSpeed = 0.5;

    framework.camera.position.set(0, 0, 40);
    framework.cameraControls.target.set(0, 0, 0);

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