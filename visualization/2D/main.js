let svg = d3.select("#viz")
    .append("svg")
    .attr("class", "container")
    .attr("id", "svgCont")
    .attr("width", "500")
    .attr("height", "500")
    .attr("viewBox", "0 0 100 100")
    .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
    .append("g");

// check box behavior
document.querySelector("#zone_checkbox").addEventListener('click', checkZone);
document.querySelector("#control_checkbox").addEventListener('click', checkControl);
document.querySelector("#flow_checkbox").addEventListener('click', checkFlow);

// voronoi button
document.querySelector("#voronoi_area").addEventListener('click', setVoronoiArea);

// Read json data and draw frameworks (walls and zones)
//d3.json('http://transporsrv2.epfl.ch/api/infra/walls/lausannwpiw', function(data) {
 //   console.log(data);
  //  drawWalls(data)});
drawWalls("http://transporsrv2.epfl.ch/api/infra/walls/denhaag");//"../../data/small/walls.json");
drawZones("../../data/small/graph.json");

drawVoronoiArea();

//Pedestrians
runAnimation("http://transporsrv2.epfl.ch/api/trajectoriesbytime/denhaag/test0");

