const dataFolder = '../data/';

let pedestrianPaths;

let initTime, finalTime;

function readData() {

    fetch(dataFolder + "small/pedestrians_clean.json")
        .then(response => response.json())
        .then(json => {
            pedestrianPaths = json;
        })
        .then(() => main());

}

function main() {
    console.log("dostuff");

    update_info();
}

function update_info() {

    // Get initial time
    initTime = pedestrianPaths[0]["time"];

    // Get final time
    finalTime = pedestrianPaths[pedestrianPaths.length -1]["time"];

    // Update in the HTML
    document.getElementById("init_time").value = initTime;
    document.getElementById("init_time").min = initTime;
    document.getElementById("init_time").max = finalTime;

    document.getElementById("final_time").value = finalTime;
    document.getElementById("final_time").min = initTime;
    document.getElementById("final_time").max = finalTime;
}


readData();