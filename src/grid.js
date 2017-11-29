import { mat4, vec3, vec4 } from 'gl-matrix';
import LightningTree from './lightningTree';

Grid.prototype.init = function() {
  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;

  var vertexShaderSource = require('./shaders/grid-vert.glsl');
  var fragmentShaderSource = require('./shaders/grid-frag.glsl');

  var vertexShader = webgl.createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  var fragmentShader = webgl.createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  this.program = webgl.createProgram(gl, vertexShader, fragmentShader);
  this.program.attributeBuffers = [];

  var data = [];
  var w = this.width/2;

  for (var x = -w; x <= w; x++) {
    for (var y = -w; y <= w; y++) {
      for (var z = -w; z <= w; z++) {
        data.push(x);
        data.push(y);
        data.push(z);
      }
    }
  }

  this.totalPoints = data.length;

  this.vertexArray = gl.createVertexArray();
  gl.bindVertexArray(this.vertexArray);

  this.vertexBuffers[0] = [];

  this.vertexBuffers[0][this.varying.POSITION] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[0][this.varying.POSITION]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STREAM_COPY);
  gl.vertexAttribPointer(this.varying.POSITION, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.varying.POSITION);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var programUniforms = ["u_projectionView"];
  
  var programIndices = [uniform.PROJECTIONVIEW];

  webgl.setUniformLocationsAtIndices(this.program,
                                              programUniforms,
                                              programIndices);

  window.dispatchEvent(new Event('resize'));
}

Grid.prototype.render = function(config, camera) {
  var webgl = this.webgl;
  var gl = webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var prog = this.program;
  
  camera.updateMatrixWorld();
  mat4.invert(this._viewMatrix, camera.matrixWorld.elements);
  mat4.copy(this._projectionMatrix, camera.projectionMatrix.elements);
  mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);

  gl.bindVertexArray(this.vertexArray);

  gl.useProgram(prog);
  gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);
  
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND); 
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.POINTS, 0, this.totalPoints / 3);
}

Grid.prototype.onUpdate = function(config, camera) {
  this.render(config, camera)
}

export default function Grid(config, width, subdivisions) {

  this.width = width;
  this.subdivisions = subdivisions;
  this.totalPoints = 0;

  this.program;
  this.vertexArray;
  this.vertexBuffers = [];

  this.varying = {
    POSITION: 0
  }

  this.uniform = {
    PROJECTIONVIEW: 0
  };

  this.config = config;
  this.webgl = config.webgl;

  this._projectionMatrix = mat4.create();
  this._viewMatrix = mat4.create();
  this._viewProjectionMatrix = mat4.create();
}