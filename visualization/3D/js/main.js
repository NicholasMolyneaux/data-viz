// Various folders
const assetsFolder = "./visualization/3D/assets/";
const modelsFolder = "./visualization/3D/models/";

let container, stats, controls, raycaster;
let camera, scene, renderer, light;
const INTERVAL3D = INTERVAL2D/(INTERP+1);

// Some variables
const wallHeight = 2.5;
const wallDepth = 0.1;
const peopleHeight = 1.6;
let wallsHidden = false;
let avg = [0,0];
let STYLE = "TWD";

// Some 3D objects
let topFloor, bottomFloor, ceiling;
let walls = [];
let clocks = [];
let lights = [];

// Pedestrians
let dctPed = new Object();
let mixers = [];

let mouse = new THREE.Vector2(), INTERSECTED;
let SELECTED = new Object();

let loader = new THREE.GLTFLoader();

function animate() {

    if (viz3D) {
        requestAnimationFrame(animate);

        if (!paused) {
            if (mixers.length > 0) {
                for (var i = 0; i < mixers.length; i++) {
                    mixers[i].update(SPEEDFACTOR*clocks[i].getDelta());
                }
            }

            for (var i = 0; i < lights.length; i++) {
                const proba = Math.random();

                if (proba > 0.995) {
                    // Change the state of the light

                    if (lights[i]['on'] & Math.random() > 0.8) {
                        lights[i].light.intensity = 0.1;
                        lights[i]['on'] = false;
                    } else {
                        lights[i].light.intensity = Math.random();
                        lights[i]['on'] = true;
                    }
                }
            }
        }

        render();

        // DEBUG!
        // stats.update();
    }
}

function render() {

    // find intersections
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true );

    var intersects_glft = new Array();

    // Select only skinned mesh. (To see if it works later on)
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
            console.log(INTERSECTED);
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }

    followPedestrian();

    renderer.render( scene, camera );
}