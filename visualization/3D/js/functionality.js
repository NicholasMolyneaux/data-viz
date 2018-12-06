function hideWalls() {
    if (wallsHidden) {
        console.log("Walls shown!");

        walls.forEach(w => {
            w.scale.y = 1;
            w.position.y = wallHeight/2;
        });

        ceiling.visible = true;

        wallsHidden = false;
    } else {
        console.log("Walls hidden!");

        walls.forEach(w => {
            w.scale.y = 0.01;
            w.position.y = 0.01;
        });

        ceiling.visible = false;

        wallsHidden = true;
    }

}

function onDocumentMouseMove( event ) {
    event.stopPropagation();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseDown( event ) {

    if (viz3D) {

        event.stopPropagation();
        event.preventDefault();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( scene.children, true );

        var intersects_glft = new Array();

        // Select only skinned mesh. (To see if it works later on)
        intersects.forEach(i => {
            if (i.object.type == 'SkinnedMesh') {
                intersects_glft.push(i);
            }
        });

        if ( intersects_glft.length > 0 ) {
            console.log(intersects_glft);
            SELECTED = intersects_glft[ 0 ].object;

            followPedestrian();

        }
    }
}

function followPedestrian() {
    if (!(Object.keys(SELECTED).length === 0 && SELECTED.constructor === Object)) {
        // Move camera to position of the pedestrian.
        let pos = SELECTED.getWorldPosition();
        let rot = SELECTED.getWorldQuaternion();

        camera.position.set(pos.x, 0.9*peopleHeight, pos.z);
        camera.quaternion.copy( rot );

        if (STYLE == "normal") {
            camera.rotateY(Math.PI);
        } else if(STYLE == "TWD") {
            camera.rotateY(Math.PI/2);
        }
        camera.aspect = 1;

        controls.enabled = false;

        //controls.target.set( 0,-1,0 );
        //controls.update();

        console.log(SELECTED);
    }
}

function onKeyPress( event ) {

    event.preventDefault();

    if (event.code === "Space") {

        // Reset camera and controls
        camera.position.set( -42.39557080736188, 67.12576960977573, 69.11641657512034)

        resizeViz();

        controls.target.set( 0,0,0 );
        controls.enabled = true;
        controls.update();
        controls.reset();

        SELECTED = new Object();

    }
}