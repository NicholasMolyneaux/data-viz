/*********************************************************/
/*                                                       */
/*   Main functions for the histograms                   */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Draw the graph. Initial function to setup the options of the histogram
 *
 * @param: id - ID of the histogram
 */
function drawGraph(id) {

    // Setup the initial options
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

    // Actually draw the histogram
    hist(id, 'start');
}

/**
 * Draw the histogram. Actual function to draw the histogram.
 *
 * The state parameter is used to trigger different animation on the histogram based on which option changed.
 *
 * @param: id - ID of the histogram
 * @param: state - string for the state of the histogram
 *                 (start, changedBins, changedAxis, changedYAxis, and changeColor)
 */
function hist(id, state) {

    // Length of the transition
    const transLength = 1000;

    // ID of the viz with the histograms
    const vizId = "viz_" + id;

    // A formatter for counts.
    const formatCount = d3.format(",.0f");
    const formatCountPerc = d3.format(",.1f");

    // Get the d3 div
    const svgDiv = d3.select("#" + vizId);

    // Define the margins
    let margin = {top: 20, right: 20, bottom: 0, left: 0};

    // The margins depend on the font size. (bigger margins for bigger font size)
    margin['bottom'] = 20+2*graphOptions[id]['fontSize'];
    margin['left'] = 30+2*graphOptions[id]['fontSize'];

    // For the density, we need a bigger margin on the left since the number are quite big
    if (id === 'density') {
        margin.left += 25;
    }

    // Width and height of the graph
    const width = 960,
        height = 600;

    // Width and height with the margins
    const fullWidth = width + margin.left + margin.right;
    const fullHeight = height + margin.top + margin.bottom;

    // Save these values
    graphOptions[id]['width'] = fullWidth;
    graphOptions[id]['height'] = fullHeight;
    
    // We remove all SVG inside this div (in case, we're redrawing it)
    svgDiv.select("svg").remove();

    // Prepare the svg
    let svg = svgDiv
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

    // Get max and min values in the data for the x axis
    let max = d3.max(graphOptions[id]['data']);
    let min = d3.min(graphOptions[id]['data']);

    // If a min has been specified, we need to change it
    if (graphOptions[id]['xMin'] != null) {
        min = graphOptions[id]['xMin'];
    }

    // If a max has been specified, we need to change it
    if (graphOptions[id]['xMax'] != null) {
        max = graphOptions[id]['xMax'];
    }

    // Set the ranges
    let x = d3.scaleLinear()
        .domain([min, max])
        .rangeRound([0, width]);
    let y = d3.scaleLinear()
        .range([height, 0]);

    // Step for the ticks
    let step = (max-min)/(graphOptions[id]['nbrBins']);

    // Ticks
    let ticks = Array.from(new Array(graphOptions[id]['nbrBins']), (val,index) => index*step+min);

    // Number of points in the data
    const nbrData = graphOptions[id]['data'].length;

    // Set the parameters for the histogram
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(ticks)
        (graphOptions[id]['data']);

    // Get the values of the yAxis depending on if we want the count or the percentage
    if (graphOptions[id]['yAxisValue'] === 'count') {
        function yVals(d) {
            return d.length;
        }
    } else if (graphOptions[id]['yAxisValue'] === 'percentage') {
        function yVals(d) {
            return d.length/nbrData*100;
        }
    }

    // Min and max values for y axis
    let yMinVal = 0;
    let yMaxVal = d3.max(bins, function(d) { return yVals(d); });

    // If min is specified in the options, change it
    if (graphOptions[id]['yMin'] != null) {
        yMinVal = graphOptions[id]['yMin'];
    }

    // If max is specified in the options, change it
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

    // Add a tolltip
    const tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return "<strong>Count:</strong> " + d.length + "<br><strong>Percentage:</strong> " + formatCountPerc(d.length/nbrData*100) + "%"; });

    svg.call(tool_tip);

    // Now, we can finally draw the bars of the histograms.
    // Finally, time, no? =)
    if (graphOptions[id]['data'].length > 1) {
        // We have some data, so we can draw something

        let bar = g.selectAll(".bar")
            .data(bins)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(yVals(d)) + ")"; })
            .attr("fill", function(d) { return colorScale(yVals(d)) })
            .on('mouseenter', tool_tip.show)
            .on('mouseout', tool_tip.hide);

        // Depending on the state, we'll add some transition
        if (state === 'start' || state === 'changedBins' || state === 'changedAxis') {
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

        // Draw the numbers on the bars if specified
        if (graphOptions[id]['showNumbers']) {
            bar.append("text")
                .attr("dy", ".75em")
                .attr("y", 6)
                .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
                .attr("text-anchor", "middle")
                .attr("fill", "#fff")
                .attr("font", "10px sans-serif")
                .text(function(d) {
                    if(graphOptions[id]['yAxisValue'] === 'count') {
                        return formatCount(yVals(d));
                    } else if (graphOptions[id]['yAxisValue'] === 'percentage') {
                        return formatCountPerc(yVals(d));
                    }
                });
        }
    } else {
        // We don't have data, for one reason or another.
        // So, we just say that we don't have data =P
        let text = svg.append("text")
            .attr("y", height/2)
            .attr("x", width/2 + margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("font-size", "70")
            .style("font-family", "DeadKansas")
            .style("color", "#1D1B0D")
            .text("no data");
    }

    // Draw the xAxis
    let xAxis = g.append("g")
        .style("font-size", graphOptions[id]['fontSize'])
        .attr("class", "axis axis--x")
        .style("stroke-width", "1px")
        .attr("transform", "translate(0," + height + ")");
    if(state === 'start' || state === 'changedAxis') {
        xAxis.transition()
            .duration(transLength)
            .call(d3.axisBottom(x));
    } else {
        xAxis.call(d3.axisBottom(x));
    }


    // Text labels for the xAxis
    let xAxisText = svg.append("text")
        .attr("transform",
            "translate(" + (width/2 + margin.left) + " ," +
            (fullHeight - 2*margin.top/3) + ")")
        .style("text-anchor", "middle")
        .style("font-size", graphOptions[id]['fontSize'])
        .text(graphOptions[id]['xAxis']);

    if(state === 'start' || state === 'changedAxis') {
        xAxisText.attr("fill-opacity", 0)
            .transition()
            .duration(transLength)
            .attr("fill-opacity", 1);
    }

    // Draw the yAxis
    let yAxis = g.append("g")
        .style("font-size", graphOptions[id]['fontSize']);

    if (state === 'start' || state === 'changedYAxis' || state === 'changedBins' || state === 'changedAxis') {
        yAxis.transition()
            .duration(transLength)
            .call(d3.axisLeft(y));
    } else {
        yAxis.call(d3.axisLeft(y));
    }

    // Text labels for the yAxis
    let text = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("x",0 - (fullHeight/2 - margin.top))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", graphOptions[id]['fontSize'])
        .text(graphOptions[id]['yAxis']);

    if (state === 'start' || state === 'changedYAxis' || state === 'changedAxis') {
        text.attr("fill-opacity", 0)
            .transition()
            .duration(transLength)
            .attr("fill-opacity", 1);
    }

    // Prepare the bins data for exporting in CSV
    graphOptions[id]['binsData'] = {'x': ticks, 'y_count': bins.map(d => d.length), 'y_perc': bins.map(d => d.length/nbrData*100)};

}

///////////////////////////////////////////////////////////
//                                                       //
//                       Options                         //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Change the number of bins and redraw the histogram
 *
 * @param: e - HTML element
 * @param: id - ID of the histogram
 */
function changeBins(e, id) {

    // Change the number of bins and save it
    graphOptions[id]['nbrBins'] = parseInt(e.value);

    // Redraw the histogram
    hist(id, 'changedBins');

}

/**
 * Change the number of bins and redraw the histogram
 *
 * @param: e - HTML element
 * @param: id - ID of the histogram
 */
function changeYAxis(e, id) {

    // Get the values from the HTML
    graphOptions[id]['yAxisValue'] = e.value;

    // Update the y axis name
    if (e.value === 'count') {
        graphOptions[id]['yAxis'] = 'Count';
    } else if (e.value === 'percentage') {
        graphOptions[id]['yAxis'] = 'Percentage';
    }

    // Redraw the hist
    hist(id, 'changedYAxis');
}

/**
 * Show the numbers on hist and redraw the histogram
 *
 * @param: e - HTML element
 * @param: id - ID of the histogram
 */
function changeShowNumbers(e, id) {
    // Get the boolean from the HTML
    graphOptions[id]['showNumbers'] = e.checked;

    // Redraw the hist
    hist(id, 'showNumbers');

}

/**
 * Change the font size and redraw the histogram
 *
 * @param: e - HTML element
 * @param: id - ID of the histogram
 */
function changeFontSize(e, id) {
    // Get the value from the HTML
    graphOptions[id]['fontSize'] = parseInt(e.value);

    // Redraw the hist
    hist(id, 'changeFontSize');
}

/**
 * Add another color to the histogram
 *
 * Fancy, no?
 *
 * @param: id - ID of the histogram
 */
function addColor(id) {

    // Get the div with the colors for the histogram
    const strColorsDiv = "colors_" + id;

    // update the counter of colors
    graphOptions[id]['counterColor'] += 1;

    // some HTML =D
    let toBeAdded = "                <div class=\"col-lg-8 col-9\"  id=\"color" + graphOptions[id]['counterColor'] + "Picker_" + id + "\">\n" +
        "                    <input class=\"form-control\" type=\"color\" id=\"color" + graphOptions[id]['counterColor'] + "_" + id + "\" value=\"#000000\" oninput=\"changeColor(this, 'color" + graphOptions[id]['counterColor'] + "', '" + id + "')\">\n" +
        "                </div>\n" +
        "                        <div class=\"col-lg-4 col-3 text-center\" id=\"color" + graphOptions[id]['counterColor'] + "Remove_" + id + "\">\n" +
        "                            <button class=\"btn btn-primary\" id=\"RemoveColor" + graphOptions[id]['counterColor'] + "_" + id + "\" onclick=\"removeColor(this, 'color" + graphOptions[id]['counterColor'] + "', '" + id + "')\">\n" +
        "                                <i class=\"fas fa-minus\"></i>\n" +
        "                            </button>\n" +
        "                        </div>"

    // Append the HTML
    $('#' + strColorsDiv).append(toBeAdded);

    // Push the color in the options
    graphOptions[id]['colors'].push('#000000');
    graphOptions[id]['colorIndex']['color'+graphOptions[id]['counterColor']] = graphOptions[id]['colors'].length -1;

    // Redraw the hist
    hist(id, 'changeColor');
}

/**
 * Remove one color from the histogram
 *
 * Apparently, no...
 *
 * @param: e - HTML element
 * @param: thisId - ID of the color
 * @param: id - ID of the histogram
 */
function removeColor(e, thisId, id) {

    // Get the index of the color we want to remove
    const index = graphOptions[id]['colorIndex'][thisId]

    // Splice the color, yeahhh!!!
    graphOptions[id]['colors'].splice(index, 1);

    // Delete it
    delete graphOptions[id]['colorIndex'][thisId];

    // Change the key of all the colors after the one being removed
    Object.keys(graphOptions[id]['colorIndex']).forEach(key => {
        if (graphOptions[id]['colorIndex'][key] > index) {
            graphOptions[id]['colorIndex'][key] -= 1;
        }
    });

    // Remove the divs
    $('#' + thisId + 'Picker_' + id).remove();
    $('#' + thisId + 'Remove_' + id).remove();

    // Redraw the hist
    hist(id, 'changeColor');
}

/**
 * Change one of the colors
 *
 * Really fancy this time!
 *
 * @param: e - HTML element
 * @param: thisId - ID of the color
 * @param: id - ID of the histogram
 */
function changeColor(e, thisId, id) {

    // Change the color value in the options
    graphOptions[id]['colors'][graphOptions[id]['colorIndex'][thisId]] = e.value;

    // Redraw the hist
    hist(id, 'changeColor');
}

/**
 * Change the axis values (X and Y)
 **
 * @param: e - HTML element
 * @param: id - ID of the histogram
 * @param: type - which axis value has changed
 */
function changeAxis(e, id, type) {

    // Either put it as null or take the value
    if (e.value == "") {
        graphOptions[id][type] = null;
    } else {
        graphOptions[id][type] = parseFloat(e.value);
    }

    // Redraw the hist
    hist(id, 'changedAxis');
}