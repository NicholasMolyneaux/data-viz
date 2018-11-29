function drawStructures(svg) {

    drawWalls(wallsData, svg);
    drawZones(zonesData, svg);
    drawGates(gatesData, svg);
    //drawAreas(areasData, svg);
}

function drawWalls(wall, svg) {
    // Draw walls
    //console.log(wall);
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
            determineOD(this.getAttribute("id"));
        });

    });
    // Draw invisible arrows
    // connect_info = graph["connectivity"];
    // graph["connectivity"].map( a => {
    //     let from = a["node"];
    //     let to = a["connected_to"];
    //     if (!(to.length == 0)) {
    //         let from_center = centerOfRect(d3.selectAll(".the-zones").filter(`#${from}`));
    //         to.map( d => {
    //             let to_center = centerOfRect(d3.selectAll(".the-zones").filter(`#${d}`));
    //             svg.append("line")
    //                 .attr("class", "the-flow-lines")
    //                 .attr("id", `${from}:${d}`)
    //                 .attr("x1", from_center["x"])
    //                 .attr("y1", from_center["y"])
    //                 .attr("x2", to_center["x"])
    //                 .attr("y2", to_center["y"]);
    //         })
    //     }
    // });
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

function drawAreas(areas, svg) {
    // Draw controlled area
    areas.map( (c) => {
        svg.append("rect")
            .attr("class", "controlled-areas")
            .attr("id", c["name"])
            .attr("x", c["x1"] )
            .attr("y", c["y1"] )
            .attr("width", c["x2"] - c["x1"])
            .attr("height", c["y3"] - c["y2"]);
    } );
}