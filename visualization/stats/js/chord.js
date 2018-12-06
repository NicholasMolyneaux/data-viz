
let chordAnimation;
let pausedChord = false;
let chordAnimationCurrentTimeIdx = 0;

let makingNewGroup = [];
let newGroupLabel = "";

const IDLE = 0;
const SELECTING = 1;
let stateButtonChord = IDLE;

function groupingChordGroups(groupedData) {
    if (stateButtonChord === IDLE) {
        stateButtonChord = SELECTING;
        makingNewGroup = {};
        newGroupLabel = "";
        return {};
    } else if (stateButtonChord === SELECTING) {
        stateButtonChord = IDLE;
        makingNewGroup.forEach(l => groupedData[keys[l] = newGroupLabel]);
        deleteChord();
        staticChord(data, groupedData);
        return groupedData;
    } else { console.log("ERROR WITH GROUPING CHORD DIAGRAM")}
}

function deleteCustomGroups() {
    deleteChord();
    staticChord(data, {});
    return {};
}

$( "#playPauseButtonChord" ).click(function() {

    if (pausedChord) {
        chordAnimation = setInterval(chordAnimateFunction, 1000);
        document.getElementById("playPauseButtonChord").innerHTML = "<i class=\"fas fa-pause fa-lg\"></i>";
        pausedChord = false;
    } else {
        clearInterval(chordAnimation);
        document.getElementById("playPauseButtonChord").innerHTML = "<i class=\"fas fa-play fa-lg\"></i>";
        pausedChord = true;
    }

});

function deleteChord() {
    const svg = d3.select("#circle");
    svg.selectAll(("g")).remove();
    svg.selectAll(("path")).remove();
}

function staticChord(data, groupedZones) {

    const getVisibleName = getVisibleNameMapping(groupedZones);

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Static data processing ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Set of keys computed from the grouped od zones.
    const keys = Array.from(new Set(data.map(v => getVisibleName(v.o)).concat(data.map(v => getVisibleName(v.d)))));
    //const keys = Array("left", "top", "right", "bottom")

    // Creation of the full OD matrix. First the data is gropued by OD using D3's nest function. Then the data is stored
    // into a OD matrix (two dimensional array).
    const groupedData = d3.nest()
        .key(function (d) {
            return getVisibleName(d.o)
        })
        .key(function (d) {
            return getVisibleName(d.d)
        })
        .rollup(function (d) {
            return d.length;
        })
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

    const svgUp = d3.select("#containerForOD");

    const w = svgUp.node().getBoundingClientRect().width,
        h = svgUp.node().getBoundingClientRect().height;

    const geom = {"w": w, "h": h, "r1": h / 2, "r0": h / 2 - 110, "textSpacing": 40};

    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc()
        .innerRadius(geom.r0)
        .outerRadius(geom.r0 + 20)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);


    const ribbon = d3.ribbon()
        .radius(geom.r0)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

    const colors = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// Static chord diagram ////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const svg = d3.select("#circle");

    svg.append("circle")
        .attr("r", geom.r0 + 20);

    return updateChordDiagram(svg, chord, arc, ribbon, colors, odMatrix, keys, null, geom, 2000);
}

function dynamicChord(data, groupedZones) {

    const duration = 1000; // ms

    const getVisibleName = getVisibleNameMapping(groupedZones);

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Dynamic data processing //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Set of keys computed from the grouped od zones.
    const keys = Array.from(new Set(data.map(v => getVisibleName(v.o)).concat(data.map(v => getVisibleName(v.d)))));
    //const keys = Array("left", "top", "right", "bottom")


    // Creation of time dependent OD matrix. An Array contains one OD matrix per time interval. Created in the same way
    // as the full OD matrix.
    const timeInterval = 10.0;
    const startTime = Math.min(...data.map(p => p.en));
    const endTime = Math.max(...data.map(p => p.ex));

    let odPerTime = Array();

    for (let t = startTime; t <= endTime; t += timeInterval) {
        const odData = d3.nest()
            .key(function (d) {
                return getVisibleName(d.o)
            })
            .key(function (d) {
                return getVisibleName(d.d)
            })
            .rollup(function (d) {
                return d.length;
            })
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
    //////////////////////////////////// General chord settings //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const svgUp = d3.select("#containerForOD");

    const w = svgUp.node().getBoundingClientRect().width,
        h = svgUp.node().getBoundingClientRect().height;

    const geom = {"w": w, "h": h, "r1": h / 2, "r0": h / 2 - 110, "textSpacing": 40};

    const chord = d3.chord()
        .padAngle(0.05)
        //.sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc()
        .innerRadius(geom.r0)
        .outerRadius(geom.r0 + 20)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);


    const ribbon = d3.ribbon()
        .radius(geom.r0)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

    const colors = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    //////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////// Dynamic chord diagram //////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const svg = d3.select("#circle");

    svg.append("circle")
        .attr("r", geom.r0 + 20);

    //let currentTimeIndex = 0;
    //let chordAnimation;

    let last_layout;

    function animateChordDiagram() {
        if (chordAnimationCurrentTimeIdx >= odPerTime.length) {
            clearInterval(chordAnimation);
        } else {
            last_layout = updateChordDiagram(svg, chord, arc, ribbon, colors, odPerTime[chordAnimationCurrentTimeIdx], keys, last_layout, geom, duration);
            chordAnimationCurrentTimeIdx += 1;
        }
    }

    //chordAnimation = setInterval(animateChordDiagram, duration);

    return animateChordDiagram;
}

