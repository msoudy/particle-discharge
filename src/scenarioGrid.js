import {vec3} from 'gl-matrix';

function Ball(pos, vel) {
  this.position = pos;
  this.velocity = vel;
  this.radius = 0.1;
  this.minX = 0.0;
  this.maxX = 0.0;
}

ScenarioGrid.prototype.updateBallPositions = function(frame) {

  if ( (Math.floor(frame / 30) % 2)  != 0)
    return;

  var width = 10.0;
  for (var i = 0; i < this.numBalls; i++) {
    var ball = this.balls[i];

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

ScenarioGrid.prototype.getBallPositions = function() {


  var cbrt_num_balls = Math.cbrt(this.numBalls);

  for (var x = 0; x < cbrt_num_balls;  x++) {
    for (var y = 0; y < cbrt_num_balls;  y++) {
      for (var z = 0; z < cbrt_num_balls;  z++) {

      var pos = vec3.fromValues(x,y,z);
      var rand = Math.random() * 3.0;
      var vel = vec3.fromValues(0,0,0);
      if (rand <= 1.0)
        vel = vec3.fromValues(0.1/3.0,0,0);
      else if (rand <= 2.0)
        vel = vec3.fromValues(0,0.1/3.0,0);
      else if (rand <= 3.0)
        vel = vec3.fromValues(0,0,0.1/3.0);
      var ball = new Ball(pos, vel);
      this.balls.push(ball);

      }
    }
  }

  return this.balls;
}

export default function ScenarioGrid(numBalls) {

  this.balls = [];
  this.numBalls = numBalls;

}