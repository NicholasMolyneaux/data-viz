function viz2D(infra, traj, xmin, xmax, ymin, ymax, tmin, tmax) {

    const margin = 0.01*(xmax-xmin);
    const ratio = (ymax-ymin)/(xmax-xmin);
    const pixelWidth = 900;

    console.log(margin, ratio, pixelWidth);

    let svg = d3.select("#viz")
        .append("svg")
        .attr("class", "container")
        .attr("id", "svgCont")
        .attr("width", pixelWidth)
        .attr("height", (ratio * pixelWidth))
        .attr("viewBox", `${xmin} ${ymin} ${xmax} ${ymax}`)
        .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
        .append("g");

    // check box behavior
    document.querySelector("#zone_checkbox").addEventListener('click', checkZone);
    document.querySelector("#control_checkbox").addEventListener('click', checkControl);
    document.querySelector("#flow_checkbox").addEventListener('click', checkFlow);

    // voronoi button
    document.querySelector("#voronoi_area").addEventListener('click', setVoronoiArea);

    // Read json data and draw frameworks (walls and zones)
    drawWalls("http://transporsrv2.epfl.ch/api/infra/walls/"+infra);
    drawZones("http://transporsrv2.epfl.ch/api/infra/zones/"+infra);

    drawVoronoiArea();

    //Pedestrians
    runAnimation("http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+infra+"/"+traj, tmin, tmax);
}



