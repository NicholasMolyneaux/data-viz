function viz2D(infra, traj, xmin, xmax, ymin, ymax, tmin, tmax) {

    const margin = 0.01*(xmax-xmin);
    const ratio = (ymax-ymin)/(xmax-xmin);
    const pixelWidth = 900;

    var optHeight = $("#options").outerHeight();

    let svg = d3.select("#viz")
        .append("svg")
        .attr("class", "container")
        .attr("id", "svgCont")
        .attr("width", pixelWidth)
        .attr("height", Math.max(optHeight, parseInt(ratio * pixelWidth)))
        //.attr("width", pixelWidth)
        //.attr("height", (ratio * pixelWidth))
        .attr("viewBox", `${xmin-1} ${ymin} ${xmax} ${ymax}`)
        .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform)))
        .append('g')
        .attr("id", "subSvgCont");

    let structure_layer = svg.append("g")
        .attr("class", "structure_layer");
    let voronoi_poly_layer = svg.append("g")
        .attr("class", "voronoi_poly_layer");
    let voronoi_clip_layer = svg.append("g")
        .attr("class", "voronoi_clip_layer");
    let pedes_layer = svg.append("g")
        .attr("class", "pedes_layer");

    // Read json data and draw frameworks (walls and zones)
    drawStructures("http://transporsrv2.epfl.ch/api/infra/", infra, structure_layer);

    //Pedestrians
    runAnimation("http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+infra+"/"+traj, voronoi_poly_layer, pedes_layer, tmin, tmax);
}



