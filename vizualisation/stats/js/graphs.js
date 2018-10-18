function drawGraph(id) {

    setBaseOptions(id);

    if (graphOptions[id].type == 'histogram') {
        hist(id, 'start');
    }

}

function setBaseOptions(id) {
    if (graphOptions[id].type == 'histogram') {

        graphOptions[id]['nbrBins'] = 20;
        graphOptions[id]['showNumbers'] = false;
        graphOptions[id]['xAxis'] = "Travel time [s]";
        graphOptions[id]['yAxis'] = "Count";
        graphOptions[id]['yAxisValue'] = 'count';
        graphOptions[id]['fontSize'] = 20;
        graphOptions[id]['counterColor'] = 1;
        graphOptions[id]['colors'] = ['#0000FF'];
        graphOptions[id]['colorIndex'] = {'color1': 0};
    }
}

function hist(id, state) {
    // State is used for the transitions

    const transLength = 1000;

    // Greatly inspired from http://bl.ocks.org/nnattawat/8916402

    //addOptionsHist(id)

    const vizId = "viz" + id.charAt(0).toUpperCase() + id.substr(1);

    document.getElementById(id).style.display = "block";

    const color = "steelblue";

    // A formatter for counts.
    const formatCount = d3.format(",.0f");
    const formatCountPerc = d3.format(",.1f");

    const ttDiv = d3.select("#" + vizId);

    let margin = {top: 20, right: 20, bottom: 0, left: 0};

    margin['bottom'] = 20+2*graphOptions[id]['fontSize'];
    margin['left'] = 30+2*graphOptions[id]['fontSize'];

    const width = 960,
        height = 600;

    const fullWidth = width + margin.left + margin.right;
    const fullHeight = height + margin.top + margin.bottom;

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
        //class to make it responsive
        .classed("svg-content-responsive", true),
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let max = d3.max(graphOptions[id]['data']);
    let min = d3.min(graphOptions[id]['data']);

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

    // Scale the range of the data in the y domain
    y.domain([0, d3.max(bins, function(d) { return yVals(d); })]);

    // Color Scale
    const yMax = d3.max(bins, function(d){return yVals(d)});
    const yMin = d3.min(bins, function(d){return yVals(d)});

    let stepColor = (yMax-yMin)/(graphOptions[id]['colors'].length-1);

    let domain = Array.from(new Array(graphOptions[id]['colors'].length), (val,index) => index*stepColor+yMin);

    let colorScale;

    if (graphOptions[id]['colors'].length > 1) {
        colorScale = d3.scaleLinear()
            .domain(domain)
            .range(graphOptions[id]['colors']);
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

    if (state == 'start' || state == 'changedBins') {
        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
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
            .attr("x", 1)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
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
        .attr("transform", "translate(0," + height + ")");
    if(state == 'start') {
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

    if(state == 'start') {
        xAxisText.attr("fill-opacity", 0)
            .transition()
            .duration(transLength)
            .attr("fill-opacity", 1);
    }

    // Add the y Axis
    let yAxis = g.append("g")
        .style("font-size", graphOptions[id]['fontSize']);

    if (state == 'start' || state == 'changedYAxis' || state == 'changedBins') {
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

    if (state == 'start' || state == 'changedYAxis') {
        text.attr("fill-opacity", 0)
            .transition()
            .duration(transLength)
            .attr("fill-opacity", 1);
    }

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

    const strColorsDiv = "colors" + id.charAt(0).toUpperCase() + id.substr(1);

    const upCase = id.charAt(0).toUpperCase() + id.substr(1);

    graphOptions[id]['counterColor'] += 1;

    let toBeAdded = "                <div class=\"col-lg-8 col-10\"  id=\"color" + graphOptions[id]['counterColor'] + "Picker" + upCase + "\">\n" +
        "                    <input class=\"form-control\" type=\"color\" id=\"color" + graphOptions[id]['counterColor'] + upCase + "\" value=\"#000000\" oninput=\"changeColor(this, 'color" + graphOptions[id]['counterColor'] + "', '" + id + "')\">\n" +
        "                </div>\n" +
        "                <div class=\"col-lg-4 col-2 text-center\" id=\"color" + graphOptions[id]['counterColor'] + "Remove" + upCase + "\">\n" +
        "                    <input class=\"btn btn-primary\" type=\"button\" id=\"RemoveColor" + graphOptions[id]['counterColor'] + upCase + "\" value=\"-\" id=\"color" + graphOptions[id]['counterColor'] + upCase + "\" onclick=\"removeColor(this, 'color" + graphOptions[id]['counterColor'] + "', '" + id + "')\">\n" +
        "                </div>"


    $('#' + strColorsDiv).append(toBeAdded);

    graphOptions[id]['colors'].push('#000000');
    graphOptions[id]['colorIndex']['color'+graphOptions[id]['counterColor']] = graphOptions[id]['colors'].length -1;

    hist(id, 'changeColor');
}

function removeColor(e, thisId, id) {

    const upCase = id.charAt(0).toUpperCase() + id.substr(1);

    const index = graphOptions[id]['colorIndex'][thisId]

    graphOptions[id]['colors'].splice(index, 1);

    delete graphOptions[id]['colorIndex'][thisId];

    Object.keys(graphOptions[id]['colorIndex']).forEach(key => {
        if (graphOptions[id]['colorIndex'][key] > index) {
            graphOptions[id]['colorIndex'][key] -= 1;
        }
    })

    $('#' + thisId + 'Picker' + upCase).remove();
    $('#' + thisId + 'Remove' + upCase).remove();

    hist(id, 'changeColor');
}

function changeColor(e, thisId, id) {

    graphOptions[id]['colors'][graphOptions[id]['colorIndex'][thisId]] = e.value;

    hist(id, 'changeColor');
}

