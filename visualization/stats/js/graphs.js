function drawGraph(id) {

    graphOptions[id]['nbrBins'] = 20;
    graphOptions[id]['showNumbers'] = false;
    graphOptions[id]['yAxis'] = "Count";
    graphOptions[id]['yAxisValue'] = 'count';
    graphOptions[id]['fontSize'] = 20;
    graphOptions[id]['counterColor'] = 1;
    graphOptions[id]['colors'] = ['#0000FF'];
    graphOptions[id]['colorIndex'] = {'color1': 0};
    graphOptions[id]['yMin'] = null;
    graphOptions[id]['yMax'] = null;
    graphOptions[id]['xMin'] = null;
    graphOptions[id]['xMax'] = null;
    graphOptions[id]['binsData'] = {};

    hist(id, 'start');
}

function hist(id, state) {
    // State is used for the transitions

    const transLength = 1000;

    const vizId = "viz_" + id;

    // A formatter for counts.
    const formatCount = d3.format(",.0f");
    const formatCountPerc = d3.format(",.1f");

    const ttDiv = d3.select("#" + vizId);

    let margin = {top: 20, right: 20, bottom: 0, left: 0};

    margin['bottom'] = 20+2*graphOptions[id]['fontSize'];
    margin['left'] = 30+2*graphOptions[id]['fontSize'];

    if (id === 'density') {
        margin.left += 25;
    }

    const width = 960,
        height = 600;

    const fullWidth = width + margin.left + margin.right;
    const fullHeight = height + margin.top + margin.bottom;

    graphOptions[id]['width'] = fullWidth;
    graphOptions[id]['height'] = fullHeight;

    ttDiv.select("svg").remove();

    let svg = ttDiv
        .classed("svg-container", true) //container class to make it responsive
        .attr(
            "style",
            "padding-bottom: " + Math.ceil(fullHeight * 100 / fullWidth) + "%"
        )
        .append("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
        .attr("id", "svgViz_" + id)
        //class to make it responsive
        .classed("svg-content-responsive", true),
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let max = d3.max(graphOptions[id]['data']);
    let min = d3.min(graphOptions[id]['data']);

    if (graphOptions[id]['xMin'] != null) {
        min = graphOptions[id]['xMin'];
    }

    if (graphOptions[id]['xMax'] != null) {
        max = graphOptions[id]['xMax'];
    }


    // set the ranges
    let x = d3.scaleLinear()
        .domain([min, max])
        .rangeRound([0, width]);
    let y = d3.scaleLinear()
        .range([height, 0]);

    // Create the bins
    let step = (max-min)/(graphOptions[id]['nbrBins']);

    let ticks = Array.from(new Array(graphOptions[id]['nbrBins']), (val,index) => index*step+min);

    const nbrData = graphOptions[id]['data'].length;
    // set the parameters for the histogram
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(ticks)
        (graphOptions[id]['data']);

    if (graphOptions[id]['yAxisValue'] == 'count') {
        function yVals(d) {
            return d.length;
        }
    } else if (graphOptions[id]['yAxisValue'] == 'percentage') {
        function yVals(d) {
            return d.length/nbrData*100;
        }
    }

    let yMinVal = 0;
    let yMaxVal = d3.max(bins, function(d) { return yVals(d); });

    if (graphOptions[id]['yMin'] != null) {
        yMinVal = graphOptions[id]['yMin'];
    }

    if (graphOptions[id]['yMax'] != null) {
        yMaxVal = graphOptions[id]['yMax'];
    }

    // Scale the range of the data in the y domain
    y.domain([yMinVal, yMaxVal]);

    // Color Scale
    const yMax = d3.max(bins, function(d){return yVals(d)});
    const yMin = d3.min(bins, function(d){return yVals(d)});

    let stepColor = (yMax-yMin)/(graphOptions[id]['colors'].length-1);

    let domain = Array.from(new Array(graphOptions[id]['colors'].length), (val,index) => index*stepColor+yMin);

    let colorScale;

    if (graphOptions[id]['colors'].length > 1) {
        colorScale = d3.scaleLinear()
            .domain(domain)
            .range(graphOptions[id]['colors'].reverse());
        graphOptions[id]['colors'].reverse();
    } else {
        colorScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([graphOptions[id]['colors'][0], graphOptions[id]['colors'][0]]);
    }

    const tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return "<strong>Count:</strong> " + d.length + "<br><strong>Percentage:</strong> " + formatCountPerc(d.length/nbrData*100) + "%"; });

    svg.call(tool_tip);

    let bar = g.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(yVals(d)) + ")"; })
        .attr("fill", function(d) { return colorScale(yVals(d)) })
        .on('mouseenter', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    if (state == 'start' || state == 'changedBins' || state == 'changedAxis') {
        bar.append("rect")
            .attr("x", 2.5)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 5)
            .attr("y", function(d) {
                return height-y(yVals(d));
            })
            .attr("height", 0)
            .transition()
            .duration(transLength)
            .attr("y", function() {
                return 0;
            })
            .attr("height", function(d) {
                return height - y(yVals(d));
            });
    } else {
        bar.append("rect")
            .attr("x", 2.5)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 5)
            .attr("y", function(d) {
                return 0;
            })
            .attr("height", function(d) {
                return height - y(yVals(d));
            });
    }

     if (graphOptions[id]['showNumbers']) {
         bar.append("text")
             .attr("dy", ".75em")
             .attr("y", 6)
             .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
             .attr("text-anchor", "middle")
             .attr("fill", "#fff")
             .attr("font", "10px sans-serif")
             .text(function(d) {
                 if(graphOptions[id]['yAxisValue'] == 'count') {
                     return formatCount(yVals(d));
                 } else if (graphOptions[id]['yAxisValue'] == 'percentage') {
                     return formatCountPerc(yVals(d));
                }
             });
     }

    let xAxis = g.append("g")
        .style("font-size", graphOptions[id]['fontSize'])
        .attr("class", "axis axis--x")
        .style("stroke-width", "1px")
        .attr("transform", "translate(0," + height + ")");
    if(state == 'start' || state == 'changedAxis') {
        xAxis.transition()
            .duration(transLength)
            .call(d3.axisBottom(x));
    } else {
        xAxis.call(d3.axisBottom(x));
    }


    // text label for the x axis
    let xAxisText = svg.append("text")
        .attr("transform",
            "translate(" + (width/2 + margin.left) + " ," +
            (fullHeight - 2*margin.top/3) + ")")
        .style("text-anchor", "middle")
        .style("font-size", graphOptions[id]['fontSize'])
        .text(graphOptions[id]['xAxis']);

    if(state == 'start' || state == 'changedAxis') {
        xAxisText.attr("fill-opacity", 0)
            .transition()
            .duration(transLength)
            .attr("fill-opacity", 1);
    }

    // Add the y Axis
    let yAxis = g.append("g")
        .style("font-size", graphOptions[id]['fontSize']);

    if (state == 'start' || state == 'changedYAxis' || state == 'changedBins' || state == 'changedAxis') {
        yAxis.transition()
            .duration(transLength)
            .call(d3.axisLeft(y));
    } else {
        yAxis.call(d3.axisLeft(y));
    }

    // text label for the y axis
    let text = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("x",0 - (fullHeight/2 - margin.top))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", graphOptions[id]['fontSize'])
        .text(graphOptions[id]['yAxis']);

    if (state == 'start' || state == 'changedYAxis' || state == 'changedAxis') {
        text.attr("fill-opacity", 0)
            .transition()
            .duration(transLength)
            .attr("fill-opacity", 1);
    }

    // Prepare Bins data

    graphOptions[id]['binsData'] = {'x': ticks, 'y_count': bins.map(d => d.length), 'y_perc': bins.map(d => d.length/nbrData*100)};

}

// Options

function changeBins(e, id) {

    console.log(e.value);

    graphOptions[id]['nbrBins'] = parseInt(e.value);

    hist(id, 'changedBins');

}

function changeYAxis(e, id) {
    console.log(e.value);

    graphOptions[id]['yAxisValue'] = e.value;

    if (e.value == 'count') {
        graphOptions[id]['yAxis'] = 'Count';
    } else if (e.value == 'percentage') {
        graphOptions[id]['yAxis'] = 'Percentage';
    }

    hist(id, 'changedYAxis');
}

function changeShowNumbers(e, id) {
    console.log(e.checked);

    graphOptions[id]['showNumbers'] = e.checked;
    hist(id, 'showNumbers');

}

function changeFontSize(e, id) {
    graphOptions[id]['fontSize'] = parseInt(e.value);
    hist(id, 'changeFontSize');
}

function addColor(id) {

    const strColorsDiv = "colors_" + id;

    graphOptions[id]['counterColor'] += 1;

    let toBeAdded = "                <div class=\"col-lg-8 col-9\"  id=\"color" + graphOptions[id]['counterColor'] + "Picker_" + id + "\">\n" +
        "                    <input class=\"form-control\" type=\"color\" id=\"color" + graphOptions[id]['counterColor'] + "_" + id + "\" value=\"#000000\" oninput=\"changeColor(this, 'color" + graphOptions[id]['counterColor'] + "', '" + id + "')\">\n" +
        "                </div>\n" +
        "                        <div class=\"col-lg-4 col-3 text-center\" id=\"color" + graphOptions[id]['counterColor'] + "Remove_" + id + "\">\n" +
        "                            <button class=\"btn btn-primary\" id=\"RemoveColor" + graphOptions[id]['counterColor'] + "_" + id + "\" onclick=\"removeColor(this, 'color" + graphOptions[id]['counterColor'] + "', '" + id + "')\">\n" +
        "                                <i class=\"fas fa-minus\"></i>\n" +
        "                            </button>\n" +
        "                        </div>"




    $('#' + strColorsDiv).append(toBeAdded);

    graphOptions[id]['colors'].push('#000000');
    graphOptions[id]['colorIndex']['color'+graphOptions[id]['counterColor']] = graphOptions[id]['colors'].length -1;

    hist(id, 'changeColor');
}

function removeColor(e, thisId, id) {

    const index = graphOptions[id]['colorIndex'][thisId]

    graphOptions[id]['colors'].splice(index, 1);

    delete graphOptions[id]['colorIndex'][thisId];

    Object.keys(graphOptions[id]['colorIndex']).forEach(key => {
        if (graphOptions[id]['colorIndex'][key] > index) {
            graphOptions[id]['colorIndex'][key] -= 1;
        }
    })

    $('#' + thisId + 'Picker_' + id).remove();
    $('#' + thisId + 'Remove_' + id).remove();

    hist(id, 'changeColor');
}

function changeColor(e, thisId, id) {

    graphOptions[id]['colors'][graphOptions[id]['colorIndex'][thisId]] = e.value;

    hist(id, 'changeColor');
}

function changeAxis(e, id, type) {

    if (e.value == "") {
        graphOptions[id][type] = null;
    } else {
        graphOptions[id][type] = parseFloat(e.value);
    }

    hist(id, 'changedAxis');
}

function exportGraph(id) {

    const type = document.getElementById("exportType_" + id).value;
    const name = document.getElementById("exportName_" + id).value;

    if (name === "" || type === "") {
        window.alert("Please specifiy a name and a type!");
    } else {
        if (type === 'png') {
            saveAsPNG(id, name);
        } else if (type == 'csv') {
            saveAsCSV(id, name);
        }
    }
}

function saveMainViz(id) {

    const name = document.getElementById("exportName_" + id).value;

    saveAsPNG(id, name);
}

function saveAsPNG(id, name) {

    let svg;

    if (id !== "mainViz") {
        svg = d3.select("#svgViz_" + id).node();
    } else {
        svg = d3.select("#svgCont").node();
    }

    console.log(svg);

    let height;

    if (id === 'tt' || id === 'density') {
        height = graphOptions[id]['height']
    } else if (id === 'OD') {
        height = 900;
    } else if (id === "mainVIz") {
        height = getVizHeight();
    }

    let scale;

    if ( id==="tt" || id === "density") {
        scale = 2;
    } else if (id === 'OD') {
        scale = 1;
    } else if (id === "mainViz") {
        scale = 50;
    }

    let left = 0;

    if (id === "OD") {
        left = -450;
    }

    let top = 0;

    if (id === "OD") {
        top = -450;
    }


    saveSvgAsPng(svg, name + ".png", {scale: scale, backgroundColor: '#FFFFFF', height: height, top:top, left:left, encoderOptions: 0.2});

}

function saveAsCSV(id, name) {

    // Transform the data first

    let data = [];

    data.push(Object.keys(graphOptions[id]['binsData']));

    graphOptions[id]['binsData']['x'].forEach((x, i) => {
        data.push([x, graphOptions[id]['binsData']['y_count'][i], graphOptions[id]['binsData']['y_perc'][i]]);
    })

    // Building the CSV from the Data two-dimensional array
    // Each column is separated by ";" and new line "\n" for next row
    var csvContent = '';
    data.forEach(function(infoArray, index) {
        dataString = infoArray.join(';');
        csvContent += index < data.length ? dataString + '\n' : dataString;
    });

    // The download function takes a CSV string, the filename and mimeType as parameters
    // Scroll/look down at the bottom of this snippet to see how download is called
    var download = function(content, fileName, mimeType) {
        var a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([content], {
                type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
            a.href = URL.createObjectURL(new Blob([content], {
                type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
        }
    }

    download(csvContent, name + '.csv', 'text/csv;encoding:utf-8');

}