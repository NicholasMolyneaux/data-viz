function drawTT(hist) {

    // Greatly inspired from http://bl.ocks.org/nnattawat/8916402

    // Extract the width and height that was computed by CSS.

    const color = "steelblue";

    // A formatter for counts.
    const formatCount = d3.format(",.0f");

    const ttDiv = d3.select("#graph1");

    const margin = {top: 20, right: 30, bottom: 30, left: 30};

    const width = 960,
        height = 500;

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

    const max = d3.max(hist);
    const min = d3.min(hist);

    // set the ranges
    let x = d3.scaleLinear()
        .domain([min, max])
        .rangeRound([0, width]);
    let y = d3.scaleLinear()
        .range([height, 0]);

    // Get the number of bins
    //const nbrBins = document.getElementById("bins_TT").value;
    const nbrBins = 20;

    // set the parameters for the histogram
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(nbrBins))
        (hist);

    console.log(bins);

    // Scale the range of the data in the y domain
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);

    // Color Scale
    const yMax = d3.max(bins, function(d){return d.length});
    const yMin = d3.min(bins, function(d){return d.length});
    console.log(yMin, yMax);

    const colorScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([d3.rgb("#57595D"), d3.rgb(color)]);

    let bar = g.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("fill", function(d) { console.log(d.length); return colorScale(d.length) });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", function(d) { return height - y(d.length); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font", "10px sans-serif")
        .text(function(d) { return formatCount(d.length); });

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    g.append("g")
        .call(d3.axisLeft(y));


    /*
    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .attr("fill", function(d) { return colorScale(d.y) });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

        */

    /*
    const x = d3.scale.linear()
        .domain([min, max])
        .range([0, initWidth]);

    // Get the number of bins
    const nbrBins = document.getElementById("bins_TT").value;

    // Generate a histogram using twenty uniformly-spaced bins.
    let data = d3.layout.histogram()
        .bins(x.ticks(nbrBins))
        (hist);

    const yMax = d3.max(data, function(d){return d.length});
    const yMin = d3.min(data, function(d){return d.length});
    const colorScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

    const y = d3.scale.linear()
        .domain([0, yMax])
        .range([initHeight, 0]);

    const xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    let bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", (x(data[0].dx) - x(0)) - 1)
        .attr("height", function(d) { return initHeight - y(d.y); })
        .attr("fill", function(d) { return colorScale(d.y) });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -12)
        .attr("x", (x(data[0].dx) - x(0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.y); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + initHeight + ")")
        .call(xAxis);*/

}