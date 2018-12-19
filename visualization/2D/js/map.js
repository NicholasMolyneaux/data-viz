//TODO: map to true rgb. gray scale now.

function drawAVoronoi(data, polygon, canvas) {
    let rect = rectangleContainPolygon(polygon);
    let v = d3.voronoi()
        .extent(rect);
    let clip = polygonToArray(polygon);
    let data_in_voronoi_area = filterPointInPolygon(data, polygon);
    let voronoi_polygons = v.polygons(data_in_voronoi_area.map(d => [d.x, d.y]));
    if (polygon.attr("id") === "voronoi-area") {
        voronoi_polygons = voronoi_polygons.map(p =>d3.polygonClip(clip, p));
    }
    let areas = voronoi_polygons.map(d => d3.polygonArea(d));
    let voronoi_polygons_with_id = voronoi_polygons.map((d,i) => {return {"d":d, "id":data_in_voronoi_area[i].id}});
    
    // DEBUG
    // let publish_json = encodeJson(data_in_voronoi_area, areas);
    // publish(publish_json);

    let voronois = canvas.selectAll("path").data(voronoi_polygons_with_id, d => d.id);
    voronois.enter().append("path")
        .attr("class", "voronoi-poly")
        .merge(voronois)
        .attr("d", d => line(d.d))
        .style("fill", (d,i)=> pedLosColor(areas[i]))
        .style("opacity", 0.7);
}

function filterByOD(time_series_data, od) {
    // Check od set is empty (no click at all)
    if (od_selection.Origins.size === 0 && od_selection.Destinations.size === 0) {
        return time_series_data.map(d => {return {"id": d.id, "x": d.x, "y": d.y, "selected": true}});
    }

    // Only destinations exist
    if (od_selection.Origins.size === 0) {
        return time_series_data.map(d => {
            let isSelected = false;
            let od_ped = od.filter(o => o.id === d.id)[0];
            if (od_ped === undefined) {
                isSelected = false;
            } else {
                isSelected = od_selection.Destinations.has(od_ped.d);
            }
            return {"id": d.id, "x": d.x, "y": d.y, "selected": isSelected};
        });
    }

    // Only origins exist
    if (od_selection.Destinations.size === 0) {
        return time_series_data.map(d => {
            let isSelected = false;
            let od_ped = od.filter(o => o.id === d.id)[0];
            if (od_ped === undefined) {
                isSelected = false;
            } else {
                isSelected = od_selection.Origins.has(od_ped.o);
            }
            return {"id": d.id, "x": d.x, "y": d.y, "selected": isSelected};
        });
    }

    // Both are exist
    return time_series_data.map(d => {
        let isSelected = false;
        let od_ped = od.filter(o => o.id === d.id)[0];
        if (od_ped === undefined) {
            isSelected = false;
        } else {
            isSelected = od_selection.Origins.has(od_ped.o) && od_selection.Destinations.has(od_ped.d);
        }
        return {"id": d.id, "x": d.x, "y": d.y, "selected": isSelected};
    });
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
function deleteVoronoi(voronoi_canvas) {
    voronoi_canvas.selectAll("*").remove();
}
function filterPointInPolygon(data, polygon) {
    let polygon_array = polygonToArray(polygon);
    return data.filter(d => d3.polygonContains(polygon_array, [d.x, d.y]));
}

function polygonToArray(polygon) {
    return polygon.attr("points").split(" ").map(s => s.split(",").map(n => Number(n)));
}

function rectangleContainPolygon(polygon) {
    let polygon_array = polygonToArray(polygon);
    let x_coordinates = polygon_array.map(d => d[0]);
    let y_coordinates = polygon_array.map(d => d[1]);
    return [[d3.min(x_coordinates), d3.min(y_coordinates)], [d3.max(x_coordinates), d3.max(y_coordinates)]];
}

function checkVoronoi(data, voronoi_poly_layer, voronoi_canvas) {
    if (d3.select("#voronoi_checkbox").property("checked")) {
        clearCanvas(voronoi_canvas);
        d3.selectAll(".voronoi-los").style("opacity",1);
        voronoi_poly_layer.selectAll("*").each(function () {
            drawAVoronoi(data, d3.select(this), voronoi_canvas);
        })

    } else {
        d3.selectAll(".voronoi-los").style("opacity",0);
        clearCanvas(voronoi_canvas);
    }
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

    d3.select(".voronoi_poly_layer").append("polygon")
        .attr("id", "voronoi-area")
        .attr("points", polygon_hull.map(p => p.join(",")).join(" "));
}

/**
 * Plots a single trajectory
 *
 * @param data
 * @param svg
 * @returns {Promise<*>}
 */
async function plotData(data, svg) {

    async function drawPath(traj) {
        const newData = [];
        for (i = 0; i < traj.x.length; i++) {newData.push({"x": traj.x[i], "y": traj.y[i]})}
        svg.append("path")
            .datum(newData)
            .attr("class", "trajectories")
            .attr("id", `traj_${traj.id}`)
            .attr("d", line);
    }

    var line = d3.line()
        .x(function(d, i) { return d.x; })
        .y(function(d, i) { return d.y; })
        .curve(d3.curveMonotoneX);


    for (lineData of data) {
        drawPath(lineData);
    }

}

function plotAllTrajectories(svg) {
    plotData(trajectoryDataByID, svg);

}