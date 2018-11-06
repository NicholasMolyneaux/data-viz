let svg = d3.select("#viz")
    .append("svg")
    .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
    .attr("class", "container")
    .attr("id", "svgCont")
    .attr("width", "500")
    .attr("height", "500")
    .attr("viewBox", "4 0 27 27");

let structure_layer = svg.append("g")
    .attr("class", "structure_layer");
let voronoi_poly_layer = svg.append("g")
    .attr("class", "voronoi_poly_layer");
let voronoi_clip_layer = svg.append("g")
    .attr("class", "voronoi_clip_layer");
let pedes_layer = svg.append("g")
    .attr("class", "pedes_layer");

// Read json data and draw frameworks (walls and zones)
drawWallsByPath("../../data/small/walls.json", structure_layer);
drawZones("../../data/small/graph.json", structure_layer);

drawVoronoiArea(voronoi_clip_layer);

//Pedestrians
runAnimation("../../data/small/pedestrians_clean.json", voronoi_poly_layer, pedes_layer);





//export {clearCanvas};
