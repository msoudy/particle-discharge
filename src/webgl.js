WebGL2.prototype.createProgram = function(gl, vertexShader, fragmentShader) {
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

WebGL2.prototype.createShader = function(gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  gl.deleteShader(shader);
}

WebGL2.prototype.createPrograms = function(programs, fileNames) {
    
  var gl = this.gl;

  for (var i = 0; i < fileNames.length; i++) {

    var vertexShaderSource = require('./shaders/' + fileNames[i] + '-vert.glsl');
    var fragmentShaderSource = require('./shaders/' + fileNames[i] + '-frag.glsl');

    var vertexShader = this.createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = this.createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    programs[i] = this.createProgram(gl, vertexShader, fragmentShader);
    programs[i].attributeBuffers = [];
  }
}

WebGL2.prototype.createVBO = function(vertexBuffers, bufferIndex, size, data) {
  var gl = this.gl;

  vertexBuffers[bufferIndex] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[bufferIndex]);
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