let svg = d3.select("#viz")
    .append("svg")
    .attr("class", "container")
    .attr("id", "svgCont")
    .attr("width", "500")
    .attr("height", "500")
    .attr("viewBox", "4 0 27 27")
    .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
    .append("g");

// check box behavior
document.querySelector("#zone_checkbox").addEventListener('click', checkZone);
document.querySelector("#control_checkbox").addEventListener('click', checkControl);
document.querySelector("#flow_checkbox").addEventListener('click', checkFlow);

// voronoi button
document.querySelector("#voronoi_area").addEventListener('click', setVoronoiArea);

// Read json data and draw frameworks (walls and zones)
drawWallsByPath("../../data/small/walls.json");
drawZones("../../data/small/graph.json");

drawVoronoiArea();

//Pedestrians
runAnimation("../../data/small/pedestrians_clean.json");

