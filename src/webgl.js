function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  gl.deleteProgram(program);
}

function createShader(gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  gl.deleteShader(shader);
}

WebGL2.prototype.createPrograms = function(fileNames) {
    
  var gl = this.gl;

  for (var i = 0; i < fileNames.length; i++) {

    var vertexShaderSource = require('./shaders/' + fileNames[i] + '-vert.glsl');
    var fragmentShaderSource = require('./shaders/' + fileNames[i] + '-frag.glsl');

    var vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    this.programs[i] = createProgram(gl, vertexShader, fragmentShader);
    this.programs[i].attributeBuffers = [];
  }
    
  return this.programs;
}

WebGL2.prototype.createVBO = function(vaoIndex, bufferIndex, size, data) {
  var gl = this.gl;

  this.vertexBuffers[vaoIndex][bufferIndex] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[vaoIndex][bufferIndex]);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_COPY);
  gl.vertexAttribPointer(bufferIndex, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(bufferIndex);

}
    
WebGL2.prototype.setUniformLocationsAtIndices = function (program, uniformNames, uniformIndices) {
    
  var gl = this.gl;
  
  if ("undefined" === typeof program.uniformLocations)
    program.uniformLocations = [];
  
  for (var i = 0; i < uniformNames.length; i++) {
    program.uniformLocations[uniformIndices[i]] = gl.getUniformLocation(program, uniformNames[i]);
  }  
  
  return program.uniformLocations;
}


export default function WebGL2() {
	   
    this.canvas = document.getElementById('canvas');
    this.gl = canvas.getContext('webgl2');

    this.program = {
      TRANSFORM: 0,
      DRAW: 1,
      PARTICLES: 0
    }

    this.programs = [];
    this.vertexBuffers = [];
    this.vertexArrays = [];
    this.transformFeedbacks = [];

    window.addEventListener('resize', function() {
        resize(canvas);
    }, false); 

}

function resize(canvas) {
  var cssToActualPixels = window.devicePixelRatio || 1;

  var screenWidth  = Math.floor(canvas.clientWidth  * cssToActualPixels);
  var screenHeight = Math.floor(canvas.clientHeight * cssToActualPixels);

  if (canvas.width  !== screenWidth || canvas.height !== screenHeight) 
  {
    canvas.width  = screenWidth;
    canvas.height = screenHeight;
  }
}