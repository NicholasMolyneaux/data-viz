const svg = d3.select("#viz")
    .append("svg")
    .attr("class", "container")
    .attr("width", "500")
    .attr("height", "500")
    .attr("viewBox", "4 0 27 27")
    .attr("id", "svgCont")
    .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
    .append("g");

// Read json data and draw frameworks (walls and zones)
drawWalls("./data/small/walls.json");
drawZones("./data/small/graph.json");

//Pedestrians
runAnimation("./data/small/pedestrian_time_sequences.json");

