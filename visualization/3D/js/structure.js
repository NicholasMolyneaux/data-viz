/*********************************************************/
/*                                                       */
/*   Functions to build the structure of the station     */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Build the whole station based on the data of the walls
 */
function buildWalls(jsonWalls) {

    // Go through each wall
    jsonWalls.forEach(function(w) {

        // Get its length
        var length = Math.max(Math.abs(parseFloat(w.x1)-parseFloat(w.x2)), Math.abs(parseFloat(w.y1)-parseFloat(w.y2)));

        // Direction
        var vector = [parseFloat(w.x2)-parseFloat(w.x1), parseFloat(w.y2)-parseFloat(w.y1)];

        // Normalize the vector
        var norm = Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
        vector[0] /= norm;
        vector[1] /= norm;

        // Guess (?!?) the correct angle
        var angle = 0;

        if (vector[0] > 0) {
            angle = Math.atan(vector[1]/vector[0]) - Math.PI;
        } else {
            angle = Math.atan(vector[1]/vector[0]);
        }

         // Create a Geometry object
        var geometry = new THREE.BoxGeometry(length+wallDepth, wallHeight, wallDepth);

        // Load the texture
        var texture = THREE.ImageUtils.loadTexture(assetsFolder + 'TexturesCom_MarbleTiles0167_5_seamless_S.jpg');

        // Repeat texture along all directions
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1,1);

        // Create the material
        var material = new THREE.MeshLambertMaterial({ map : texture });

        // You have a new cube, which is a wall actually
        var cube = new THREE.Mesh( geometry, material );

        // Rotate the cube, I mean the wall
        cube.rotateY(angle);

        // Now, you can position it (Just like a cooking recipe)
        cube.position.x = (parseFloat(w.x2)+parseFloat(w.x1))/2;
        cube.position.z = (parseFloat(w.y2)+parseFloat(w.y1))/2;
        cube.position.y = wallHeight/2;
        // Add more information to the object
        cube.length = length;
        cube.angle = angle;

        // Push the wall to a global variable (to delete it later)
        walls.push(cube);

        // Update the avg position to recenter it later =) (I'm lazy I know)
        avg[0] += cube.position.x;
        avg[1] += cube.position.z;

    });

    // Get the ordered list of corners for the floor and ceiling
    // Defined below
    const corners = buildOuterShell(jsonWalls.filter(w => w.wtype === "0"));

    // Get the avg position
    avg[0] = avg[0]/walls.length;
    avg[1] = avg[1]/walls.length;

    // Replace the walls
    walls.forEach(c => {

        c.position.x -= avg[0];
        c.position.z -= avg[1];

        // DEBUG
        //var worldAxis = new THREE.AxesHelper(1);
        //c.add(worldAxis);

        // Add the walls to the scene
        scene.add(c);

    });

    // Add the first corner at the end (to finish the shape
    corners.push(corners[0]);

    // Update the corners position (recenter them)
    var centered_corners = [];

    corners.forEach(c => {
        centered_corners.push([c[0]-avg[0], c[1]-avg[1]])
    });

    // Do some weird stuff
    centered_corners = Array.from(new Set(centered_corners.map(JSON.stringify)), JSON.parse);

    // Re add the first centered corner (seems a bit weird, no?)
    centered_corners.push(centered_corners[0]);

    // Now, we can build the floor and the ceiling
    // Defined below
    buildFloorAndCeiling(centered_corners);

}

/**
 * Get the ordered list of walls to build the planes for the floor and celling
 *
 * Tricky part is to find the next wall that is next to our current wall at the current corner.
 *
 * @param jsonWalls: array of object with the coordinates of the walls
 */
function buildOuterShell(jsonWalls) {

    // Recursive function
    function buildOuterShellRec(currWall, corners) {

        if (jsonWalls.length == 0) {

            return corners;
        } else {

            // Find the next wall with same corner
            let inverted = false;
            var found = jsonWalls.find(elem => {
                if (elem.x1 === corners[corners.length - 1][0] && elem.y1 === corners[corners.length - 1][1]) {
                    return elem;
                } else if (elem.x2 === corners[corners.length - 1][0] && elem.y2 === corners[corners.length - 1][1]) {
                    inverted = true;
                    return elem;

                }
            });

            // Get the index
            var index = jsonWalls.indexOf(found);
            jsonWalls.splice(index, 1);

            // Check if it's inverted
            if (!inverted) {
                corners.push([found.x2, found.y2])
            } else {
                corners.push([found.x1, found.y1])
            }

            // Continue the recursion
            return buildOuterShellRec(found, corners);
        }
    }

    jsonWalls.splice(0,1);

    // Run the recursion and return the ordered list
    return buildOuterShellRec(jsonWalls[0], [[jsonWalls[0].x1, jsonWalls[0].y1]]);
}

/**
 * Build the floor and the ceiling based on the corners of the shape
 */
function buildFloorAndCeiling(centered_corners) {

    // Create new shape
    var floor = new THREE.Shape();

    var first = true;

    // Use the centered corners to draws lines in the sahpe
    centered_corners.reverse().forEach(function(c) {

        if (first) {

            floor.moveTo(c[0], c[1]);

            first = false;
        }

        floor.lineTo(c[0], c[1]);

    });

    // Actually build the floor and ceiling
    // Defined below
    addShapes( floor, 0, 0, 0, 0, 0, 0, 1 );
}

/**
 * Actually build the floor and the ceiling based on a shape, this time. =P
 */
function addShapes( shape, x, y, z, rx, ry, rz, s ) {
    // Floor top //

    // Load the texture
    var texture = THREE.ImageUtils.loadTexture(assetsFolder + 'floor_checkerboard.jpg');

    // Repeat along all directions
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1,1);

    // Create the material
    var material = new THREE.MeshPhongMaterial({ map : texture });

    // Create the geometry
    var geometry = new THREE.ShapeBufferGeometry( shape );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    // Create the Mesh
    topFloor = new THREE.Mesh( geometry, material );

    // Position, Rotate, and Scale
    topFloor.position.set( x, y, z );
    topFloor.rotation.set( rx-Math.PI/2, ry, rz );
    topFloor.scale.set( s, -s, s );
    scene.add( topFloor );

    // Floor bottom //

    // Simple black material
    var geometry = new THREE.ShapeBufferGeometry( shape );
    var material = new THREE.MeshBasicMaterial( { color: 0x0000, overdraw: 0.5 } );
    bottomFloor = new THREE.Mesh( geometry, material );
    bottomFloor.position.set( x, y, z );
    bottomFloor.rotation.set( rx+Math.PI/2, ry, rz );
    bottomFloor.scale.set( s, s, s );
    scene.add( bottomFloor );

    // Ceiling //

    // Load the texture
    var texture = THREE.ImageUtils.loadTexture(assetsFolder + 'TexturesCom_MetalPlatesPainted0075_1_seamless_S.jpg');

    // Repeat along all directions
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1,1);

    // Create the material
    var material = new THREE.MeshLambertMaterial({ map : texture });

    // Create the geometry
    var geometry = new THREE.ShapeBufferGeometry( shape );

    // Create the Mesh
    ceiling = new THREE.Mesh( geometry, material );

    // Position, Rotate, and Scale
    ceiling.position.set( x, y+wallHeight, z );
    ceiling.rotation.set( rx+Math.PI/2, ry, rz );
    ceiling.scale.set( s, s, s );
    scene.add( ceiling );

}

/**
 * Add the flickering lights for the TWD style
 *
 * @param: scene - The 3D scene in which we'll had the lights
 * @param: zones - Positions of the zones. Lights are placed in the middle of these zones
 */
function addTWDLights(scene, zones) {

    // GO through each zone
    zones.forEach(json => {

        // Get the average position of the 4 corners of the zone, i.e. the middle
        let xPos = 0;
        let yPos = 0;

        for (let i=1; i<=4; i++) {
            xPos = xPos + parseFloat(json['x'+i]);
            yPos = yPos + parseFloat(json['y'+i]);
        }

        xPos = xPos/4 - avg[0];
        yPos = yPos/4 - avg[1];

        // Color of the light (yellowish)
        let color = 0xEDEEFF;

        // With 10% probability, the color will be red.
        if(Math.random() > 0.9) {
            color = 0x671B1F;
        }

        // Add a PointLight
        let light = new THREE.PointLight( color, Math.random(), 10 );
        light.position.set( xPos, wallHeight, yPos);
        scene.add( light );

        // Just add some info =)
        const obj = {'on': true, 'light': light};
        lights.push(obj);
    });

}