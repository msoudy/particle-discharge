import { mat4, vec3, vec4 } from 'gl-matrix';
import Texture from './texture';
import Cluster from './cluster';
import ScenarioGrid from './scenarioGrid';

const SCENARIO_DEFAULT = 'Default';
const SCENARIO_GRID = 'Grid';

function ParticleSystem(numParticles) {
  this.positions = [];
  this.velocities = [];
  this.properties = [];
  this.origins = [];
  this.colors = [];

  this.numParticles = numParticles;
}

ParticleBolt.prototype.initParticleSystem = function() {

  var particlesPerVoxel = 100;
  var maxNeighborConnections = this.config.maxNeighbors;
  var numVoxels = this.balls.length;
  var numParticles = particlesPerVoxel * numVoxels * maxNeighborConnections;

  var particleSystem = new ParticleSystem(numParticles);

  var total = particleSystem.numParticles * 4;
  var cbrt_particles_per_voxel = Math.cbrt(particlesPerVoxel);
  var divisor = 5.0;

  var positions = [];
  var velocities = [];
  var properties = [];
  var origins = [];
  var colors = [];

  var count = 0;

  for (var b = 0; b < this.balls.length; b++) {
    var ball = this.balls[b];

    for (let n = 0; n < maxNeighborConnections; n++) {
      var index = 0;
      var random = Math.random();
      for (let i = 0; i < particlesPerVoxel; i++) {
        positions.push(ball.position[0]);
        positions.push(ball.position[1]);
        positions.push(ball.position[2]);
        positions.push(index++);

        origins.push((Math.random()-0.5)/10.0);
        origins.push((Math.random()-0.5)/10.0);
        origins.push((Math.random()-0.5)/10.0);

        velocities.push(0);
        velocities.push(0);
        velocities.push(0);

        properties.push(b); // ball index
        properties.push(n); // neighbor index
        properties.push(random); // to randomize look for each bolt
        properties.push(Math.random()); // to offset particle position from ball center

        colors.push(1.0);
        colors.push(1.0);
        colors.push(1.0);
        colors.push(1.0 + Math.random()*20.0); // particle mass
      }
    }

  }

  particleSystem.positions = new Float32Array(positions);
  particleSystem.velocities = new Float32Array(velocities);
  particleSystem.properties = new Float32Array(properties);
  particleSystem.colors = new Float32Array(colors);
  particleSystem.origins = new Float32Array(origins);

  this.particleSystem = particleSystem;
  return particleSystem;
}


function Ball(pos, vel) {
  this.position = pos;
  this.velocity = vel;
  this.radius = 0.1;
  this.minX = 0.0;
  this.maxX = 0.0;
}

ParticleBolt.prototype.initBalls = function() {

  if (this.config.scenario == SCENARIO_GRID) {
    this.numBalls = 1000;
    this.config.numBalls = 1000;
    this.config.maxNeighbors = 1;
    this.grid = new ScenarioGrid(this.numBalls);
    this.balls = this.grid.getBallPositions();
    return;
  }

  var v = 0.01;
  var p = 1.0;

  if (this.numBalls == 2) {
    var vel = vec3.fromValues(0.0,0,0);
    this.balls.push(new Ball(vec3.fromValues(4.8,5,5), vel));
    this.balls.push(new Ball(vec3.fromValues(5.2,5,5), vel));
    return;
  }

  if (this.numBalls == 3) {
    var vel = vec3.fromValues(0.0,0,0);
    this.balls.push(new Ball(vec3.fromValues(4.8,5,5), vel));
    this.balls.push(new Ball(vec3.fromValues(5.2,5,5), vel));
    this.balls.push(new Ball(vec3.fromValues(5.0,5.5,5), vel));
    return;
  }

  if (this.numBalls == 4) {
    var vel = vec3.fromValues(0.0,0,0);
    this.balls.push(new Ball(vec3.fromValues(4.8,5,5), vel));
    this.balls.push(new Ball(vec3.fromValues(5.2,5,5), vel));
    this.balls.push(new Ball(vec3.fromValues(5.0,5.5,5), vel));
    this.balls.push(new Ball(vec3.fromValues(5.0,5.0,4.5), vel));
    return;
  }

  for (var i = 0; i < this.numBalls; i++) {
    var pos = vec3.fromValues(Math.random()*10.0,Math.random()*10.0,Math.random()*10.0);
    var vel = vec3.fromValues((Math.random()-0.5)/100.0,(Math.random()-0.5)/100.0,(Math.random()-0.5)/100.0);
    var ball = new Ball(pos, vel);
    ball.minX = -5;
    ball.maxX = 5;
    this.balls.push(ball);
  }

}

ParticleBolt.prototype.updateBallPositions = function() {

  // if (this.config.scenario == SCENARIO_GRID) {
  //   this.grid.updateBallPositions(this.frame);
  //   return;
  // } 

  var width = 10.0;
  for (var i = 0; i < this.numBalls; i++) {
    var ball = this.balls[i];

    var velocity = ball.velocity;

    if (this.config.mouseActive && this.config.activateMouse) {

      var desired = vec3.fromValues(0,0,0);
      vec3.subtract(desired, this.config.mousePoint, ball.position); 
      var dist = vec3.length(desired);

      vec3.normalize(desired, desired);
      var maxSpeed = 0.01;
      vec3.multiply(desired, desired, vec3.fromValues(maxSpeed,maxSpeed,maxSpeed))

      var steer = vec3.fromValues(0,0,0);
      vec3.subtract(steer, desired, velocity);
      var mass = Math.random() * 10.0 + 1.0;
      vec3.divide(steer, steer, vec3.fromValues(mass,mass,mass));
      vec3.add(velocity, velocity, steer);
    }


    var x = ball.position[0] + ball.velocity[0];
    var y = ball.position[1] + ball.velocity[1];
    var z = ball.position[2] + ball.velocity[2];

    if (x <= 0 || x >= width)
      ball.velocity[0] = -ball.velocity[0];
    if (y <= 0 || y >= width)
      ball.velocity[1] = -ball.velocity[1];
    if (z <= 0 || z >= width)
      ball.velocity[2] = -ball.velocity[2];

    vec3.add(ball.position, ball.position, ball.velocity);
  }
}

ParticleBolt.prototype.updateBallTexture = function() {

  for (let i = 0; i < this.numBalls; ++i) {
    this._ballTexture._buffer[this._ballTexture.bufferIndex(i, 0) + 0] = this.balls[i].position[0];
    this._ballTexture._buffer[this._ballTexture.bufferIndex(i, 0) + 1] = this.balls[i].position[1];
    this._ballTexture._buffer[this._ballTexture.bufferIndex(i, 0) + 2] = this.balls[i].position[2];
    this._ballTexture._buffer[this._ballTexture.bufferIndex(i, 0) + 3] = this.balls[i].radius;

    this._ballTexture._buffer[this._ballTexture.bufferIndex(i, 1) + 0] = this.balls[i].velocity[0];
    this._ballTexture._buffer[this._ballTexture.bufferIndex(i, 1) + 1] = this.balls[i].velocity[1];
    this._ballTexture._buffer[this._ballTexture.bufferIndex(i, 1) + 2] = this.balls[i].velocity[2];
  }

  this._ballTexture.update();
}


ParticleBolt.prototype.updateBuffers = function() {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var program = this.program;

  var instanceOffsets = new Float32Array(this.numBalls * 3);

  for (var i = 0; i < this.numBalls; ++i) {
    var oi = i * 3;
    var vi = i * 3;
    var b = this.balls[i];

    instanceOffsets[oi] = b.position[0];
    instanceOffsets[oi + 1] = b.position[1];
    instanceOffsets[oi + 2] = b.position[2];
  }

  for (var vaoIndex = 0; vaoIndex < 1; ++vaoIndex) {

    gl.bindBuffer(gl.ARRAY_BUFFER, this.ballVertexBuffers[vaoIndex][this.varying.OFFSET]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceOffsets), gl.STREAM_COPY);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}

function Instance() {
  this.positions = [];
  this.normals = [];
  this.numTriangles = 0;
  this.numPoints = 0;

  // Attributes for every instance
  this.offsets = [];
}

ParticleBolt.prototype.createBall = function() {
  var instance = new Instance();

  var mesh = require('primitive-icosphere')(this.config.ballRadius, {subdivisions: 1})
  //console.log(mesh);

  var tris = [];

  for (var i = 0; i < mesh.cells.length; ++i) {
    var triIndices = mesh.cells[i];
    tris.push(mesh.positions[triIndices[0]]);
    tris.push(mesh.positions[triIndices[1]]);
    tris.push(mesh.positions[triIndices[2]]);
  }
  //console.log(tris);

  tris = new Float32Array([].concat.apply([], tris));
  var points = new Float32Array([].concat.apply([], mesh.positions))
  instance.positions = tris;

  instance.normals = new Float32Array([].concat.apply([], mesh.normals));
  instance.numTriangles = mesh.cells.length;
  instance.numPoints = mesh.cells.length * 3;

  var numBalls = this.numBalls;
  var instanceOffsets = new Float32Array(numBalls * 3);
  var vel = 0.1;

  for (var i = 0; i < numBalls; ++i) {
    var oi = i * 3;
    var vi = i * 3;

    instanceOffsets[oi] = 0;
    instanceOffsets[oi + 1] = i;
    instanceOffsets[oi + 2] = 0;
  }

  instance.offsets = instanceOffsets;

  this.instance = instance;

  return instance;
}

ParticleBolt.prototype.initBall = function() {
  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var program = this.program;

  this.webgl.createPrograms(this.ballPrograms, ["draw-ball"]);
  var programs = this.ballPrograms;

  var instance = this.createBall();

  this.ballVertexArrays = [gl.createVertexArray()];

  for (var vaoIndex = 0; vaoIndex < this.ballVertexArrays.length; ++vaoIndex) {
    gl.bindVertexArray(this.ballVertexArrays[vaoIndex]);
    this.ballVertexBuffers[vaoIndex] = [];

    webgl.createVBO(this.ballVertexBuffers[vaoIndex], this.varying.POSITION, 3, instance.positions);
    webgl.createVBO(this.ballVertexBuffers[vaoIndex], this.varying.OFFSET, 3, instance.offsets);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  var programDrawUniforms = ["u_projectionView"];
  
  var programDrawIndices = [uniform.PROJECTIONVIEW];
  
  webgl.setUniformLocationsAtIndices(programs[0],
                                              programDrawUniforms,
                                              programDrawIndices);

}

ParticleBolt.prototype.init = function() {
  var webgl = this.webgl;
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;
  var program = this.program;

  this.webgl.createPrograms(this.programs, ["emit-particle-bolt", "draw-particle-bolt"]);
  var programs = this.programs;

  var varyings = ['v_pos','v_vel','v_pro','v_col'];
  gl.transformFeedbackVaryings(programs[program.TRANSFORM], varyings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(programs[program.TRANSFORM]);

  var particles = this.initParticleSystem();

  this.vertexArrays = [gl.createVertexArray(), gl.createVertexArray()];
  this.transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

  for (var vaoIndex = 0; vaoIndex < this.vertexArrays.length; ++vaoIndex) {
    gl.bindVertexArray(this.vertexArrays[vaoIndex]);
    this.vertexBuffers[vaoIndex] = [];

    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.POSITION, 4, particles.positions);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.VELOCITY, 3, particles.velocities);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.PROPERTY, 4, particles.properties);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.COLOR, 4, particles.colors);
    webgl.createVBO(this.vertexBuffers[vaoIndex], this.varying.ORIGIN, 3, particles.origins);


    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[vaoIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[vaoIndex][this.varying.POSITION]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[vaoIndex][this.varying.VELOCITY]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.vertexBuffers[vaoIndex][this.varying.PROPERTY]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 3, this.vertexBuffers[vaoIndex][this.varying.COLOR]);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }

  var programTransformUniforms = ["u_time", "u_random","u_ballsbuffer","u_clusterbuffer",
                                  "u_neighbor_radius", "u_particle_physics", "u_current", "u_randomize_current"];
  var programTransformIndices = [uniform.TIME, uniform.RANDOM, uniform.BALLS, uniform.CLUSTER,
                                  uniform.NEIGHBOR_RADIUS, uniform.PARTICLE_PHYSICS, uniform.CURRENT, uniform.RANDOMIZE_CURRENT];
  webgl.setUniformLocationsAtIndices(programs[program.TRANSFORM],
                                              programTransformUniforms,
                                              programTransformIndices);

  var programDrawUniforms = ["u_projectionView"];
  
  var programDrawIndices = [uniform.PROJECTIONVIEW];
  
  webgl.setUniformLocationsAtIndices(programs[program.DRAW],
                                              programDrawUniforms,
                                              programDrawIndices);

  window.dispatchEvent(new Event('resize'));

  this.initBall();
}

ParticleBolt.prototype.transform = function() {
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
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.vertexBuffers[destinationIndex][varying.VELOCITY]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.vertexBuffers[destinationIndex][varying.PROPERTY]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 3, this.vertexBuffers[destinationIndex][varying.COLOR]);

  gl.uniform1f(prog.uniformLocations[this.uniform.TIME], this.frame);
  gl.uniform1f(prog.uniformLocations[this.uniform.RANDOM], Math.random());
  gl.uniform1f(prog.uniformLocations[this.uniform.NEIGHBOR_RADIUS], this.config.neighborRadius);
  gl.uniform1f(prog.uniformLocations[this.uniform.PARTICLE_PHYSICS], this.config.particlePhysics);
  gl.uniform1f(prog.uniformLocations[this.uniform.CURRENT], this.config.current);
  gl.uniform1f(prog.uniformLocations[this.uniform.RANDOMIZE_CURRENT], this.config.randomizeCurrent);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._ballTexture.getTexture());
  gl.uniform1i(prog.uniformLocations[this.uniform.BALLS], 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this.cluster._clusterTexture.getTexture());
  gl.uniform1i(prog.uniformLocations[this.uniform.CLUSTER], 1);

  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, this.particleSystem.numParticles);
  gl.endTransformFeedback();

  gl.disable(gl.RASTERIZER_DISCARD);
  gl.useProgram(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  this.currentSourceIndex = (this.currentSourceIndex + 1) % 2;
}


ParticleBolt.prototype.render = function(camera) {
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

  gl.useProgram(prog);
  gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);

  gl.drawArrays(gl.POINTS, 0, this.particleSystem.numParticles);
}

ParticleBolt.prototype.renderBalls = function(camera) {
  var gl = this.webgl.gl;
  var varying = this.varying;
  var uniform = this.uniform;

  var prog = this.ballPrograms[0];
  camera.updateMatrixWorld();
  mat4.invert(this._viewMatrix, camera.matrixWorld.elements);
  mat4.copy(this._projectionMatrix, camera.projectionMatrix.elements);
  mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);
  
  gl.bindVertexArray(this.ballVertexArrays[0]);

  gl.vertexAttribDivisor(varying.OFFSET, 1);

  gl.useProgram(prog);
  gl.uniformMatrix4fv(prog.uniformLocations[uniform.PROJECTIONVIEW], false, this._viewProjectionMatrix);

  gl.drawArraysInstanced(gl.TRIANGLES, 0, this.instance.numPoints, this.numBalls);
}


ParticleBolt.prototype.onUpdate = function(config, camera) {
  this.frame++;

  this.transform();
  this.render(camera);
  this.renderBalls(camera);


  this.updateBallPositions();
  this.cluster.update(this.balls);
  this.updateBallTexture();
  this.updateBuffers();
}

export default function ParticleBolt(config, numBalls, radius, gridWidth) {

  this.radius = radius;
  this.gridWidth = gridWidth;

  this.ballPrograms = [];
  this.ballVertexArrays = [];
  this.ballVertexBuffers = [];
  this.balls = [];
  this.numBalls = numBalls;

  this.programs = [];
  this.vertexArrays = [];
  this.vertexBuffers = [];
  this.transformFeedbacks = [];
  this.particleSystem;

  this.program = {
    TRANSFORM: 0,
    DRAW: 1
  }

  this.varying = {
    POSITION: 0,
    VELOCITY: 1,
    OFFSET: 2,
    PROPERTY: 3,
    COLOR: 4,
    ORIGIN: 5
  }

  this.uniform = {
    PROJECTIONVIEW: 0,
    TIME: 1,
    RANDOM: 2,
    BALLS: 3,
    CLUSTER: 4,
    NEIGHBOR_RADIUS: 5,
    PARTICLE_PHYSICS: 6,
    CURRENT: 7,
    RANDOMIZE_CURRENT: 8
  };

  this.frame = 0;
  this.config = config;
  this.webgl = config.webgl;

  this.currentSourceIndex = 0;

  this._projectionMatrix = mat4.create();
  this._viewMatrix = mat4.create();
  this._viewProjectionMatrix = mat4.create();

  this.initBalls();
  this._ballTexture = new Texture(this.numBalls, 8, this.webgl.gl, 0);
  this.updateBallTexture();
  this.cluster = new Cluster(10,10,10, this.balls, this.webgl.gl);
  this.cluster.update(this.balls);

  // scenarios

  this.grid;
}