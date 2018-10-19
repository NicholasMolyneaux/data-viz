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

// Read json data and draw frameworks (walls and zones)
drawWallsByPath("data/small/walls.json");
drawZones("data/small/graph.json");

//Pedestrians
runAnimation("data/small/pedestrians_clean.json");

