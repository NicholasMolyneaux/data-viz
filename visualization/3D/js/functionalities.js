/*********************************************************/
/*                                                       */
/*   Different functionnalities for the 3D viz           */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Function when the mouse is moving on the canvas
 *
 * Simply update the position of the mouse, used to highligh the pedestrians
 *
 * @param: event - HTML event, you know it. =)
 */
function onDocumentMouseMove( event ) {

    // Stop propagation and prevent default
    event.stopPropagation();
    event.preventDefault();

    // Store the mouse position
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

/**
 * Function when the mouse is clicked
 *
 * Simply update the position of the mouse
 *
 * @param: event - HTML event, you know it. =)
 */
function onDocumentMouseDown( event ) {

    // Stop propagation and prevent default
    event.stopPropagation();
    event.preventDefault();

    // Store the mouse position
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // Check if the raycaster is intersecting an object
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true );

    var intersects_glft = new Array();

    // Select only skinned mesh.
    intersects.forEach(i => {
        if (i.object.type == 'SkinnedMesh') {
            intersects_glft.push(i);
        }
    });

    // if we have at least one intersected object
    if ( intersects_glft.length > 0 ) {

        // We select the first one (the closest)
        SELECTED = intersects_glft[ 0 ].object;

        // And we follow this pedestrian
        // Defined below
        followPedestrian();

    }
}

/**
 * Function when a key is pressed
 *
 * 3 different cases:
 *  - Space: Go back to original position
 *  - Space + Shift: Go to saved position
 *  - S: Save current camera position
 *
 * @param: event - HTML event, you know it. =)
 */
function onKeyPress(event) {

    event.preventDefault();

    if (event.code === "Space" && !event.shiftKey) {

        // Reset camera and controls
        moveCameraToDesiredPosition(cameraInitPos);

        stopFollowingPed();

    } else if (event.code === "Space" && event.shiftKey) {

        // Reset camera and controls & go to saved position
        moveCameraToDesiredPosition(cameraPresPos, cameraPresControl);

        stopFollowingPed();

    } else if (event.code === "KeyS") {

        // Save the position
        cameraPresPos = [camera.position['x'], camera.position['y'], camera.position['z']];
        cameraPresControl = [controls.target.x, controls.target.y, controls.target.z];

    } else {
        // Do nothing
        return false;
    }
}

/**
 * Follow a pedestrian with the camera
 */
function followPedestrian() {
    // If an mesh has been selected (using the raycaster)
    if (!(Object.keys(SELECTED).length === 0 && SELECTED.constructor === Object)) {
        // Move camera to position of the pedestrian.
        let pos = SELECTED.getWorldPosition();
        let rot = SELECTED.getWorldQuaternion();

        camera.position.set(pos.x, 0.9*peopleHeight, pos.z);
        camera.quaternion.copy( rot );

        // Just a little fix due to the rotation of the blender object.
        // I'm not that good with Blender =P
        if (STYLE == "normal") {
            camera.rotateY(Math.PI);
        } else if(STYLE == "TWD") {
            camera.rotateY(Math.PI/2);
        }

        // Change the camera aspect
        camera.aspect = 1;

        // Disable the controls of the camera
        controls.enabled = false;
    }
}

/**
 * Stop following a pedestrian
 */
function stopFollowingPed() {
    // If an mesh has been selected (using the raycaster)
    if (!(Object.keys(SELECTED).length === 0 && SELECTED.constructor === Object)) {

        // Defined in js/main/viz.js
        resizeViz();

        // Reenable the controls, update them and reset them
        controls.enabled = true;
        controls.update();
        controls.reset();

        // No object is selected anymore
        SELECTED = new Object();
    }
}