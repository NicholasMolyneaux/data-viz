function drawStructures(main_layer) {
    drawWalls(wallsData, main_layer);
    drawZones(zonesData, main_layer);
    drawGates(gatesData, main_layer);
}

function drawWalls(wall, svg) {
    // Draw walls

    wall.map( (w)  => {
        svg.append("line")
            .attr("class", "the-walls")
            .attr("x1", w["x1"])
            .attr("y1", w["y1"])
            .attr("x2", w["x2"])
            .attr("y2", w["y2"]);
    }) ;
}
function drawZones(zones, svg) {

    zones.map( (g) => {
        // Append zones
        let node = svg.append("rect")
            .attr("class", "the-zones")
            .attr("id", g["name"])
            .attr("x", g["x1"])
            .attr("y", g["y1"])
            .attr("width", g["x2"]-g["x1"])
            .attr("height", g["y3"]-g["y2"]);

        // Control zones
        node.on("click", function () {
            if (d3.event.shiftKey) {
                d3.select(this).style("stroke", "blue");
                od_selection.Origins.add(d3.select(this).attr("id"));
                console.log(od_information);
            } else {
                d3.select(this).style("stroke", "red");
                od_selection.Destinations.add(d3.select(this).attr("id"));
            }
        });

    });

}

function drawGates(gates, svg) {

    // Draw flow gate?
    gates.map( f => {
        svg.append("line")
            .attr("class", "flow-gates")
            .attr("x1", f["x1"] )
            .attr("y1", f["y1"] )
            .attr("x2", f["x2"] )
            .attr("y2", f["y2"] );
    } );
}

function drawControlAreas(areas, layer) {
    // Draw controlled area
    areas.map( (c) => {
        layer.append("polygon")
            .attr("class", "controlled-areas")
            .attr("id", c["name"])
            .attr("points", `${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x3},${c.y3} ${c.x4},${c.y4}`);

    } );
}