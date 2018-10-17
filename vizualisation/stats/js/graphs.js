function hist(id, nbrBins=20) {

    // Greatly inspired from http://bl.ocks.org/nnattawat/8916402

    //addOptionsHist(id)

    const vizId = "viz" + id.charAt(0).toUpperCase() + id.substr(1);

    document.getElementById(id).style.display = "block";

    const color = "steelblue";

    // A formatter for counts.
    const formatCount = d3.format(",.0f");

    const ttDiv = d3.select("#" + vizId);

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

    const max = d3.max(data[id]);
    const min = d3.min(data[id]);

    // set the ranges
    let x = d3.scaleLinear()
        .domain([min, max])
        .rangeRound([0, width]);
    let y = d3.scaleLinear()
        .range([height, 0]);

    // set the parameters for the histogram
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(nbrBins))
        (data[id]);

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
        .attr("fill", function(d) { return colorScale(d.length) });

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

}

function changeBins(e, id) {

    console.log(e.value);

    hist(id, nbrBins=e.value);

}