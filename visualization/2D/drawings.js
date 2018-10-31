let svg = d3.select("svg");

function clearCanvas() {
    console.log("clearing voronoi_area");
    d3.select('voronoi_area').remove();
}

svg.on("mousedown", function() {
    console.log("clicked!");
    console.log(`x coordinate: ${d3.mouse(this)[0]}, y coordinate: ${d3.mouse(this)[1]}`);
});

// HARD CODING

let voronoi_area = [[17.33799934387207, 11.62181282043457],
    [14.961999893188477, 12.377812385559082],
    [14.961999893188477, 14.375812530517578],
    [17.607999801635742, 16.265811920166016],
    [20.038000106811523, 14.48381233215332],
    [19.983999252319336, 12.21581268310546]];

svg.append("mask")
    .attr("id", "voronoi-mask")
    .append("polygon")
    .attr("points", voronoi_area.map(p => p.join(",")).join(" "))
    .attr("fill", "white");

svg.append("polygon")
    .attr("class", "voronoi-area")
    .attr("points", voronoi_area.map(p => p.join(",")).join(" "));
export {clearCanvas};
