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
  var colors = [];
  this.totalSegments = 0;

  for (let t = 0; t < this.trees.length; t++) {
    var tree = this.trees[t];
    rotations = rotations.concat(tree.getInstanceRotations());
    if (t == 0){
      offsets = offsets.concat(tree.getInstanceOffsets(0.5));
      colors = colors.concat(tree.getInstanceColors(0.5));
    }
    else {
      offsets = offsets.concat(tree.getInstanceOffsets(1.0));
      colors = colors.concat(tree.getInstanceColors(1.0));
    }
    this.totalSegments += tree.segments.length;
  }

  instance.offsets = new Float32Array(offsets);
  instance.rotations = new Float32Array(rotations);
  instance.colors = new Float32Array(colors);

  this.instance = instance;

  return instance;
}

LightningInstanced.prototype.addTree = function() {
  var gl = this.webgl.gl;
  var programs = this.programs;
  var program = this.program;
  var varying = this.varying;

  var offsetStart = (Math.random() - 0.5) * 20;

  this.trees.push(new LightningTree(vec3.fromValues(0,this.startPoint[1],0), 
                                    vec3.fromValues(offsetStart,this.endPoint[1],0), this.config));

  var instance = this.createInstance();

  for (var vaoIndex = 0; vaoIndex < 2; ++vaoIndex) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instance.offsets), gl.STREAM_COPY);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instance.rotations), gl.STREAM_COPY); 

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instance.colors), gl.STREAM_COPY); 

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.vertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }
}

LightningInstanced.prototype.init = function() {
  window.dispatchEvent(new Event('resize'));

  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var program = this.program;
  var varying = this.varying;
  var uniform = this.uniform;

  this.webgl.createPrograms(this.programs, ['emit-instanced', 'draw-instanced'],
                                       ['horizontal-blur', 'vertical-blur', 'gaussian-blur']);
  var programs = this.programs;

  var varyings = ['outOffset', 'outRotation', 'outColor'];
  gl.transformFeedbackVaryings(programs[program.TRANSFORM], varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(programs[program.TRANSFORM]);

  var instance = this.createInstance();

  this.vertexArrays = [gl.createVertexArray(), gl.createVertexArray(), 
                        gl.createVertexArray(), gl.createVertexArray(), gl.createVertexArray()];
  this.transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

  for (var vaoIndex = 0; vaoIndex < 2; ++vaoIndex) {
    gl.bindVertexArray(this.vertexArrays[vaoIndex]);
    this.vertexBuffers[vaoIndex] = [];

    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.OFFSET, 4, instance.offsets);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.ROTATION, 3, instance.rotations);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.POSITION, 3, instance.positions);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.COLOR, 4, instance.colors);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.vertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }

  for (var vaoIndex = 2; vaoIndex < 5; ++vaoIndex) {
    gl.bindVertexArray(this.vertexArrays[vaoIndex]);
    this.vertexBuffers[vaoIndex] = [];
    var texPos = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
       1.0,  1.0,
       1.0,  1.0,
      -1.0,  1.0,
      -1.0, -1.0
    ]);

    this.vertexBuffers[vaoIndex][this.varying.TEXPOS] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.TEXPOS]);
    gl.bufferData(gl.ARRAY_BUFFER, texPos, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.varying.TEXPOS, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.varying.TEXPOS);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var programPostUniforms = ["diffuse"];
    var programPostIndices = [uniform.DIFFUSE];

    if (vaoIndex == this.post.GAUSSIAN_BLUR) {
      programPostUniforms.push("u_blur");
      programPostIndices.push(uniform.BLUR);
    }

    webgl.setUniformLocationsAtIndices(programs[vaoIndex],
                                              programPostUniforms,
                                              programPostIndices);

    this.textures[vaoIndex] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textures[vaoIndex]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    gl.canvas.width, gl.canvas.height, 0,
                    gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.framebuffers[vaoIndex] = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[vaoIndex]);
     
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[vaoIndex], 0);

    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      console.log("Framebuffer error");
      return false;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }


  var programTransformUniforms = [
                                    "u_time"
                                  ];
  
  var programTransformIndices = [uniform.TIME];
  
  webgl.setUniformLocationsAtIndices(programs[program.TRANSFORM],
                                              programTransformUniforms,
                                              programTransformIndices);
  
  var programDrawUniforms = [
                              "u_projectionView",
                              "u_time"
                          ];
  
  var programDrawIndices = [
                              uniform.PROJECTIONVIEW,
                              uniform.TIME
                           ];
  
  webgl.setUniformLocationsAtIndices(programs[program.DRAW],
                                              programDrawUniforms,
                                              programDrawIndices);

}

LightningInstanced.prototype.transform = function() {
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
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[destinationIndex][varying.ROTATION]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.vertexBuffers[destinationIndex][varying.COLOR]);

  gl.uniform1f(prog.uniformLocations[this.uniform.TIME], this.frame);

  gl.vertexAttribDivisor(varying.OFFSET, 0);
  gl.vertexAttribDivisor(varying.ROTATION, 0);
  gl.vertexAttribDivisor(varying.COLOR, 0);

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

LightningInstanced.prototype.render = function(camera) {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;

  var frameBufferIndex = null;
  // render to texture
  if (this.config.glow)
    frameBufferIndex = this.framebuffers[this.post.HORIZONTAL_BLUR]

  {  
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferIndex);
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
    gl.vertexAttribDivisor(varying.ROTATION, 1);
    gl.vertexAttribDivisor(varying.COLOR, 1);

    gl.useProgram(prog);
    gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);

    if (this.mode == POINTS)
      gl.drawArraysInstanced(gl.POINTS, 0, this.instance.numPoints, this.totalSegments);
    else if (this.mode == TRIANGLES)
      gl.drawArraysInstanced(gl.TRIANGLES, 0, this.instance.numTriangles * 3, this.totalSegments);
  }

}

LightningInstanced.prototype.postProcess = function() {
  var gl = this.webgl.gl;
  var uniform = this.uniform;

  // render to canvas
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.post.VERTICAL_BLUR]);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var prog = this.programs[this.post.HORIZONTAL_BLUR];
    gl.bindVertexArray(this.vertexArrays[this.post.HORIZONTAL_BLUR]);

    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.post.HORIZONTAL_BLUR]);
    gl.uniform1i(prog.uniformLocations[uniform.DIFFUSE], 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.post.GAUSSIAN_BLUR]);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var prog = this.programs[this.post.VERTICAL_BLUR];
    gl.bindVertexArray(this.vertexArrays[this.post.VERTICAL_BLUR]);

    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.post.VERTICAL_BLUR]);
    gl.uniform1i(prog.uniformLocations[uniform.DIFFUSE], 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var prog = this.programs[this.post.GAUSSIAN_BLUR];
    gl.bindVertexArray(this.vertexArrays[this.post.GAUSSIAN_BLUR]);

    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.post.HORIZONTAL_BLUR]);
    gl.uniform1i(prog.uniformLocations[uniform.DIFFUSE], 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.post.GAUSSIAN_BLUR]);
    gl.uniform1i(prog.uniformLocations[uniform.BLUR], 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

LightningInstanced.prototype.onUpdate = function(config, camera) {
  this.frame++;

  if (this.frame % 40 == 0) {
    this.trees.shift();
    this.addTree();
  }

  this.transform();
  this.render(camera);
  if (this.config.glow)
    this.postProcess();
}

export default function LightningInstanced(mode, config) {

  this.mode = mode;
  this.startPoint = vec3.fromValues(0,15,0);
  this.endPoint = vec3.fromValues(0,-15,0);
  this.trees = [new LightningTree(this.startPoint, this.endPoint, config),
               new LightningTree(this.startPoint, this.endPoint, config)];
  this.totalSegments = 0;

  this.programs = [];
  this.vertexArrays = [];
  this.vertexBuffers = [];
  this.transformFeedbacks = [];
  this.framebuffers = [];
  this.textures = [];

  this.instance;

  this.program = {
    TRANSFORM: 0,
    DRAW: 1,
    POST: 2
  }

  this.post = {
    HORIZONTAL_BLUR: 2,
    VERTICAL_BLUR: 3,
    GAUSSIAN_BLUR: 4
  }

  this.varying = {
    OFFSET: 0,
    ROTATION: 1,
    POSITION: 2,
    COLOR: 3,
    TEXPOS: 4
  }

  this.uniform = {
    TIME: 0,
    PROJECTIONVIEW: 1,
    DIFFUSE: 2,
    BLUR: 3
  };

  this.frame = 0;
  this.config = config;
  this.webgl = config.webgl;

  this.currentSourceIndex = 0;

  this._projectionMatrix = mat4.create();
  this._viewMatrix = mat4.create();
  this._viewProjectionMatrix = mat4.create();
}