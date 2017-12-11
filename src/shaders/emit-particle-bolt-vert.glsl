#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;

#define POSITION_LOCATION 0
#define VELOCITY_LOCATION 1
#define PROPERTY_LOCATION 3
#define COLOR_LOCATION 4
#define ORIGIN_LOCATION 5

uniform float u_time;
uniform float u_random;
uniform float u_neighbor_radius;
uniform float u_particle_physics;
uniform float u_current;
uniform float u_randomize_current;

uniform sampler2D u_ballsbuffer;
uniform sampler2D u_clusterbuffer;

layout(location = POSITION_LOCATION) in vec4 a_pos;
layout(location = VELOCITY_LOCATION) in vec3 a_vel;
layout(location = PROPERTY_LOCATION) in vec4 a_pro;
layout(location = COLOR_LOCATION) in vec4 a_col;
layout(location = ORIGIN_LOCATION) in vec3 a_ori;

out vec4 v_pos;
out vec3 v_vel;
out vec4 v_pro;
out vec4 v_col;

const vec3 ball0 = vec3(-0.5,0,0);
const vec3 ball1 = vec3(0.5,0,0);
const int maxBalls = 100;
const int xSlices = 10;
const int ySlices = 10;
const int zSlices = 10;

float map (float v, float range1, float range1end, float range2, float range2end) {
  return (v - range1) / (range1end - range1) * (range2end - range2) + range2;
}

float triangle_wave(float frequency, float amplitude, float x) {
  return (amplitude/frequency) * (frequency - abs(mod(x,(2.0*frequency)) - frequency));
}

struct Ball {
  vec3 position;
  vec3 velocity;
  float radius;
};

float getBallIndex(int index, int component) {
  int ballLocation = component+1; 
  int v = ballLocation / 4;
  vec4 texel = texelFetch(u_clusterbuffer, ivec2(index,v), 0);

  int pixelComponent = ballLocation - v * 4;
  if (pixelComponent == 0) {
    return texel[0];
  } else if (pixelComponent == 1) {
    return texel[1];
  } else if (pixelComponent == 2) {
    return texel[2];
  } else if (pixelComponent == 3) {
    return texel[3];
  }
}

Ball UnpackBall(int index) {
  Ball ball;
  vec4 v1 = texelFetch(u_ballsbuffer, ivec2(index,0), 0);
  vec4 v2 = texelFetch(u_ballsbuffer, ivec2(index,1), 0);
  ball.position = v1.xyz;
  ball.radius = v1.w;
  ball.velocity = v2.xyz;
  return ball;
}

Ball findNeighbor(Ball currentBall, int currentBallIndex, int clusterX, int clusterY, int clusterZ) {

  // TODO: set to one
  float minDistance = u_neighbor_radius;
  Ball neighbor;
  neighbor.position = vec3(-1,-1,-1);

  int minX = clamp(clusterX-1, 0, 9);
  int minY = clamp(clusterY-1, 0, 9);
  int minZ = clamp(clusterZ-1, 0, 9);
  int maxX = clamp(clusterX+1, 0, 9);
  int maxY = clamp(clusterY+1, 0, 9);
  int maxZ = clamp(clusterZ+1, 0, 9);

  int requiredNeighborIndex = int(a_pro.y);
  int neighborCurrentIndex = 0;

  for (int x = minX; x <= maxX; x++) {
    for (int y = minY; y <= maxY; y++) {
      for (int z = minZ; z <= maxZ; z++) {

        int clusterIndex = x + y * xSlices + z * xSlices * ySlices;
        int clusterNumBalls = int(texelFetch(u_clusterbuffer, ivec2(clusterIndex,0), 0).r);

        for (int i = 0; i < clusterNumBalls; ++i) {
          int ballIndex = int(getBallIndex(clusterIndex, i));

          if (currentBallIndex == ballIndex)
            continue;

          Ball ball = UnpackBall(ballIndex);

          float dist = distance(currentBall.position, ball.position);

          if (dist < minDistance) {
            //minDistance = dist;
            if (requiredNeighborIndex == neighborCurrentIndex) {
              neighbor = ball;
              return neighbor;
            }

            neighborCurrentIndex++;
          }
        }
      }
    }
  }
  return neighbor;
}

void main()
{    
  v_pos = a_pos;
  v_vel = a_vel;
  v_pro = a_pro;
  v_col = vec4(1.0,1.0,1.0,a_col.w);

  //get ball assigned to current particle
  int clusterX = int(floor(a_pos.x));
  int clusterY = int(floor(a_pos.y));
  int clusterZ = int(floor(a_pos.z));

  int clusterIndex = clusterX + clusterY * xSlices + clusterZ * xSlices * ySlices;
  int numClusters = xSlices * ySlices * zSlices;
  int clusterNumBalls = int(texelFetch(u_clusterbuffer, ivec2(clusterIndex,0), 0).r);

  // a_pro.x is the ball index assigned to a particle
  int ballIndex = int(a_pro.x);
  Ball closestBall = UnpackBall(ballIndex);
  int closestBallIndex = ballIndex;

  // neighbor search
  Ball neighbor = findNeighbor(closestBall, closestBallIndex, clusterX, clusterY, clusterZ);

  float exciteIndex = mod(u_time, 99.0);
  if (u_randomize_current == 1.0)
    exciteIndex = mod(u_time + floor(a_pro.z * 100.0), 99.0);

  v_col.w = 2.0;
  if (a_pos.w >= exciteIndex-3.0 && a_pos.w <= exciteIndex+3.0 
    && u_current == 1.0) {
    v_col.w = 6.0 - abs(exciteIndex-a_pos.w); 
  }

  vec3 desired_rest = vec3(0); 
  if (neighbor.position.x == -1.0) {
    v_col.xyz = vec3(0.0/255.0,191.0/255.0,255.0/255.0);
    v_col.w = 2.0; //w component is point size
    desired_rest = closestBall.position.xyz;

    vec3 dir = normalize(a_pos.xyz - closestBall.position.xyz);
    dir = normalize(a_ori.xyz) * sin(u_time*a_ori.x*5.0) * cos(u_time*a_ori.y*5.0);

    if ( (abs(99.0 - exciteIndex) <= 10.0 || abs(99.0 - exciteIndex) >= 90.0) 
       && u_current == 1.0){
        v_col.w = clamp(6.0 - abs(exciteIndex-a_pos.w),1.5,6.0);
        if (a_pos.w >= exciteIndex-3.0 && a_pos.w <= exciteIndex+3.0)
          v_col.xyz = vec3(1,1,1);
    }

    if (u_particle_physics == 0.0) {
      dir = normalize(a_ori.xyz)/ 2.0;
      v_pos.xyz = closestBall.position.xyz + dir/10.0;
      return;
    }

    desired_rest += dir/10.0;
    desired_rest -= a_pos.xyz;
  }


  // create bolt

  vec3 b0 = closestBall.position;
  vec3 b1 = neighbor.position;

  vec3 pointOnLine;
  vec3 midPoint = (b0 + b1) / 2.0;
  pointOnLine.x = mix(b0.x,b1.x,a_pos.w / 99.0);
  pointOnLine.y = mix(b0.y,b1.y,a_pos.w / 99.0);
  pointOnLine.z = mix(b0.z,b1.z,a_pos.w / 99.0);


  // bolt shape and animation

  float type = floor(mod(u_time * a_pro.z  / 5.0, 6.0)); 
  vec3 boltPoint = pointOnLine;

  if (type == 2.0){
    boltPoint += a_pro.z * -2.0;
  }
  else if (type == 1.0){
    boltPoint -= a_pro.z;
  }
  else if (type == 3.0){
    boltPoint -= a_pro.z * -2.0;
  }
  else if (type == 5.0){
    boltPoint += a_pro.z;
  }

  float tri_wave_x = triangle_wave(0.09, 0.25, boltPoint.x);
  float sin_wave_x = sin(boltPoint.x) / 10.0;
  float cos_wave_x = -cos(boltPoint.x * 10.0) / 10.0;
  float tri_wave_x_2 = triangle_wave(0.2,0.3,boltPoint.x) - 0.1;     


  float tri_wave_y = triangle_wave(0.1, 0.2,boltPoint.y);

  float sin_wave_z = sin(boltPoint.z * 6.5) / 10.0;
  float tri_wave_z = triangle_wave(0.07,0.3,boltPoint.x) - 0.1;     

  float factor = distance(pointOnLine, b0);

  if (distance(pointOnLine, b1) <= distance(pointOnLine, b0)) {

    float change = distance(pointOnLine, b0) - distance(midPoint, b0);
    factor = distance(b0, midPoint) - change;
  }

  float x = (tri_wave_z * 0.5 + tri_wave_y * 0.5) * factor;
  float y = (sin_wave_x + tri_wave_x) * factor;
  float z = (sin_wave_z + tri_wave_z) * factor;

  pointOnLine.x += x;
  pointOnLine.y += y;
  pointOnLine.z += z;


  // particle physics

  vec3 desired = pointOnLine - a_pos.xyz;
  if (desired_rest != vec3(0))
    desired = desired_rest;

  if (u_particle_physics == 0.0) {
    v_pos.xyz = desired + a_pos.xyz;
    return;
  }

  float dist = length(desired);

  desired = normalize(desired);

  float maxSpeed = 0.4; 

  if (dist < 0.4) {      
    desired *= map(dist, 0.0, 0.5, 0.0, 0.1);
  } else {
    desired *= maxSpeed;
  }

  vec3 steer = desired-a_vel;
  steer /= a_col.w;
  steer = min(steer, vec3(maxSpeed,maxSpeed,maxSpeed));

  vec3 acc = steer;
  v_vel += acc;
  v_pos.xyz = a_pos.xyz + v_vel;
}