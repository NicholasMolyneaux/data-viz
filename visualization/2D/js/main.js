let click_zone_active = false;
let connect_info;
let od_information;

// State of the control area button
let stateControlAreaButton = "idle";

// For OD filtering
let od_selection = {"Origins": new Set(), "Destinations": new Set()};


let line = d3.line()
    .x(d => d[0])
    .y(d => d[1]);


// Time interval between two updates of the position for the 2D
const INTERVAL2D = 100;

function centerOfRect(rect) {
    let x_center = Number(rect.attr("x")) + Number(rect.attr("width"))/2;
    let y_center = Number(rect.attr("y")) + Number(rect.attr("height"))/2;
    return {"x": x_center, "y": y_center};
}

function encodeJson(data, areas) {
    return data.map((d,i) => {return {"id": d["id"], "density": 1/areas[i]}});
}

function publish(json) {
    console.log(json);
}

function prepViz2D() {
    cancelAnimationFrame(animation);

    const xmin = selectedInfra.xmin,
        xmax = selectedInfra.xmax,
        ymin = selectedInfra.ymin,
        ymax = selectedInfra.ymax;

    let svg = d3.select("#viz")
        .append("svg")
        .attr("class", "container-fluid")
        .attr("id", "svgCont")
        .attr("height", vizHeight)
        .attr("viewBox", `${xmin-1} ${ymin} ${xmax} ${ymax+10}`);
    let svg_zoom = svg.append('g')
        .attr("id", "subSvgCont");

    svg.call(d3.zoom().on("zoom", () => {
            svg_zoom.attr("transform", d3.event.transform);
        }
    ));



    document.getElementById("mainViz").style.height = 0 + "px";

    vizHeight = getVizHeight();

    document.getElementById("mainViz").style.height = vizHeight + "px";

    document.getElementById("svgCont").style.height = vizHeight + "px";

    let structure_layer = svg_zoom.append("g")
        .attr("class", "structure_layer");

    let voronoi_clip_layer = svg_zoom.append("g")
        .attr("class", "voronoi_clip_layer");
    let voronoi_canvas = svg_zoom.append("g")
        .attr("class", "voronoi_canvas");
    let voronoi_poly_layer = svg_zoom.append("g")
        .attr("class", "voronoi_poly_layer");
    let pedes_layer = svg_zoom.append("g")
        .attr("class", "pedes_layer");

    // layer for showing all trajectories
    let trajectories_layer = svg_zoom.append("g")
        .attr("class", "trajectories_layer");

    // Read json data and draw frameworks (walls and zones)

    drawStructures(structure_layer);

    let viewBox = svg.attr("viewBox").split(" ").map(d => Number(d));
    let padding = 1;
    let r = [1/10, 1/7];


    let los_colors = ["rgb(255,0,0)","rgb(255,128,0)","rgb(255,255,0)","rgb(0,255,0)","rgb(0,255,255)","rgb(0,0,255)"];
    let boundaries = ["∞", 2.17, 1.08, 0.72, 0.43, 0.31, 0];
    drawColorbar("colorbar", svg, d3.schemeRdYlGn[10], [0,2], viewBox[2]-(viewBox[2]-viewBox[0])*r[0],
        viewBox[3]-5, (viewBox[2]-viewBox[0])*r[0], 5, padding, "Speed [m/s]");
    drawColorbar("voronoi-los", svg, los_colors, boundaries, viewBox[2]-(viewBox[2]-viewBox[0])*(r[1]+r[0])-3*padding, viewBox[3]-5, (viewBox[2]-viewBox[0])*r[1], 5, padding, "Level of service [ped/m^2]");


    //drawColorbar("", svg, los_colors, boundaries, );
    //drawLOSColorbar(svg);
    prepareDensityData();
}

function deleteStuff2D() {
    $("#svgCont").remove();

    if (statsShown) {
        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        $('#statDiv').remove();
    }
}
