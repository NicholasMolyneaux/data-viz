/*********************************************************/
/*                                                       */
/*   Functions for the animation of the 3D viz           */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Run the 3D animation, i.e. prepare everything to update the position of the pedestrians
 */
function runAnimation3D() {

    // Get the time bounds
    const timeBounds = [minTime, maxTime];

    // Prepare some stuff
    let trajDataFiltered = null;
    let interval = null;

    // Check if we have to use the interpolated data, i.e. if the speed factor is smaller or equal to 2
    if (SPEEDFACTOR <= 2) {
        // Filter the interpolated data by the time bounds
        trajDataFiltered = interpolatedTrajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
        // Set the time interval between the updates
        interval = INTERVAL3D;
    } else {
        // Filter the data by the time bounds
        trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
        // Set the time interval between the updates
        interval = INTERVAL2D;
    }

    // Internal function that check when to restart the index for the update of the position
    // and updates the positions =)
    function walkData() {
        if (currentTimeShownIdx >= trajDataFiltered.length) {
            currentTimeShownIdx = 0;
            //clearInterval(pedMover);
        }
        // Move the position of the pedestrians
        // Defined below
        animatePedestrians(trajDataFiltered[currentTimeShownIdx].data);
        // Update the timer
        // Defined in js/main/viz.js
        updateTimer(trajDataFiltered[currentTimeShownIdx].time);
        currentTimeShownIdx += 1;
    }

    // Set an interval divided by the speed
    pedMover = setInterval(walkData, interval/SPEEDFACTOR);
    // Video is not paused, stupid!
    vizPaused = false;
}

/**
 * Run one step of the 3D animation
 *
 * Basically, move the pedestrians where they are supposed to be at the current time
 */
function runOneStep3D() {

    // Get the time bounds
    const timeBounds = [minTime, maxTime];

    // Prepare some stuff
    let trajDataFiltered = null;

// Check if we have to use the interpolated data, i.e. if the speed factor is smaller or equal to 2
    if (SPEEDFACTOR <= 2) {
        // Filter the interpolated data by the time bounds
        trajDataFiltered = interpolatedTrajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
    } else {
        // Filter the data by the time bounds
        trajDataFiltered = trajData.filter(v => v.time > timeBounds[0] && v.time <= timeBounds[1]);
    }

    // If we have a trajectory selected
    if (selectedTraj != null) {
        // Move the position of the pedestrians
        // Defined below
        animatePedestrians(trajDataFiltered[currentTimeShownIdx].data);
        // Update the timer
        // Defined in js/main/viz.js
        updateTimer(trajDataFiltered[currentTimeShownIdx].time);
    }
}

/**
 * Animate the pedestrian, i.e. check if they're still here and update them if it's the case
 *
 * @param: json - array of json object corresponding to the trajectories of all the pedestrians at a given time
 */
function animatePedestrians(json) {

    var listIds = [];

    // Go through pedestrians
    json.forEach(ped => {

        // Add the id of the ped to the list of ped that we have seens
        listIds.push(ped.id);

        // Check if its ID is in the dct of ped
        if (dctPed.hasOwnProperty(ped.id)){
            // Update the position of this pedestrian
            updatePosition3D(ped);
        } else {
            // Create a pedestrian
            if (STYLE == "normal") {
                createPedestrian(ped);
            } else if (STYLE == "TWD") {
                createZombie(ped);
            }
        }

    });

    // We delete the pedestrians that we haven't seen in this time step
    deletePedestrian(listIds);
}

/**
 * Update the position of the pedestrians in 3D, i.e. Move it to its new position and update its direction
 *
 * @param: ped - JSON object (used to get the ID of the pedestrian)
 */
function updatePosition3D(ped) {

    // We just make sure that the pedestrian has a position in its dict
    if (dctPed[ped.id].hasOwnProperty("position")) {

        // Get the previous position
        var oldX = dctPed[ped.id].position['x'];
        var oldY = dctPed[ped.id].position['z'];

        // We just recenter its new position
        var newX = ped.x-avg[0];
        var newY = ped.y-avg[1];

        // Compute the direction
        var direction = [newX-oldX, newY-oldY];

        // The norm
        var norm = Math.sqrt(Math.pow(direction[0],2) + Math.pow(direction[1],2));

        // And normalize the direction
        direction[0] /= norm;
        direction[1] /= norm;

        // Compute the new angle for the new direction
        var angle = 0;

        if (direction[0] > 0) {
            angle = Math.atan(direction[1]/direction[0]) - Math.PI/2;
        } else {
            angle = Math.atan(direction[1]/direction[0]) + Math.PI/2;
        }

        // Small correction with the zombies due to the direction of the 3D model
        if (STYLE == "TWD") {
            angle = angle - Math.PI/2;
        }

        // Set the new position for the THREE Mesh
        dctPed[ped.id].position.set(newX, dctPed[ped.id].position['y'], newY);

        // Set the new rotation for the THREE Mesh
        if (norm > 0) {
            dctPed[ped.id].rotation.set(0, -angle, 0);
        }
    }
}

/**
 * Delete some pedestrians, if needed, i.e. if they're not seen anymore
 *
 * @param: listIds - list of pedestrians ids that we have seen
 */
function deletePedestrian(listIds) {

    // Find which pedestrian is not in the dctPed anymore
    var knownIds = new Set(Object.keys(dctPed));
    var theseIds = new Set(listIds);

    // Simply make the difference between the knownIds and theseIds
    var diff = new Set([...knownIds].filter(x => !theseIds.has(x)));

    // Delete all the lost pedestrians
    diff.forEach(pedId => {
        // Just in case, the current pedestrian was selected (and being followed, we need to stop this.
        if (!(Object.keys(SELECTED).length === 0 && SELECTED.constructor === Object)) {
            if (SELECTED.parent.parent.uuid === dctPed[pedId].uuid) {

                // Reset camera and controls to original position
                // Defined in visualization/3D/js/functionalities.js
                moveCameraToDesiredPosition(cameraInitPos);

                // Stop following the pedestrian
                // Defined in visualization/3D/js/functionalities.js
                stopFollowingPed();
            }
        }

        // Delete the pedestrian object and remove it from the scene
        var ped = dctPed[pedId];
        scene.remove(ped);
        delete dctPed[pedId];
    })
}

/**
 * Create a normal pedestrian
 *
 * @param: ped - Object with id and position
 */
function createPedestrian(ped) {

    // DEBUG
    //console.log("Create Pedestrian with ID " + ped.id);

    // Add the ped to the dict of ped.
    dctPed[ped.id] = new Object();

    // Load the blender model
    loader.load( modelsFolder + 'pedestrian.glb', gltf => {

        let object = gltf.scene;

        // Just cast the shadows. Nothing useful
        object.traverse(function (child) {
            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject(object);
        var size = box.getSize();

        // Define the ration and scale the pedestrian
        var ratio = peopleHeight / size.y;
        object.scale.set(ratio, ratio, ratio);

        // Animation of the object
        object.mixer = new THREE.AnimationMixer( object );

        // Push the animation to the mixer and play it.
        mixers.push( object.mixer );
        var action = object.mixer.clipAction( gltf.animations[0]);
        action.play();

        // Add a clock to update the animation of the pedestrian
        clocks.push(new THREE.Clock());

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

/**
 * Create a zombie
 *
 * They are pretty scary!
 *
 * @param: ped - Object with id and position
 */
function createZombie(ped) {

    // DEBUG
    //console.log("Create Zombie with ID " + ped.id);

    // Add the ped to the dict of ped.
    dctPed[ped.id] = new Object();

    // The zombies can be either male or female (sorry, non-binary people)
    // For each gender, we have 3 different meshes,
    // For these 2*3 = 6 zombies, we have 10 different meshes
    // And for these 2*3*10 = 60 different zombies, we have 3 different animations (walk, lunatic walk, and crawl)
    // Thus, a total of 180 different models.

    // 50% chance of being male/female
    let gender = 'male';

    if (Math.random() > 0.5) {
        gender = 'female';
    }

    // Equal chances to have one of the three different mesh
    const nbr = Math.floor(Math.random() * 3) + 1;

    // Equal chances to have on of the 10 textures
    const texture = Math.floor(Math.random() * 10) + 1;

    // Animation
    // 20% to be crawling
    // 40% to be walking
    // 40% to be lunatic walking
    const proba = Math.random();

    let anim = "lunwalk";

    if (proba < 0.2) {
        anim = "crawl";
    } else if (proba < 0.6) {
        anim = "walk";
    }

    // Loading the zombie blender model we want
    loader.load(modelsFolder + '3DRT/zombie_' + gender + nbr + '_text' + texture + '_' + anim + '.glb', function (gltf) {

        let object = gltf.scene;

        // Just cast the shadows. Nothing useful
        object.traverse(function (child) {
            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject(object);
        var size = box.getSize();

        // Define the ration and scale the minecraft steve
        var ratio = peopleHeight / size.y;
        object.scale.set(ratio, ratio, ratio);

        // Animation of the object
        object.mixer = new THREE.AnimationMixer( object );

        // Push the animation to the mixer and play it.
        mixers.push( object.mixer );
        var action = object.mixer.clipAction( gltf.animations[0]);
        action.play();

        // Add a clock to update the animation of the pedestrian
        clocks.push(new THREE.Clock());

        // Set the position
        // (if they're crawling, we need to put them a little bit higher, otherwise, they go through the floor)
        if (anim == "crawl") {
            gltf.scene.position.set(ped.x-avg[0],0.1,ped.y-avg[1]);

        } else {
            gltf.scene.position.set(ped.x-avg[0],0,ped.y-avg[1]);
        }

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