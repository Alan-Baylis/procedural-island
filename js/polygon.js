(function() {
  "use strict";

  // Globals
  var debug_mode = false;
  var fill_algorithm = "evenodd";  // if blank, then use default algorithm
  var number_of_polygon_sides = 3;
  var polygon_radius = 50;
  var midpoint_iterations = 10; 
  if (debug_mode) {
    midpoint_iterations = 1
  }


  var DEBUG_print = function(string) {
    if (debug_mode) {
      console.debug(string);
    }
  };

  var offsetMidpoint = function(vertex_a, vertex_b) {

    DEBUG_print("va: " + vertex_a);
    DEBUG_print("vb: " + vertex_b);

    var vax = vertex_a[0];
    var vay = vertex_a[1];

    var vbx = vertex_b[0];
    var vby = vertex_b[1];

    // vector midpoints
    var mx = (vax + vbx) / 2.0;
    var my = (vay + vby) / 2.0;

    // rotate vector
    var rotated_vec = [-(vay - vby), vax - vbx];

    var random_scalar = Math.random() - 0.5;

    DEBUG_print("random_scalar in offsetMidpoint: " + random_scalar);

    // scale the vector
    var rotated_scaled_vec = [
      mx + (random_scalar * rotated_vec[0]),
      my + (random_scalar * rotated_vec[1])
    ];

    DEBUG_print("rotated_scaled_vec in offsetMidpoint: " + rotated_scaled_vec);

    return rotated_scaled_vec;
  };

  var makePairs = function(list) {
    var pairs = [];

    if (list.length > 1) {
      for (var i = 0; i != list.length - 1; i++) {
        var ea = list[i];
        var eb = list[i + 1];
        pairs.push([ea, eb]);
      }

      // loop back around, get the first point and last point
      pairs.push([list[list.length - 1], list[0]]);
    }

    return pairs;
  };


  var generateMidpointsFromVertices = function(vertices, iterations) {
    if (vertices.length > 1) {
      DEBUG_print("vertices in generateMidpointsFromVertices: " + vertices);

      var first_point = vertices[0];

      var points_to_compute = vertices;

      var points_to_draw = [];

      var calculateMidpoints = function(pair_of_points) {
        points_to_draw.push(pair_of_points[0]);
        points_to_draw.push(
            offsetMidpoint(pair_of_points[0], pair_of_points[1]));
      };

      for (var i = 0; i < iterations; i++) {
        points_to_draw = [];
        var pairs_of_vertices = makePairs(points_to_compute);

        DEBUG_print("pairs_of_vertices: " + pairs_of_vertices);

        pairs_of_vertices.forEach(calculateMidpoints);

        points_to_compute = points_to_draw;

        DEBUG_print("points_to_draw: " + points_to_draw);
      }

      points_to_draw.push(first_point);

      return points_to_draw;

    } else {
      return vertices;
    }

  };


  var generatePolygon = function(sides, radius) {
    // loop around a circle, get N points from it
    var mu = (2 * (Math.PI - 0.000001) / sides);

    var list_of_points = [];
    var point_on_circle = 0;

    for (var i = 0; i < sides; i++) {
      var x = radius * Math.cos(point_on_circle);
      var y = radius * Math.sin(point_on_circle);

      list_of_points.push([x, y]);

      point_on_circle += mu;
    }

    return list_of_points;

  };

  var skewPolygon = function(vertices) {
    // skew a vertex by some random value, positive or negative
    return vertices.map(function(vertex) {
      var random_scalar = Math.random() + 1;
      return [vertex[0] * random_scalar, vertex[1] * random_scalar];
    });
  };


  var draw = function(canvas, polygon_points) {
    var ctx = canvas.getContext("2d");

    var canvas_middle_x = canvas.scrollWidth / 2;
    var canvas_middle_y = canvas.scrollHeight / 2;

    // move origin to middle of canvas element
    ctx.translate(canvas_middle_x, canvas_middle_y);

    
    var fillStyle = "green";

    if (debug_mode) {
      // setup origin,text and colors for debugging
      ctx.fillRect(0, 0, 5, 5);
      ctx.strokeStyle = "black";
      fillStyle = "red";
      ctx.font = "12px serif";
    }

    DEBUG_print(polygon_points);

    ctx.fillStyle = fillStyle;

    ctx.beginPath();

    ctx.moveTo(polygon_points[0][0], polygon_points[0][1]);

    for (var i = 1; i < polygon_points.length; i++) {
      ctx.lineTo(polygon_points[i][0], polygon_points[i][1]);

      if (debug_mode) {
        ctx.fillText("" + i, polygon_points[i][0],
                     polygon_points[i][1]);
        ctx.fillRect(polygon_points[i][0], polygon_points[i][1], 5, 5);
      }
    }

    ctx.closePath();
    ctx.stroke();

    if (!debug_mode) {
      ctx.fillStyle = "green";
      ctx.fill(fill_algorithm);
    }

  };



  var main = function() {
    var canvas = document.getElementById("island");

    if (canvas.getContext) {
      var polygon_points = generateMidpointsFromVertices(
          skewPolygon(generatePolygon(number_of_polygon_sides, polygon_radius)),
          midpoint_iterations);

      draw(canvas, polygon_points);

    } else {
      // TODO: fallback code for not supporting canvas
    }


  };

  main();

}());
