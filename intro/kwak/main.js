// Import graph.js and wall.js
import wall from "./wall.js";
import graph from "./graph.js";

const x_offset = Math.min(...wall["walls"].map( (w) => Math.min(w["x1"], w["x2"]) ));
const y_offset = Math.min(...wall["walls"].map( (w) => Math.min(w["y1"], w["y2"]) ));
const x_length = Math.max(...wall["walls"].map( (w) => Math.max(w["x1"], w["x2"]) )) - x_offset;
const y_length = Math.max(...wall["walls"].map( (w) => Math.max(w["y1"], w["y2"]) )) - y_offset;
const xy_ratio = y_length/x_length;

// Define Height and width for SVG canvas
const width = 500;
const height = xy_ratio*width;
const scale = width/x_length;

// SVG canvas
let svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Border
let border = svg.append("rect")
    .attr("class", "canvas-border")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

// Draw walls
let group_walls = svg
    .append("g");
wall["walls"].map( (w)  => {
    group_walls.append("line")
        .attr("class", "the-walls")
        .attr("x1", w["x1"]- x_offset)
        .attr("y1", w["y1"]- y_offset)
        .attr("x2", w["x2"]- x_offset)
        .attr("y2", w["y2"]- y_offset);
}) ;
group_walls.attr("transform", `translate( ${width/2 }, ${height/2 })`)
    .attr("transform", `scale(${scale})`);

// Draw zones
let group_zones = svg
     .append("g");
graph["nodes"].map( (g) => {
     group_zones.append("rect")
         .attr("class", "the-zones")
         .attr("x", g["x1"]-x_offset)
         .attr("y", g["y1"]-y_offset)
         .attr("width", g["x2"]-g["x1"])
         .attr("height", g["y3"]-g["y2"]);
 });

group_zones.attr("transform", `translate( ${width/2 }, ${height/2 })`)
     .attr("transform", `scale(${scale})`);

// Draw controlled area
let controlled_areas = svg
    .append("g");
graph["controlled_areas"].map( (c) => {
    controlled_areas.append("rect")
        .attr("class", "controlled-areas")
        .attr("x", c["x1"] - x_offset)
        .attr("y", c["y1"] - y_offset)
        .attr("width", c["x2"] - c["x1"])
        .attr("height", c["y3"] - c["y2"]);
} );
controlled_areas.attr("transform", `translate( ${width/2}, ${height/2} )`)
    .attr("transform", `scale(${scale})`);

// Draw flow gate?
let flow_gates = svg
    .append("g");
graph["flow_gates"].map( f => {
    flow_gates.append("line")
        .attr("class", "flow-gates")
        .attr("x1", f["start_pos_x"] - x_offset)
        .attr("y1", f["start_pos_y"] - y_offset)
        .attr("x2", f["end_pos_x"] - x_offset)
        .attr("y2", f["end_pos_y"] - y_offset);
} );

flow_gates.attr("transform", `translate( ${width/2 }, ${height/2 })`)
     .attr("transform", `scale(${scale})`);


