//import {chordKey, arcTween, chordTween} from "./chord_functions.js";

fetch('http://transporsrv2.epfl.ch/api/summary/lausannetest5/test1').then(response => {
    return response.json();
}).then(data => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Static data processing ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Set of keys computed from the grouped od zones.
    const keys = Array.from(new Set(data.map(v => getVisibleName(v.o)).concat(data.map(v => getVisibleName(v.d)))));
    //const keys = Array("left", "top", "right", "bottom")

    // Creation of the full OD matrix. First the data is gropued by OD using D3's nest function. Then the data is stored
    // into a OD matrix (two dimensional array).
    const groupedData = d3.nest()
        .key(function(d) {return getVisibleName(d.o)})
        .key(function(d) {return getVisibleName(d.d)})
        .rollup(function(d) {return d.length;})
        .entries(data);

    let odMatrix = Array.from(Array(keys.length), () => Array(keys.length).fill(0));

    groupedData.forEach(origin => {
        origin.values.forEach(destination => {
            odMatrix[keys.indexOf(origin.key)][keys.indexOf(destination.key)] = destination.value;
        })
    });

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// General chord settings //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // canvas size and chord diagram radii
    const w = 980,
        h = 800,
        r1 = h / 2,
        r0 = r1 - 110;

    const geom = {"w": w, "h": h, "r1" : h/2, "r0": r1-110};

    const chord = d3.chord()
        .padAngle(0.05)
        //.sortSubgroups(d3.descending)
        .sortChords(d3.descending);


    const arc = d3.arc()
        .innerRadius(r0)
        .outerRadius(r0 + 20)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle );


    const ribbon = d3.ribbon()
        .radius(r0)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

    const colors = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// Static chord diagram ////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const svgStatic = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("id", "circle")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    svgStatic.append("circle")
        .attr("r", r0 + 20);


    updateChordDiagram(svgStatic, chord, arc, ribbon, colors, odMatrix, keys, null, geom);


    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Dynamic data processing //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////



    // Creation of time dependent OD matrix. An Array contains one OD matrix per time interval. Created in the same way
    // as the full OD matrix.
    const timeInterval = 10.0;
    const startTime = Math.min(...data.map(p => p.en));
    const endTime = Math.max(...data.map(p => p.ex));

    let odPerTime = Array();

    for (let t = startTime; t <= endTime; t+=timeInterval) {
        const odData = d3.nest()
            .key(function(d) {return getVisibleName(d.o)})
            .key(function(d) {return getVisibleName(d.d)})
            .rollup(function(d) {return d.length;})
            .entries(data.filter(p => p.en <= t && t <= p.ex));

        let odMatrix = Array.from(Array(keys.length), () => Array(keys.length).fill(0));

        odData.forEach(origin => {
            origin.values.forEach(destination => {
                odMatrix[keys.indexOf(origin.key)][keys.indexOf(destination.key)] = destination.value;
            })
        });

        odPerTime.push(odMatrix);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////// Dynamic chord diagram //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////


    const svgDynamic = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("id", "circle")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    svgDynamic.append("circle")
        .attr("r", r0 + 20);

    let currentTimeIndex = 0;
    let chordAnimation;

    let last_layout;

    function animateChordDiagram() {
        if (currentTimeIndex >= odPerTime.length) {
            clearInterval(chordAnimation);
        } else {
            last_layout = updateChordDiagram(svgDynamic, chord, arc, ribbon, colors, odPerTime[currentTimeIndex], keys, last_layout, geom);
            currentTimeIndex += 1;
        }
    }

    chordAnimation = setInterval(animateChordDiagram, 1000);

    // End of chord diagrams
}).catch(err => {
    console.log(err)
});

