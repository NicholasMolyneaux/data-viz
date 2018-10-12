
// Starts by loadoing trajectory data
let trackingData;
let timeSlider;

d3.json('data/intersection-with-gates_simulation_trajectories_3PWjU5KgDW.json', function(trajData) {
    trackingData = trajData;
    const times = trajData.map(d => d.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(times, minTime, maxTime);

    timeSlider = noUiSlider.create(handlesSlider, {
        start: [minTime, maxTime],
        range: {
            'min': [minTime],
            'max': [maxTime]
        },
        connect: true,
    });
});

// sets various canvas parameters
const svgCanvasMargins = {top: 10, right: 30, bottom: 30, left: 30};
const svgInnerMargins = {top: 5, right: 5, bottom: 5, left: 5};

const svg = d3.select("body").append("svg").attr("id", "moving-peds");

// mapping functions from real world to pixels inside canvas
let xScale, yScale;
const width = 960;
let height;

var handlesSlider = document.getElementById('slider-handles');

createBackground();

let pedMover;
let currentTimeShownIdx = 0;