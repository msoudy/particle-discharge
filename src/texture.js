
Texture.prototype.bufferIndex = function(index, component) {
  return 4 * index + 4 * component * this._elementCount;
}

Texture.prototype.getTexture = function() {
  return this._glTexture
}

Texture.prototype.getBuffer = function() {
  return this._buffer
}

Texture.prototype.update = function() {
  var gl = this.gl;
  gl.bindTexture(gl.TEXTURE_2D, this._glTexture);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._elementCount, this._pixelsPerElement, gl.RGBA, gl.FLOAT, this._buffer);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

export default function Texture(elementCount, elementSize, gl, index) {
    this.gl = gl;
    this.index = index;

    this._glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this._pixelsPerElement = Math.ceil(elementSize / 4);
    this._elementCount = elementCount;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, elementCount, this._pixelsPerElement, 0, gl.RGBA, gl.FLOAT, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this._buffer = new Float32Array(elementCount * 4 * this._pixelsPerElement);
}