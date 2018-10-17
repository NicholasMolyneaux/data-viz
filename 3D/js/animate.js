function loadPedestrians() {

    fetch(dataFolder + "small/pedestrians_clean.json")
        .then(response => response.json())
        .then(json => {
                json.forEach((item, index) => {
                    setTimeout(() => {
                        animatePedestrians(item)
                    }, INTERVAL * index);
                })
            }
        )
}

function animatePedestrians(json) {

    // Update the time
    document.getElementById("timer").innerHTML = json.time.toFixed(2) + " [s.]";

    var listIds = [];

    // Go through data
    json.data.forEach(ped => {

        listIds.push(ped.id);

        // Check if its ID is in the dct of ped
        if (dctPed.hasOwnProperty(ped.id)){
            // Update the position of this pedestrian
            updatePosition(ped);
        } else {
            // Create a pedestrian
            createPedestrian(ped);
        }

    });

    deletePedestrian(listIds);

    //console.log(json.data);

}

function deletePedestrian(listIds) {

    // Find which pedestrian is not in the dctPed anymore
    var knownIds = new Set(Object.keys(dctPed));
    var theseIds = new Set(listIds);

    var diff = new Set([...knownIds].filter(x => !theseIds.has(x)));

    // Delete all the lost pedestrians
    diff.forEach(pedId => {
        var ped = dctPed[pedId];
        scene.remove(ped);
        delete dctPed[pedId];
    })
}

function createPedestrian(ped) {

    console.log("Create Pedestrian with ID " + ped.id);
    dctPed[ped.id] = new Object();


    loader.load( modelsFolder + 'minecraft-char.glb', gltf => {

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject( gltf.scene );
        var size = box.getSize();

        // Define the ration and scale the minecraft steve
        var ratio = peopleHeight/size.y;
        gltf.scene.scale.set(ratio, ratio, ratio);

        // Set the position
        gltf.scene.position.set(ped.x-avg[0],0,ped.y-avg[1]);

        gltf.scene.matrixWorldNeedsUpdate = true;
        gltf.scene.updateMatrixWorld();

        // Add the pedestrian to dct
        dctPed[ped.id] = gltf.scene;

        // Add the object to the scene
        scene.add( gltf.scene );


    }, undefined, function ( e ) {
        console.error( e );
    } );

}

function updatePosition(ped) {
    if (dctPed[ped.id].hasOwnProperty("position")) {

        var oldX = dctPed[ped.id].position['x'];
        var oldY = dctPed[ped.id].position['z'];

        var newX = ped.x-avg[0];
        var newY = ped.y-avg[1];

        var direction = [newX-oldX, newY-oldY];

        var norm = Math.sqrt(Math.pow(direction[0],2) + Math.pow(direction[1],2));

        direction[0] /= norm;
        direction[1] /= norm;

        var angle = 0;

        if (direction[0] > 0) {
            angle = Math.atan(direction[1]/direction[0]) - Math.PI/2;
        } else {
            angle = Math.atan(direction[1]/direction[0]) + Math.PI/2;
        }

        dctPed[ped.id].position.set(newX, 0, newY);
        if (norm > 0) {
            dctPed[ped.id].rotation.set(0, -angle, 0);
        }
    }
}