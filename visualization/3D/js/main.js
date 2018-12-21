/*********************************************************/
/*                                                       */
/*   File with the main functions for the 3D viz         */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

///////////////////////////////////////////////////////////
//                                                       //
//                   Global variables                    //
//                                                       //
///////////////////////////////////////////////////////////

// Various folders
const assetsFolder = "./visualization/3D/assets/";
const modelsFolder = "./visualization/3D/models/";

// Some stuff used in the 3D viz
let container, stats, controls, raycaster;
let camera, scene, renderer, light;

// The interval between two position update for the 3D and interpolated data
const INTERVAL3D = INTERVAL2D/(INTERP+1);

// Some variables
const wallHeight = 2.5;
const wallDepth = 0.1;
const peopleHeight = 1.6;
let wallsHidden = false;
let avg = [0,0];
let STYLE = "normal";

// Some 3D objects
let topFloor, bottomFloor, ceiling;
let walls = [];
let clocks = [];
let lights = [];

// Pedestrians
let dctPed = new Object();
let mixers = [];

// Mouse
let mouse = new THREE.Vector2(), INTERSECTED;

// Selected object
let SELECTED = new Object();

// GLTF loader
let loader = new THREE.GLTFLoader();

// Initial position of the camera
const cameraInitPos = [-42.39557080736188, 67.12576960977573, 69.11641657512034];

// Position of the camera for the presentation
let cameraPresPos = [-25.33655459403886, 1.5434268102127795, -1.348041733828591];

// Position of the control for the presentation
let cameraPresControl = [0,0,0];

// Animation (used to cancel it)
var animation;

///////////////////////////////////////////////////////////
//                                                       //
//               Function for the 3D viz                 //
//                                                       //
///////////////////////////////////////////////////////////

/**
 * Prepare the 3D visualization
 */
function prepViz3D() {

    // Get the container where we'll put the canvas
    container = document.getElementById("viz");

    // Set Camera position
    camera = new THREE.PerspectiveCamera( 45, document.body.clientWidth / vizHeight, 0.1, 1000 );
    camera.position.set( cameraInitPos[0], cameraInitPos[1], cameraInitPos[2]);

    // Set the controls
    controls = new THREE.OrbitControls( camera, container );
    controls.target.set( 0,0,0 );
    controls.update();

    // New scene
    scene = new THREE.Scene();
    camera.lookAt(scene.position);

    // If walls are not built, build them!
    buildWalls(wallsData);

    // Add axes (DEBUG PURPOSE)
    //var worldAxis = new THREE.AxesHelper(20);
    //scene.add(worldAxis);

    // Light
    if (STYLE == "normal") {
        scene.background = new THREE.Color(0xf7f4ea);

        light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
        light.position.set( 0, wallHeight, 0 );
        light.castShadow = true;
        scene.add( light );

    } else if (STYLE == "TWD") {
        scene.background = new THREE.Color(0x00000);

        light = new THREE.HemisphereLight( 0xffffff, 0x444422, 0.02 );
        light.position.set( 0, wallHeight, 0 );
        light.castShadow = true;
        scene.add( light );

        // Add many flickering lights
        // Defined in visualization/3D/js/structure.js
        addTWDLights(scene, zonesData);
    }

    // Set the raycaster (for selecting pedestrians)
    raycaster = new THREE.Raycaster();

    // Prepare the rendered
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(document.body.clientWidth, vizHeight);
    renderer.gammaOutput = true;
    renderer.domElement.id = 'canvas';
    // Append it to the container
    container.appendChild( renderer.domElement );

    // stats (DEBUG)
    // stats = new Stats();
    // container.appendChild( stats.dom );

    // Resize the visualization
    // Defined in js/main/viz.js
    resizeViz();

    // Add the scene and the camera to the renderer
    renderer.render( scene, camera );

    // Now that the canvas has been added, we can get it
    const canvas = document.getElementById("canvas");

    // Add a mouseover event
    canvas.addEventListener("mouseover", () => {
        // We want to use the function linked to the 3D viz
        // All defined in visualization/3D/js/functionalities.js
        document.addEventListener('keypress', onKeyPress, false);
        document.addEventListener( 'mousemove', onDocumentMouseMove, false);
        document.addEventListener( 'mousedown', onDocumentMouseDown, false);

    });

    // Add a mouseout event
    canvas.addEventListener("mouseout",function() {
        // Remove all the event listener of the 3D viz
        document.removeEventListener("keypress", onKeyPress, false);
        document.removeEventListener( 'mousemove', onDocumentMouseMove, false);
        document.removeEventListener( 'mousedown', onDocumentMouseDown, false);
    });

    // Start the animation
    // Defined below
    animate();

}

/**
 * Do all the animations (pedestrian walking, flickering lights, camera)
 *
 * Do not change the position of the pedestrians.
 * Function for this is runAnimation3D() in visualization/3D/js/animation.js
 *
 * !!! This function is always running after the first 3D viz called !!!
 */
function animate() {

    // Request the animation and save it in a global variable to be able to stop it
    animation = requestAnimationFrame(animate);

    // If we are not in the 3D viz, we don't want to call this function
    if (viz3D) {

        // Update the controls automatically if the presentation is playing
        if (presentationPlaying) {
            controls.update();
        }

        // Update the TWEEN to have a smooth camera movement
        TWEEN.update();

        // If the viz is not paused, we can play the different animation
        if (!vizPaused) {

            // Here, we update the walking animations of the pedestrians
            if (mixers.length > 0) {
                for (var i = 0; i < mixers.length; i++) {
                    mixers[i].update(SPEEDFACTOR*clocks[i].getDelta());
                }
            }

            // Here, we update the flickering of the lights
            for (var i = 0; i < lights.length; i++) {
                const proba = Math.random();

                // If we have a number above a threshold, i.e. 0.5% chance of happening, we'll change something
                if (proba > 0.995) {
                    // If the lights is on, with 20% proba, we'll turn it off.
                    if (lights[i]['on'] & Math.random() > 0.8) {
                        lights[i].light.intensity = 0.1;
                        lights[i]['on'] = false;
                    } else {
                        // Otherwise, we change its probability
                        lights[i].light.intensity = Math.random();
                        lights[i]['on'] = true;
                    }
                }
            }
        }

        // Render the scene
        // Defined below
        render();

        // DEBUG!
        // stats.update();
    }
}

/**
 * Render the scene with the camera
 *
 * Mostly used to check if the user is hovering a pedestrian
 */
function render() {

    // Find the intersection between the mouse and the objects
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true );

    var intersects_glft = new Array();

    // This part of the code has been found on internet. No Reference, sorry.
    // It's used to be able to intersect the mouse with a mesh, i.e. a pedestrian
    intersects.forEach(i => {
        if (i.object.type == 'SkinnedMesh') {
            intersects_glft.push(i);
        }
    })

    if ( intersects_glft.length > 0 ) {
        if ( INTERSECTED != intersects_glft[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects_glft[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }

    // Follow a pedestrian if one has been selected
    // Defined in visualization/3D/js/functionalities.js
    followPedestrian();

    // Render the scene and the camera
    renderer.render( scene, camera );
}

/**
 * Move the camera to a desired position
 *
 * @param pos: Position where the camera is
 * @param: control: Optional since most of the time, we are at looking at target (0,0,0).
 * It can change if we use ctrl+Click
 */
function moveCameraToDesiredPosition(pos, control=[0,0,0]) {

    // From position + control (= current place)
    var from = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        cx: controls.target.x,
        cy: controls.target.y,
        cz: controls.target.z
    };

    // Where we want to go
    var to = {
        x: pos[0],
        y: pos[1],
        z: pos[2],
        cx: control[0],
        cy: control[1],
        cz: control[2]
    };

    // We use TWEEN to have a nice linear movement
    var tween = new TWEEN.Tween(from)
        .to(to, 20000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function () {

            // Update the camera, the control, and the camera target
            camera.position.set(this.x, this.y, this.z);
            controls.target.set(this.cx, this.cy, this.cz);
            camera.lookAt(new THREE.Vector3(this.cx, this.cy, this.cz));
        })
        .onComplete(function () {

            // Final update of the camera, the control, and the camera target
            camera.position.set(to.x, to.y, to.z);
            camera.lookAt(new THREE.Vector3(to.cx, to.cy, to.cz));
            controls.target.set(to.cx, to.cy, to.cz);
        })
        .start();
}

/**
 * Delete the 3D viz
 *
 * P.S.: Bye bye zombies!
 */
function deleteStuff3D() {

    // Remove the div
    $("#canvas").remove();

    // Delete and reset some stuff
    topFloor = null;
    bottomFloor = null;
    ceiling = null;
    walls = [];
    clocks = [];
    lights = [];

    // Function found on internet. No reference, sorry.
    // Used to clear the THREE objects
    function clearThree(obj){
        while(obj.children.length > 0){
            clearThree(obj.children[0])
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose()
        if(obj.material) obj.material.dispose()
        if(obj.texture) obj.texture.dispose()
    }

    // Clear the scene
    clearThree(scene);

    // Clear the pedestrians
    dctPed = new Object();
    mixers = [];

    // Rick Grimes, where you there?
}