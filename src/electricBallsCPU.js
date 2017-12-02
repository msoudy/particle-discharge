import { mat4, vec3, vec4 } from 'gl-matrix';
import LightningBolt from './lightningBolt';
var Cube = require('primitive-cube');


function Ball(pos, vel) {
  this.position = pos;
  this.velocity = vel;
}

ElectricBallsCPU.prototype.initBalls = function() {

  for (var i = 0; i < this.numBalls; i++) {
    var pos = vec3.fromValues((Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,(Math.random() - 0.5) * 10);
    var vel = vec3.fromValues(Math.random() / 10.0,
      Math.random() / 10.0, Math.random() / 10.0);
    var ball = new Ball(pos, vel);
    this.balls.push(ball);
  }

  console.log(this.balls);
}

ElectricBallsCPU.prototype.updateBallPositions = function() {

  var halfWidth = 5.0;
  for (var i = 0; i < this.numBalls; i++) {
    var ball = this.balls[i];

    var x = ball.position[0] + ball.velocity[0];
    var y = ball.position[1] + ball.velocity[1];
    var z = ball.position[2] + ball.velocity[2];

    if (x <= -halfWidth || x >= halfWidth)
      ball.velocity[0] = -ball.velocity[0];
    if (y <= -halfWidth || y >= halfWidth)
      ball.velocity[1] = -ball.velocity[1];
    if (z <= -halfWidth || z >= halfWidth)
      ball.velocity[2] = -ball.velocity[2];

    vec3.add(ball.position, ball.position, ball.velocity);
  }

}

ElectricBallsCPU.prototype.createLightningBolts = function() {

  this.bolts = [];
  var set = new Set();

  for (var i = 0; i < this.numBalls; i++) {
    var ball = this.balls[i];

    for (var j = 0; j < this.numBalls; j++) {

      if (i === j)
        continue;

      var neighbor = this.balls[j]

      var start = this.balls[i].position;
      var end = this.balls[j].position;

      var setValue = `${i}${j}`;

      if (vec3.distance(start,end) < 2.0 && !set.has(`${i}${j}`) && !set.has(`${j}${i}`)) {
        this.bolts.push(new LightningBolt(start, end, 5));
        set.add(setValue);
      }
    }
  }
}

function Instance() {
  this.positions = [];

  // Attributes for every instance
  this.offsets = [];
  this.rotations = [];
  this.colors = [];
  this.numTriangles = 0;
  this.numPoints = 0;
}


function BallInstance() {
  this.positions = [];

  // Attributes for every instance
  this.offsets = [];
  this.velocities = [];
  this.numTriangles = 0;
  this.numPoints = 0;
}

ElectricBallsCPU.prototype.createBoltInstance = function() {
  var instance = new Instance();

  var mesh = Cube(0.1,1,0.1, 1,1,1);

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

  var offsets = [];
  var rotations = [];
  var colors = [];
  this.boltsTotalSegments = 0;

  for (let t = 0; t < this.bolts.length; t++) {
    var bolt = this.bolts[t];
    rotations = rotations.concat(bolt.getInstanceRotations());
    offsets = offsets.concat(bolt.getInstanceOffsets(1.0));
    colors = colors.concat(bolt.getInstanceColors(1.0));
    this.boltsTotalSegments += bolt.segments.length;
  }

  instance.offsets = new Float32Array(offsets);
  instance.rotations = new Float32Array(rotations);
  instance.colors = new Float32Array(colors);

  this.boltInstance = instance;

  return instance;
}

ElectricBallsCPU.prototype.createBallInstance = function() {
  var instance = new BallInstance();

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

  this.ballInstance = instance;

  return instance;
}

ElectricBallsCPU.prototype.initBolts = function() {
  window.dispatchEvent(new Event('resize'));

  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var program = this.program;

  this.webgl.createPrograms(this.boltPrograms, ["emit-bolt-naive", "draw-bolt-naive"]);
  var programs = this.boltPrograms;

  var varyings = ['v_off', 'v_rot', 'v_col'];
  gl.transformFeedbackVaryings(programs[program.TRANSFORM], varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(programs[program.TRANSFORM]);

  var instance = this.createBoltInstance();

  this.boltVertexArrays = [gl.createVertexArray(), gl.createVertexArray()];
  this.boltTransformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

  for (var vaoIndex = 0; vaoIndex < this.boltVertexArrays.length; ++vaoIndex) {
    gl.bindVertexArray(this.boltVertexArrays[vaoIndex]);
    this.boltVertexBuffers[vaoIndex] = [];

    webgl.createVBO(this.boltVertexBuffers[vaoIndex], this.varying.POSITION, 3, instance.positions);
    webgl.createVBO(this.boltVertexBuffers[vaoIndex], this.varying.OFFSET, 3, instance.offsets);
    webgl.createVBO(this.boltVertexBuffers[vaoIndex], this.varying.ROTATION, 3, instance.rotations);
    webgl.createVBO(this.boltVertexBuffers[vaoIndex], this.varying.COLOR, 3, instance.colors);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.boltTransformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.boltVertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.boltVertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.boltVertexBuffers[vaoIndex][this.varying.COLOR]);
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
}


ElectricBallsCPU.prototype.init = function() {
  window.dispatchEvent(new Event('resize'));

  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var program = this.program;

  this.webgl.createPrograms(this.programs, ["emit-ball-naive", "draw-ball-naive"]);
  var programs = this.programs;

  var varyings = ['v_off','v_vel'];
  gl.transformFeedbackVaryings(programs[program.TRANSFORM], varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(programs[program.TRANSFORM]);

  var instance = this.createBallInstance();

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

  this.initBolts();
}

ElectricBallsCPU.prototype.updateBuffers = function() {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var program = this.program;

  var instance = this.createBoltInstance();

  var instanceOffsets = new Float32Array(this.numBalls * 3);
  var instanceVelocities = new Float32Array(this.numBalls * 3);

  for (var i = 0; i < this.numBalls; ++i) {
    var oi = i * 3;
    var vi = i * 3;
    var b = this.balls[i];

    instanceOffsets[oi] = b.position[0];
    instanceOffsets[oi + 1] = b.position[1];
    instanceOffsets[oi + 2] = b.position[2];

    instanceVelocities[vi] = b.velocity[0];
    instanceVelocities[vi + 1] = b.velocity[1];
    instanceVelocities[vi + 2] = b.velocity[2];
  }

  for (var vaoIndex = 0; vaoIndex < 2; ++vaoIndex) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.boltVertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instance.offsets), gl.STREAM_COPY);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, this.boltVertexBuffers[vaoIndex][this.varying.ROTATION]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instance.rotations), gl.STREAM_COPY); 

    gl.bindBuffer(gl.ARRAY_BUFFER, this.boltVertexBuffers[vaoIndex][this.varying.COLOR]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instance.colors), gl.STREAM_COPY); 

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceOffsets), gl.STREAM_COPY);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][this.varying.VELOCITY]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceVelocities), gl.STREAM_COPY); 

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}

ElectricBallsCPU.prototype.transformBolts = function() {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var prog = this.boltPrograms[this.program.TRANSFORM];

  var destinationIndex = (this.boltCurrentSourceIndex + 1) % 2;
  var sourceVAO = this.boltVertexArrays[this.boltCurrentSourceIndex];

  //gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(prog);

  gl.bindVertexArray(sourceVAO);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.boltTransformFeedbacks[destinationIndex]);
  
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.boltVertexBuffers[destinationIndex][varying.OFFSET]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.boltVertexBuffers[destinationIndex][varying.ROTATION]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.boltVertexBuffers[destinationIndex][varying.COLOR]);

  gl.uniform1f(prog.uniformLocations[this.uniform.TIME], this.frame);

  gl.vertexAttribDivisor(varying.OFFSET, 0);
  gl.vertexAttribDivisor(varying.ROTATION, 0);
  gl.vertexAttribDivisor(varying.COLOR, 0);

  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, this.boltsTotalSegments);
  gl.endTransformFeedback();


  gl.disable(gl.RASTERIZER_DISCARD);
  gl.useProgram(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  this.boltCurrentSourceIndex = (this.boltCurrentSourceIndex + 1) % 2;
}

ElectricBallsCPU.prototype.renderBolts = function(camera) {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  var prog = this.boltPrograms[this.program.DRAW];
  camera.updateMatrixWorld();
  mat4.invert(this._viewMatrix, camera.matrixWorld.elements);
  mat4.copy(this._projectionMatrix, camera.projectionMatrix.elements);
  mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);
  
  gl.bindVertexArray(this.boltVertexArrays[this.boltCurrentSourceIndex]);

  gl.vertexAttribDivisor(varying.OFFSET, 1);
  gl.vertexAttribDivisor(varying.ROTATION, 1);
  gl.vertexAttribDivisor(varying.COLOR, 1);

  gl.useProgram(prog);
  gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);

  gl.drawArraysInstanced(gl.TRIANGLES, 0, this.boltInstance.numTriangles * 3, this.boltsTotalSegments);
}

ElectricBallsCPU.prototype.transform = function() {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var prog = this.programs[this.program.TRANSFORM];

  var destinationIndex = (this.currentSourceIndex + 1) % 2;
  var sourceVAO = this.vertexArrays[this.currentSourceIndex];

  gl.clear(gl.COLOR_BUFFER_BIT);

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

ElectricBallsCPU.prototype.render = function(camera) {
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


  gl.drawArraysInstanced(gl.TRIANGLES, 0, this.ballInstance.numTriangles * 3, this.numBalls);
}

ElectricBallsCPU.prototype.onUpdate = function(config, camera) {
  this.frame++;

  this.transform();
  this.render(camera);
  this.transformBolts();
  this.renderBolts(camera);

  this.updateBallPositions();
  if (this.frame % 5 == 0)
    this.createLightningBolts();
  this.updateBuffers();
}

export default function ElectricBallsCPU(config, numBalls, radius, gridWidth) {

  this.numBalls = numBalls;
  this.radius = radius;
  this.gridWidth = gridWidth;

  this.balls = [];
  this.bolts = [];
  this.boltsTotalSegments = 0;

  this.ballInstance;
  this.boltInstance;

  this.programs = [];
  this.vertexArrays = [];
  this.vertexBuffers = [];
  this.transformFeedbacks = [];

  this.boltPrograms = []
  this.boltVertexArrays = [];
  this.boltVertexBuffers = [];
  this.boltTransformFeedbacks = [];

  this.program = {
    TRANSFORM: 0,
    DRAW: 1
  }

  this.varying = {
    POSITION: 0,
    OFFSET: 1,
    VELOCITY: 2,
    ROTATION: 3,
    COLOR: 4
  }

  this.uniform = {
    PROJECTIONVIEW: 0,
    TIME: 1
  };

  this.frame = 0;
  this.config = config;
  this.webgl = config.webgl;

  this.currentSourceIndex = 0;
  this.boltCurrentSourceIndex = 0;

  this._projectionMatrix = mat4.create();
  this._viewMatrix = mat4.create();
  this._viewProjectionMatrix = mat4.create();

  this.initBalls();
  this.createLightningBolts();

}