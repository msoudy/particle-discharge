const POINTS = 0;
const TRIANGLES = 1;

import { mat4, vec3, vec4 } from 'gl-matrix';
import LightningTree from './lightningTree';

Lightning.prototype.init = function() {
  var webgl = this.webgl;
  var gl = webgl.gl;
  var program = this.program;
  var varying = this.varying;
  var uniform = this.uniform;
  var num_instances = this.numInstances;

  webgl.createPrograms(this.programs, ["emit-lightning", "draw-lightning"]);

  var varyings = ['outPos','outCol'];
  gl.transformFeedbackVaryings(this.programs[program.TRANSFORM], varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(this.programs[program.TRANSFORM]);

  var positions = [];
  var colors = [];

  for (let t = 0; t < this.trees.length; t++) {
    var tree = this.trees[t];
    positions = positions.concat(tree.flatten());
    colors = colors.concat(tree.getColors());
    this.totalSegments += tree.segments.length;
  }

  this.vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];
  this.transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

  for (var vaoIndex = 0; vaoIndex < this.vertexArrays.length; ++vaoIndex) {
    gl.bindVertexArray(this.vertexArrays[vaoIndex]);
    this.vertexBuffers[vaoIndex] = [];

    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.POSITION, 3, new Float32Array(positions));
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.COLOR, 4, new Float32Array(colors));

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[vaoIndex][this.varying.POSITION]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }

  var programParticlesUniforms = [
                                    "u_time"
                                  ];
  
  var programParticlesIndices = [uniform.TIME];
  
  webgl.setUniformLocationsAtIndices(this.programs[program.TRANSFORM],
                                              programParticlesUniforms,
                                              programParticlesIndices);
  
  var programDrawUniforms = [
                              "u_projectionView"
                          ];
  
  var programDrawIndices = [
                              uniform.PROJECTIONVIEW
                           ];
  

  webgl.setUniformLocationsAtIndices(this.programs[program.DRAW],
                                              programDrawUniforms,
                                              programDrawIndices);

  window.dispatchEvent(new Event('resize'));
}

Lightning.prototype.addTree = function() {
  var gl = this.webgl.gl;
  var programs = this.programs;
  var program = this.program;
  var varying = this.varying;

  this.trees.push(new LightningTree(this.config));
  var positions = [];
  var colors = [];
  this.totalSegments = 0;

  for (let t = 0; t < this.trees.length; t++) {
    var tree = this.trees[t];
    positions = positions.concat(tree.flatten());
    if (t == 0)
      colors = colors.concat(tree.getColorsWithOpacity(0.5));
    else
      colors = colors.concat(tree.getColors());
    this.totalSegments += tree.segments.length;
  }

  for (var vaoIndex = 0; vaoIndex < this.vertexArrays.length; ++vaoIndex) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.POSITION]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STREAM_COPY);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STREAM_COPY); 

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[vaoIndex][this.varying.POSITION]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }
}

Lightning.prototype.transform = function(config) {
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
  
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[destinationIndex][varying.POSITION]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[destinationIndex][varying.COLOR]);

  gl.uniform1f(prog.uniformLocations[this.uniform.TIME], this.frame);

  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, this.totalSegments * 2);
  gl.endTransformFeedback();


  gl.disable(gl.RASTERIZER_DISCARD);
  gl.useProgram(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  this.currentSourceIndex = (this.currentSourceIndex + 1) % 2;
}

Lightning.prototype.render = function(config, camera) {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var prog = this.programs[this.program.DRAW];
  
  camera.updateMatrixWorld();
  mat4.copy(this._viewMatrix, camera.matrixWorldInverse.elements);
  mat4.copy(this._projectionMatrix, camera.projectionMatrix.elements);
  mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);

  gl.bindVertexArray(this.vertexArrays[this.currentSourceIndex]);

  gl.useProgram(prog);
  gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);
  
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND); 
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.lineWidth(5);
  gl.drawArrays(gl.LINES, 0, this.totalSegments * 2);
}

Lightning.prototype.onUpdate = function(config, camera) {

  this.frame++;

  if (this.frame % 20 == 0) {
    this.trees.shift();
    this.addTree();
  }

  this.transform(config)
  this.render(config, camera)
}

export default function Lightning(config) {

  this.trees = [new LightningTree(config),
                new LightningTree(config)];
  this.totalSegments = 0;

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
    COLOR: 1
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