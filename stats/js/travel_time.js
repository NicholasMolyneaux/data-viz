function debug() {

}

function drawTT(hist) {

    // Greatly inspired from http://bl.ocks.org/nnattawat/8916402

    // Extract the width and height that was computed by CSS.

    const color = "steelblue";

    // A formatter for counts.
    const formatCount = d3.format(",.0f");

    const ttDiv = d3.select("#TT");

    const margin = {top: 20, right: 30, bottom: 30, left: 30};

    const initWidth = 960,
        initHeight = 500;

    const width = initWidth + margin.left + margin.right;
    const height = initHeight + margin.top + margin.bottom;

    ttDiv.select("svg").remove();

    let svg = ttDiv
        .classed("svg-container", true) //container class to make it responsive
        .attr(
            "style",
            "padding-bottom: " + Math.ceil(height * 100 / initWidth) + "%"
        )
        .append("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height)
        //class to make it responsive
        .classed("svg-content-responsive", true)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //svg.

    /*.attr(
    "style",
    "padding-bottom: " + Math.ceil(height * 100 / width) + "%"
    )*/
    /*
        .attr(
            "style",
            "padding: " + Math.ceil(height * 100 / width) + "%"
        )
        .append("svg")
        .attr("viewBox", "0 0 " + width + " " + height);*/
        /*.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");*/

    /*let svg = ttDiv.append("svg").attr("id", "tt_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");*/

    /*let svg = ttDiv
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 400")
        //class to make it responsive
        .classed("svg-content-responsive", true)
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");*/


    const max = d3.max(hist);
    const min = d3.min(hist);
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
        .call(xAxis);

}