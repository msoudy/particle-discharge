import { vec2, vec3 } from 'gl-matrix';

function Segment(startPoint, endPoint, gen, split) {
  this.start = startPoint;
  this.end = endPoint;
  this.generation = gen;
  this.split = split;
}

LightningTree.prototype.recreate = function() {
  this.segments = [new Segment(this.startPoint, this.endPoint, 0, 0)];
  this.generateStructure();
}

LightningTree.prototype.generateStructureDEBUG = function() {

  var offsetAmount = 10.0;

  for (var g = 0; g < this.numGenerations; g++) {
    for (var s = 0; s < this.segments.length; s++) {
      var segment = this.segments[s];
      if (segment.generation != g)
        continue;

      this.segments.splice(s, 1);

      var midPoint = vec3.create();
      vec3.add(midPoint, segment.start, segment.end);
      vec3.scale(midPoint, midPoint, 0.5);

      midPoint[0] += 5.0;
      midPoint[1] += 0;
      midPoint[2] += 0;

      this.segments.splice(s, 0, new Segment(midPoint, segment.end, g+1, segment.split));
      this.segments.splice(s, 0, new Segment(segment.start, midPoint, g+1, segment.split));

    }
    offsetAmount /= 2.0;
  }
  console.log(this.segments);
}

LightningTree.prototype.generateStructure = function(is2D) {

  var offsetAmount = 6.0;

  for (var g = 0; g < this.numGenerations; g++) {

    for (var s = 0; s < this.segments.length; s++) {
      var segment = this.segments[s];
      if (segment.generation != g)
        continue;

      this.segments.splice(s, 1);

      var midPoint = vec3.create();
      vec3.add(midPoint, segment.start, segment.end);
      vec3.scale(midPoint, midPoint, 0.5);

      var normal = vec2.fromValues(segment.end[1] - segment.start[1],
                                   -(segment.end[0] - segment.start[0]));
      vec2.normalize(normal,normal);

      var normalRand = ((Math.random() - 0.5) * 2.0) * offsetAmount;

      normal[0] *= normalRand;
      normal[1] *= normalRand;

      midPoint[0] += normal[0];
      midPoint[1] += normal[1];
      if (!is2D)
        midPoint[2] += (Math.random() - 0.5) * offsetAmount;

      this.segments.splice(s, 0, new Segment(midPoint, segment.end, g+1, segment.split));

      //For adding a branch
      if (Math.random() < 0.4 && this.config.branching) {
        var direction = vec3.create();
        vec3.subtract(direction, midPoint, segment.start);

        var scale = 0.7;
        var splitEnd = vec3.create();
        vec3.scaleAndAdd(splitEnd, midPoint, direction, scale);

        //rotate split end by small random number
        var randAngle = (Math.random() - 0.5) * Math.PI/4;
        vec3.rotateZ(splitEnd,splitEnd, midPoint,randAngle);

        this.segments.splice(s, 0, new Segment(midPoint, splitEnd, g+1, 1));
      }

      this.segments.splice(s, 0, new Segment(segment.start, midPoint, g+1, segment.split));

    }
    offsetAmount /= 2.0;
  }
}

LightningTree.prototype.flatten = function() {

  var positions = [];

  for (var s = 0; s < this.segments.length; s++) {
    var segment = this.segments[s];
    positions.push(segment.start[0]);
    positions.push(segment.start[1]);
    positions.push(segment.start[2]);
    positions.push(segment.end[0]);
    positions.push(segment.end[1]);
    positions.push(segment.end[2]);
  }

  return positions;
}

LightningTree.prototype.getColorsWithOpacity = function(opacity) {
  var numPoints = this.segments.length * 2 * 3;
  var colors = [];

  for (var s = 0; s < this.segments.length; s++) {
    var segment = this.segments[s];

    if (segment.split == 0) {

      for (var i = 0; i < 3; i++)
        colors.push(1.0);
      colors.push(1.0*opacity);
      for (var i = 0; i < 3; i++)
        colors.push(1.0);
      colors.push(1.0*opacity);

    } else {
      for (var i = 0; i < 3; i++)
        colors.push(0.5);
      colors.push(1.0*opacity);
      for (var i = 0; i < 3; i++)
        colors.push(0.5);
      colors.push(1.0*opacity);
    }
  }
  return colors;
}

LightningTree.prototype.getColors = function() {
  var numPoints = this.segments.length * 2 * 3;
  var colors = [];

  for (var s = 0; s < this.segments.length; s++) {
    var segment = this.segments[s];

    if (segment.split == 0) {

      for (var i = 0; i < 8; i++)
        colors.push(1.0);

    } else {
      for (var i = 0; i < 3; i++)
        colors.push(0.5);
      colors.push(1.0);
      for (var i = 0; i < 3; i++)
        colors.push(0.5);
      colors.push(1.0);
    }
  }
  return colors;
}

LightningTree.prototype.getInstanceOffsets = function(scale) {
  var offsets = [];
  for (var s = 0; s < this.segments.length; s++) {
    var segment = this.segments[s];

    var midPoint = vec3.create();
    vec3.add(midPoint, segment.start, segment.end);
    vec3.scale(midPoint, midPoint, 0.5);

    offsets.push(midPoint[0]);
    offsets.push(midPoint[1]);
    offsets.push(midPoint[2]);

    //set 4th component as branch width
    if (segment.split == 0)
      offsets.push(1.0 * this.config.branchWidth * scale);
    else
      offsets.push(0.4 * this.config.branchWidth * scale);
  }
  return offsets;
}

LightningTree.prototype.getInstanceRotations = function() {
  var rotations = [];
  for (var s = 0; s < this.segments.length; s++) {
    var segment = this.segments[s];

    var direction = vec3.create();
    vec3.subtract(direction, segment.end, segment.start);
    rotations.push(direction[0]);
    rotations.push(direction[1]);
    rotations.push(direction[2]);
  } 
  return rotations;
}

LightningTree.prototype.getInstanceColors = function(opacity) {
  var colors = [];
  for (var s = 0; s < this.segments.length; s++) {
    colors.push(1.0);
    colors.push(1.0);
    colors.push(1.0);
    colors.push(1.0 * opacity);
  } 
  return colors;
}

export default function LightningTree(start, end, config) {

  this.startPoint =  start;
  this.endPoint =  end;
  this.numGenerations = config.numGenerations;
  this.config = config;

  this.segments = [new Segment(this.startPoint, this.endPoint, 0, 0)];
  this.numSegments = 0;

  this.generateStructure(true);
  //this.generateStructureDEBUG();
}