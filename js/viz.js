function prepViz2D(infra, xmin, xmax, ymin, ymax) {

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

    // Read json data and draw frameworks (walls and zones)
    drawStructures("http://transporsrv2.epfl.ch/api/infra/", infra, structure_layer);
}

function runViz2D(data, tmin, tmax) {

    let svg = d3.select("#subSvgCont");

    let voronoi_poly_layer = svg.append("g")
        .attr("class", "voronoi_poly_layer");
    let voronoi_clip_layer = svg.append("g")
        .attr("class", "voronoi_clip_layer");
    let pedes_layer = svg.append("g")
        .attr("class", "pedes_layer");

    //Pedestrians
    runAnimation(data, voronoi_poly_layer, pedes_layer, tmin, tmax);
}

function prepareChord(data) {

    // canvas size and chord diagram radii
    const size = 700;

    var width = $("#ODCont").width();

    const svg = d3.select("#ODCont").append("svg")
        .attr("id", "containerForOD")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `${-size/2} ${-size/2} ${size} ${size}`)
        .append("svg:g")
        .attr("id", "circle");

    dynamicChord(data);
}



