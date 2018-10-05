// Import graph.js and wall.js
import wall from "./wall.js";
import graph from "./graph.js";


// Define Height and width for SVG canvas
const margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// SVG canvas
let svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

let group = svg
    .append("g");

wall["walls"].map( (w)  => {
    group.append("line")
        .attr("class", "the-line")
        .attr("x1", w["x1"])
        .attr("y1", w["y1"])
        .attr("x2", w["x2"])
        .attr("y2", w["y2"])
}) ;

group.attr("transform", `translate( ${margin.left + width/2}, ${margin.top + height/2})`)
    .attr("transform", "scale(10)");


