const svg = d3.select("body")
    .append("svg")
    .attr("class", "container")
    .attr("width", "500")
    .attr("height", "500")
    .attr("viewBox", "4 0 27 27")
    .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
    .append("g");

// Read json data and draw frameworks (walls and zones)
drawWalls("./simple-data/walls.json");
drawZones("./simple-data/graph.json");

//Pedestrians
runAnimation("./simple-data/pedestrian_time_sequences.json");

