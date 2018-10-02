// Define Height and width for SVG canvas
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// SVG canvas
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Background
svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "gray");

// Add some text. (CSS for the text)
// But compute the width of the text
var widthText = 0;

var text = svg.append("text")
        .attr("x", width/2)
        .attr("y", height/2)
        .text( function(d) { return "Have fun with d3.js!"})
        .attr("text-anchor", "middle")
        .attr("id", "middle-text")
        .each(function(d,i) {
            widthText = Math.round(1.2*this.getComputedTextLength());
        })
        ;

console.log(widthText);

// Draw a rectangle in the middle of the canvas
// with the size of the text
var wRect = widthText,
    hRect = 100;

// Warning, you need to insert the rectangle since
// it has to come before the text and not after (--> append)
svg.insert("rect", "text")
        .attr("width", wRect)
        .attr("height", hRect)
        .attr("x", width/2 - wRect/2)
        .attr("y", height/2 - hRect/2)
        .attr("fill", "red")
        .attr("id", "rect");


