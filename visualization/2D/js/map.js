//TODO: map to true rgb. gray scale now.
function drawVoronoi(data, svg) {
    let vertices = data.map( d => [d.x, d.y]);
    let rect = rectangleContainPolygon(".voronoi-area");
    let v = d3.voronoi()
        .extent(rect);
    let clip = polygonIDToArray(".voronoi-area");
    let data_in_voronoi_area = filterPointInPolygon(data, ".voronoi-area");
    let voronoi_polygons = v.polygons(data_in_voronoi_area.map(d => [d.x, d.y])).map(p => d3.polygonClip(clip, p));
    let areas = voronoi_polygons.map(d => d3.polygonArea(d));
    let publish_json = encodeJson(data_in_voronoi_area, areas);
    //publish(publish_json);
    let voronois = svg.selectAll(".voronoi-poly").data(voronoi_polygons);
    voronois.enter().append("path")
        .attr("class", "voronoi-poly")
        .attr("d", line)
        .style("fill", (d,i)=> pedLosColor(areas[i]))
        .style("opacity", 0.7)
        .attr("mask", "url(#voronoi-mask)");
}


function pedLosColor(p) {
    let color;
    if (p >= 3.24)
        color = "rgb(0,0,255)";
    else if (p >= 2.32 && p < 3.24)
        color = "rgb(0,255,255)";
    else if (p >= 1.39 && p < 2.32)
        color = "rgb(0,255,0)";
    else if (p >= 0.93 && p < 1.39)
        color = "rgb(255,255,0)";
    else if (p >= 0.46 && p < 0.93)
        color = "rgb(255,128,0)";
    else
        color = "rgb(255,0,0)";
    return color;
}

function clearCanvas(voronoi_clip_canvas) {
    voronoi_clip_canvas.selectAll("*").remove();
}

function deleteVoronoi(svg) {
    svg.selectAll(".voronoi-poly").remove();
}

function filterPointInPolygon(data, polygon_id) {
    let polygon_array = polygonIDToArray(polygon_id);
    return data.filter(d => d3.polygonContains(polygon_array, [d.x, d.y]));
}

function polygonIDToArray(polygon_id) {
    let polygon = d3.select(polygon_id);
    console.log(polygon);
    let polygon_array = polygon.attr("points").split(" ").map(s => s.split(",").map(n => Number(n)));
    return polygon_array;
}
function rectangleContainPolygon(polygon_id) {
    let polygon_array = polygonIDToArray(polygon_id);
    let x_coordinates = polygon_array.map(d => d[0]);
    let y_coordinates = polygon_array.map(d => d[1]);
    return [[d3.min(x_coordinates), d3.min(y_coordinates)], [d3.max(x_coordinates), d3.max(y_coordinates)]];
}

function checkVoronoi(data, voronoi_poly_layer) {
    if (d3.select("#voronoi_checkbox").property("checked")) {
        deleteVoronoi(voronoi_poly_layer);
        drawVoronoi(data, voronoi_poly_layer);
    } else {
        deleteVoronoi(voronoi_poly_layer);
    }
}

function setVoronoiArea() {

    let svg = d3.select("svg");
    let voronoi_clip_canvas = d3.select(".voronoi_clip_layer");

    if (stateControlAreaButton == 'idle') {

        stateControlAreaButton = 'drawing';
        document.getElementById("control_area").innerHTML = "Make Control Area";

        svg.on("click", function () {
            let mouse = d3.mouse(svg.select("#subSvgCont").node());
            console.log(mouse);
            voronoi_clip_canvas.append("circle")
                .attr("class", "voronoi-pre-circle")
                .attr("cx", mouse[0])
                .attr("cy", mouse[1])
                .attr("r", 0.15);
        })

    } else if (stateControlAreaButton == 'drawing') {

        stateControlAreaButton = 'drawn';
        document.getElementById("control_area").innerHTML = "Delete Control Area";

        // Remove onclick function
        svg.on("click", null);

        let pre_circles = Array.from(document.getElementsByClassName('voronoi-pre-circle')).map(d => [Number(d.attributes.cx.value), Number(d.attributes.cy.value)]);
        drawVoronoiArea(voronoi_clip_canvas, pre_circles);

    } else if (stateControlAreaButton == 'drawn') {

        console.log("ASD");

        stateControlAreaButton = 'idle';
        document.getElementById("control_area").innerHTML = "Draw Control Area";

        clearCanvas(voronoi_clip_canvas);
    }

    /*
    svg.on("click", function () {
        let mouse = d3.mouse(svg.select("#subSvgCont").node());
        console.log(mouse);
        voronoi_clip_canvas.append("circle")
            .attr("class", "voronoi-pre-circle")
            .attr("cx", mouse[0])
            .attr("cy", mouse[1]);
        if (d3.event.shiftKey) {
            let pre_circles = Array.from(document.getElementsByClassName('voronoi-pre-circle')).map(d => [Number(d.attributes.cx.value), Number(d.attributes.cy.value)]);
            drawVoronoiArea(voronoi_clip_canvas, pre_circles);
            console.log(`mouse click with shift at ${mouse[0]} and ${mouse[1]}`);

        }

    })
    */
}

function drawVoronoiArea(svg, polygon) {
    clearCanvas(svg.select("#subSvgCont"));
    let polygon_hull = d3.polygonHull(polygon);
    polygon_hull.map(d => {
        svg.append("circle")
            .attr("class", "voronoi-pre-circle")
            .attr("cx", d[0])
            .attr("cy", d[1])
            .attr("r", 0.15);
    });
    svg.append("mask")
        .attr("id", "voronoi-mask")
        .append("polygon")
        .attr("points", polygon_hull.map(p => p.join(",")).join(" "))
        .attr("fill", "white");

    svg.append("polygon")
        .attr("class", "voronoi-area")
        .attr("points", polygon_hull.map(p => p.join(",")).join(" "));
}