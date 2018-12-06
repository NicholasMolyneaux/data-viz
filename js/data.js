let wallsData = null;
let zonesData = null;
let gatesData = null;
let areasData = null;
let defaultControl = null;
let trajData = null;
let trajSummary = null;

async function loadInfraData() {

    await fetch(baseURL + "infra/walls" + "/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(walls => {
        wallsData = walls;
    }).catch(err => {
        console.log(err)
    });

    await fetch(baseURL + "infra/zones" + "/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(zones => {
        zonesData = zones;
    }).catch(err => {
        console.log(err)
    });

    await fetch(baseURL + "infra/gates" + "/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(gates => {
        gatesData = gates;
    }).catch(err => {
        console.log(err)
    });

    await fetch(baseURL + "infra/monitoredareas" + "/" + "lausannenew").then(response => {
        return response.json();
    }).then(monitoredareas => {
        defaultControl = monitoredareas;
    }).catch(err => {
        console.log(err)
    });
    /*
    await fetch(baseURL + "areas" + "/" + selectedInfra.name).then(response => {
        return response.json();
    }).then(areas => {
        areasData = areas;
    }).catch(err => {
        console.log(err)
    });
     */

}

async function loadTrajData() {

    const urlTraj = "http://transporsrv2.epfl.ch/api/trajectoriesbytime/"+selectedInfra.name+"/"+selectedTraj.name;

    await fetch(urlTraj).then(response => {
        return response.json();
    }).then(data => {
        trajData = data;
    }).catch(err => {
        console.log(err)
    });

    const urlSummary = "http://transporsrv2.epfl.ch/api/summary/"+selectedInfra.name+"/"+selectedTraj.name;

    await fetch(urlSummary).then(response => {
        return response.json();
    }).then(data => {
        trajSummary = data;
    }).catch(err => {
        console.log(err)
    });
}