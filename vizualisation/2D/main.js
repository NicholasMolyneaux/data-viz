import * as myModule from './functions.js';
const svg = d3.select("svg");

svg
    .attr("viewBox", "4 0 27 27")
    .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
    .append("g");

svg.append("mask")
    .attr("id", "wallMask")
    .append("rect")
    .attr("x", 4)
    .attr("y", 0)
    .attr("width", 27)
    .attr("height", 27)
    .attr("fill", "black");

// check box behavior
document.querySelector("#voronoi_checkbox").addEventListener('click', myModule.checkVoronoi);
document.querySelector("#zone_checkbox").addEventListener('click', myModule.checkZone);
document.querySelector("#control_checkbox").addEventListener('click', myModule.checkControl);
document.querySelector("#flow_checkbox").addEventListener('click', myModule.checkFlow);

// Read json data and draw frameworks (walls and zones)
myModule.drawWallsByPath("../../data/small/walls.json");
myModule.drawZones("../../data/small/graph.json");

//Pedestrians
myModule.runAnimation("../../data/small/pedestrians_clean.json");

