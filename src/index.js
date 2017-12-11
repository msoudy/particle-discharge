const THREE = require('three');
import { vec3 } from 'gl-matrix';
import Framework from './framework'

function onLoad(framework) {
  framework.config.setUpGUI(framework.webgl);

  framework.canvas.addEventListener('mousedown', function(e) {
    mouseDown(e, framework);
  }, false);

  framework.canvas.addEventListener('mouseup', function(e) {
    mouseUp(e, framework);
  }, false);
}

var mouse = new THREE.Vector2();

function mouseDown(event, framework){
  var camera = framework.camera;
  var vector = new THREE.Vector3();
  vector.set(
      ( event.clientX / canvas.clientWidth ) * 2 - 1,
      - ( event.clientY / canvas.clientHeight ) * 2 + 1,
      1.0 );

  vector.unproject(camera);

  var dir = vector.sub( camera.position ).normalize();
  var pos = camera.position.clone();

  while (Math.abs(pos[2]) > 5.0 && Math.abs(pos[2]) < 1000.0) {
    vec3.subtract(pos, pos, dir);
  }

  framework.config.mousePoint = vec3.fromValues(pos.x,pos.y,pos.z);
  framework.config.mouseActive = true;
}

function mouseUp(event, framework){
  framework.config.mouseActive = false;
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
  if (config.showGrid)
    config.grid.onUpdate(config, framework.camera);
}

Framework.init(onLoad, onUpdate);