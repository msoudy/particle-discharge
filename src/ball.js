import { mat4, vec3, vec4 } from 'gl-matrix';
import LightningTree from './lightningTree';
var Cube = require('primitive-cube');

function Instance() {
  this.positions = [];

  // Attributes for every instance
  this.offsets = [];
  this.velocities = [];
  this.numTriangles = 0;
  this.numPoints = 0;
}

Ball.prototype.createInstance = function() {
  var instance = new Instance();

  var mesh = Cube(this.radius,this.radius,this.radius,1,1,1);

  var tris = []

  for (var i = 0; i < mesh.positions.length; i=i+4) {
    tris.push(mesh.positions[i]);
    tris.push(mesh.positions[i+1]);
    tris.push(mesh.positions[i+2]);
    tris.push(mesh.positions[i+1]);
    tris.push(mesh.positions[i+2]);
    tris.push(mesh.positions[i+3]);
  }

  tris = new Float32Array([].concat.apply([], tris));
  var points = new Float32Array([].concat.apply([], mesh.positions))
  instance.positions = tris;

  instance.numTriangles = mesh.cells.length;
  instance.numPoints = mesh.positions.length;

  var numBalls = this.numBalls;
  var instanceOffsets = new Float32Array(numBalls * 3);
  var instanceVelocities = new Float32Array(numBalls * 3);

  for (var i = 0; i < numBalls; ++i) {
    var oi = i * 3;
    var vi = i * 3;

    instanceOffsets[oi] = (Math.random() - 0.5) * 10;
    instanceOffsets[oi + 1] = (Math.random() - 0.5) * 10;
    instanceOffsets[oi + 2] = (Math.random() - 0.5) * 10;

    instanceVelocities[vi] = Math.random() / 10.0;
    instanceVelocities[vi + 1] = Math.random() / 10.0;
    instanceVelocities[vi + 2] = Math.random() / 10.0;
  }

  instance.offsets = instanceOffsets;
  instance.velocities = instanceVelocities;

  this.instance = instance;

  return instance;
}

Ball.prototype.init = function() {
  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var program = this.program;

  this.webgl.createPrograms(this.programs, ["emit-ball", "draw-ball"]);
  var programs = this.programs;

  var varyings = ['v_off','v_vel'];
  gl.transformFeedbackVaryings(programs[program.TRANSFORM], varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(programs[program.TRANSFORM]);

  var instance = this.createInstance();

  this.vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];
  this.transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

  for (var vaoIndex = 0; vaoIndex < this.vertexArrays.length; ++vaoIndex) {
    gl.bindVertexArray(this.vertexArrays[vaoIndex]);
    this.vertexBuffers[vaoIndex] = [];

    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.POSITION, 3, instance.positions);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.OFFSET, 3, instance.offsets);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.VELOCITY, 3, instance.velocities);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[vaoIndex][this.varying.VELOCITY]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }

  var programTransformUniforms = ["u_time"];
  var programTransformIndices = [uniform.TIME];
  webgl.setUniformLocationsAtIndices(programs[program.TRANSFORM],
                                              programTransformUniforms,
                                              programTransformIndices);
  
  var programDrawUniforms = ["u_projectionView"];
  
  var programDrawIndices = [uniform.PROJECTIONVIEW];
  
  webgl.setUniformLocationsAtIndices(programs[program.DRAW],
                                              programDrawUniforms,
                                              programDrawIndices);


  window.dispatchEvent(new Event('resize'));
}

Ball.prototype.transform = function() {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var prog = this.programs[this.program.TRANSFORM];

  var destinationIndex = (this.currentSourceIndex + 1) % 2;
  var sourceVAO = this.vertexArrays[this.currentSourceIndex];

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(prog);

  gl.bindVertexArray(sourceVAO);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[destinationIndex]);
  
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[destinationIndex][varying.OFFSET]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[destinationIndex][varying.VELOCITY]);

  gl.uniform1f(prog.uniformLocations[this.uniform.TIME], this.frame);

  gl.vertexAttribDivisor(varying.OFFSET, 0);
  gl.vertexAttribDivisor(varying.VELOCITY, 0);

  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, this.numBalls);
  gl.endTransformFeedback();


  gl.disable(gl.RASTERIZER_DISCARD);
  gl.useProgram(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  this.currentSourceIndex = (this.currentSourceIndex + 1) % 2;
}


Ball.prototype.render = function(camera) {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var prog = this.programs[this.program.DRAW];
  camera.updateMatrixWorld();
  mat4.invert(this._viewMatrix, camera.matrixWorld.elements);
  mat4.copy(this._projectionMatrix, camera.projectionMatrix.elements);
  mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);
  
  gl.bindVertexArray(this.vertexArrays[this.currentSourceIndex]);

  gl.vertexAttribDivisor(varying.OFFSET, 1);
  gl.vertexAttribDivisor(varying.VELOCITY, 1);

  gl.useProgram(prog);
  gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);


  gl.drawArraysInstanced(gl.TRIANGLES, 0, this.instance.numTriangles * 3, this.numBalls);
}

Ball.prototype.onUpdate = function(config, camera) {
  this.frame++;

  this.transform();
  this.render(camera);
}

export default function Ball(config, numBalls, radius, gridWidth) {

  this.numBalls = numBalls;
  this.radius = radius;
  this.gridWidth = gridWidth;

  this.programs = [];
  this.vertexArrays = [];
  this.vertexBuffers = [];
  this.transformFeedbacks = [];

  this.program = {
    TRANSFORM: 0,
    DRAW: 1
  }

  this.varying = {
    POSITION: 0,
    OFFSET: 1,
    VELOCITY: 2
  }

  this.uniform = {
    PROJECTIONVIEW: 0,
    TIME: 1
  };

  this.frame = 0;
  this.config = config;
  this.webgl = config.webgl;

  this.currentSourceIndex = 0;

  this._projectionMatrix = mat4.create();
  this._viewMatrix = mat4.create();
  this._viewProjectionMatrix = mat4.create();
}