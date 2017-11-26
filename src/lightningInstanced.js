const POINTS = 0;
const TRIANGLES = 1;

import { mat4, vec4, vec3 } from 'gl-matrix';
import LightningTree from './lightningTree';

function Instance() {
  this.positions = [];

  // Attributes for every instance
  this.offsets = [];
  this.rotations = [];
  this.colors = [];
  this.numTriangles = 0;
  this.numPoints = 0;
}

var Cube = require('primitive-cube');

LightningInstanced.prototype.createInstance = function() {
  var instance = new Instance();

  var mesh = Cube(0.1,1,0.1, 2,10,2);

  if (this.mode == TRIANGLES) {
    mesh = Cube(0.1,1,0.1, 1,1,1);
  }

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

  if (this.mode == POINTS)
    instance.positions = points;
  else if (this.mode == TRIANGLES)
    instance.positions = tris;

  instance.numTriangles = mesh.cells.length;
  instance.numPoints = mesh.positions.length;

  var offsets = [];
  var rotations = [];

  for (let t = 0; t < this.trees.length; t++) {
    var tree = this.trees[t];
    offsets = offsets.concat(tree.getInstanceOffsets());
    rotations = rotations.concat(tree.getInstanceRotations());
    this.totalSegments += tree.segments.length;
  }

  instance.offsets = new Float32Array(offsets);
  instance.rotations = new Float32Array(rotations);
  instance.colors = new Float32Array(this.totalSegments * 3);

  this.instance = instance;

  return instance;
}

LightningInstanced.prototype.init = function() {
  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var programs = this.webgl.programs;
  var program = this.webgl.program;
  var varying = this.varying;
  var uniform = this.uniform;

  programs = this.webgl.createPrograms(["emit-instanced", "draw-instanced"]);

  var varyings = ['outOffset', 'outRotation'];
  gl.transformFeedbackVaryings(programs[program.TRANSFORM], varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(programs[program.TRANSFORM]);

  var instance = this.createInstance();

  webgl.vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];
  webgl.transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

  for (var vaoIndex = 0; vaoIndex < webgl.vertexArrays.length; ++vaoIndex) {
    gl.bindVertexArray(webgl.vertexArrays[vaoIndex]);
    webgl.vertexBuffers[vaoIndex] = [];

    webgl.createVBO(vaoIndex, this.varying.OFFSET, 4, instance.offsets);
    webgl.createVBO(vaoIndex, this.varying.ROTATION, 3, instance.rotations);
    webgl.createVBO(vaoIndex, this.varying.POSITION, 3, instance.positions);
    webgl.createVBO(vaoIndex, this.varying.COLOR, 3, instance.colors);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webgl.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, webgl.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, webgl.vertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }

  var programParticlesUniforms = [
                                    "u_time"
                                  ];
  
  var programParticlesIndices = [uniform.TIME];
  
  webgl.setUniformLocationsAtIndices(programs[program.TRANSFORM],
                                              programParticlesUniforms,
                                              programParticlesIndices);
  
  var programDrawUniforms = [
                              "u_projectionView"
                          ];
  
  var programDrawIndices = [
                              uniform.PROJECTIONVIEW
                           ];
  

  webgl.setUniformLocationsAtIndices(programs[program.DRAW],
                                              programDrawUniforms,
                                              programDrawIndices);

  window.dispatchEvent(new Event('resize'));
}

LightningInstanced.prototype.addTree = function() {
  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var programs = this.webgl.programs;
  var program = this.webgl.program;
  var varying = this.varying;

  var offsetStart = (Math.random() - 0.5) * 20;

  this.trees.push(new LightningTree(vec3.fromValues(0,this.startPoint[1],0), 
                                    vec3.fromValues(offsetStart,this.endPoint[1],0), this.config));
  var offsets = [];
  var rotations = [];
  this.totalSegments = 0;

  for (let t = 0; t < this.trees.length; t++) {
    var tree = this.trees[t];
    offsets = offsets.concat(tree.getInstanceOffsets());
    rotations = rotations.concat(tree.getInstanceRotations());
    this.totalSegments += tree.segments.length;
  }


  for (var vaoIndex = 0; vaoIndex < webgl.vertexArrays.length; ++vaoIndex) {
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(offsets), gl.STREAM_COPY);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl.vertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rotations), gl.STREAM_COPY); 

    gl.bindBuffer(gl.ARRAY_BUFFER, webgl.vertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rotations), gl.STREAM_COPY); 

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webgl.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, webgl.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, webgl.vertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }
}

LightningInstanced.prototype.transform = function(config) {
  var webgl = this.webgl;
  var gl = webgl.gl;
  var varying = this.varying;
  var prog = webgl.programs[webgl.program.TRANSFORM];

  var destinationIndex = (this.currentSourceIndex + 1) % 2;
  var sourceVAO = webgl.vertexArrays[this.currentSourceIndex];

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(prog);

  gl.bindVertexArray(sourceVAO);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webgl.transformFeedbacks[destinationIndex]);
  
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, webgl.vertexBuffers[destinationIndex][varying.OFFSET]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, webgl.vertexBuffers[destinationIndex][varying.ROTATION]);

  gl.uniform1f(prog.uniformLocations[this.uniform.TIME], this.frame);

  gl.vertexAttribDivisor(varying.OFFSET, 0);
  gl.vertexAttribDivisor(varying.ROTATION, 0);

  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, this.totalSegments);
  gl.endTransformFeedback();


  gl.disable(gl.RASTERIZER_DISCARD);
  gl.useProgram(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  this.currentSourceIndex = (this.currentSourceIndex + 1) % 2;
}

LightningInstanced.prototype.render = function(config, camera) {
  var webgl = this.webgl;
  var gl = webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var prog = webgl.programs[webgl.program.DRAW];

  camera.updateMatrixWorld();
  mat4.invert(this._viewMatrix, camera.matrixWorld.elements);
  mat4.copy(this._projectionMatrix, camera.projectionMatrix.elements);
  mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);
  
  gl.bindVertexArray(webgl.vertexArrays[this.currentSourceIndex]);

  gl.vertexAttribDivisor(varying.OFFSET, 1);
  gl.vertexAttribDivisor(varying.ROTATION, 1);
  gl.vertexAttribDivisor(varying.COLOR, 1);

  gl.useProgram(prog);
  gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);

  gl.enable(gl.DEPTH_TEST);

  if (this.mode == POINTS)
    gl.drawArraysInstanced(gl.POINTS, 0, this.instance.numPoints, this.totalSegments);
  else if (this.mode == TRIANGLES)
    gl.drawArraysInstanced(gl.TRIANGLES, 0, this.instance.numTriangles * 3, this.totalSegments);
}

LightningInstanced.prototype.onUpdate = function(config, camera) {
  this.frame++;

  // if (this.frame % 20 == 0) {
  //   this.trees.shift();
  //   this.addTree();
  // }

  this.transform(config)
  this.render(config, camera)
}

export default function LightningInstanced(mode, config) {

  this.mode = mode;
  this.startPoint = vec3.fromValues(0,30,0);
  this.endPoint = vec3.fromValues(0,0,0);
  //this.trees = [new LightningTree(this.startPoint, this.endPoint, config),
  //              new LightningTree(this.startPoint, this.endPoint, config)];
  this.trees = [new LightningTree(this.startPoint, this.endPoint, config)];
  this.totalSegments = 0;

  this.instance;

  this.varying = {
    OFFSET: 0,
    ROTATION: 1,
    POSITION: 2,
    COLOR: 3
  }

  this.uniform = {
    TIME: 0,
    PROJECTIONVIEW: 1
  };

  this.frame = 0;
  this.config = config;
  this.webgl = config.webgl;
  this.currentSourceIndex = 0;

  this._projectionMatrix = mat4.create();
  this._viewMatrix = mat4.create();
  this._viewProjectionMatrix = mat4.create();
}