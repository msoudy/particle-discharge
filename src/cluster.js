import { mat4, vec4, vec3 } from 'gl-matrix';
import Texture from './texture';

export const MAX_BALLS_PER_CLUSTER = 100;

Cluster.prototype.update = function(balls) {

  for (let z = 0; z < this._zSlices; ++z) {
    for (let y = 0; y < this._ySlices; ++y) {
      for (let x = 0; x < this._xSlices; ++x) {
        let i = x + y * this._xSlices + z * this._xSlices * this._ySlices;
        this._clusterTexture._buffer[this._clusterTexture.bufferIndex(i, 0)] = 0;
      }
    }
  }

  for (let b = 0; b < balls.length; ++b) {

    var ball = balls[b];

    let ballPosX = Math.floor(ball.position[0]);
    let ballPosY = Math.floor(ball.position[1]);
    let ballPosZ = Math.floor(ball.position[2]);

    let i = ballPosX + ballPosY*this._xSlices + ballPosZ*this._ySlices*this._xSlices;

    let clusterIndex = this._clusterTexture.bufferIndex(i, 0);
    let numBalls = 1 + this._clusterTexture._buffer[clusterIndex];

    if (numBalls <= MAX_BALLS_PER_CLUSTER) {           
      let col = Math.floor(numBalls / 4);
      let row = Math.floor(numBalls % 4);    
      this._clusterTexture._buffer[clusterIndex] = numBalls;
      this._clusterTexture._buffer[this._clusterTexture.bufferIndex(i, col) + row] = b;
    }
  }

  this._clusterTexture.update();
}

export default function Cluster(xSlices, ySlices, zSlices, numBalls, gl) {
  this._clusterTexture = new Texture(xSlices * ySlices * zSlices, MAX_BALLS_PER_CLUSTER + 1, gl);
  this._xSlices = xSlices;
  this._ySlices = ySlices;
  this._zSlices = zSlices;
}