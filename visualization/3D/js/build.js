function buildOuterShell(jsonWalls) {

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

            //console.log(found);

            var index = jsonWalls.indexOf(found);
            jsonWalls.splice(index, 1);

            if (!inverted) {
                corners.push([found.x2, found.y2])
            } else {
                corners.push([found.x1, found.y1])
            }

            return buildOuterShellRec(found, corners);
        }
    }

    jsonWalls.splice(0,1);

    return buildOuterShellRec(jsonWalls[0], [[jsonWalls[0].x1, jsonWalls[0].y1]]);
}

function buildFloorAndCeiling(centered_corners) {

    var floor = new THREE.Shape();

    var first = true;

    centered_corners.reverse().forEach(function(c) {

        if (first) {

            floor.moveTo(c[0], c[1]);

            first = false;
        }

        floor.lineTo(c[0], c[1]);

    });
    addShapes( floor, 0, 0, 0, 0, 0, 0, 1 );

}

function addShapes( shape, x, y, z, rx, ry, rz, s ) {
    // Floor top

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

    // Floor bottom

    // Simple black material
    var geometry = new THREE.ShapeBufferGeometry( shape );
    var material = new THREE.MeshBasicMaterial( { color: 0x0000, overdraw: 0.5 } );
    bottomFloor = new THREE.Mesh( geometry, material );
    bottomFloor.position.set( x, y, z );
    bottomFloor.rotation.set( rx+Math.PI/2, ry, rz );
    bottomFloor.scale.set( s, s, s );
    scene.add( bottomFloor );

    // Ceiling

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

function buildWalls(jsonWalls) {

    jsonWalls.forEach(function(w) {

        var length = Math.max(Math.abs(parseFloat(w.x1)-parseFloat(w.x2)), Math.abs(parseFloat(w.y1)-parseFloat(w.y2)));

        var vector = [parseFloat(w.x2)-parseFloat(w.x1), parseFloat(w.y2)-parseFloat(w.y1)];

        var norm = Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
        vector[0] /= norm;
        vector[1] /= norm;

        var angle = 0;

        if (vector[0] > 0) {
            angle = Math.atan(vector[1]/vector[0]) - Math.PI;
        } else {
            angle = Math.atan(vector[1]/vector[0]);
        }

        var geometry = new THREE.BoxGeometry(length+wallDepth, wallHeight, wallDepth);

        // Load the texture
        var texture = THREE.ImageUtils.loadTexture(assetsFolder + 'TexturesCom_MarbleTiles0167_5_seamless_S.jpg');

        // Repeat along all directions
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1,1);

        // Create the material
        var material = new THREE.MeshLambertMaterial({ map : texture });

        var cube = new THREE.Mesh( geometry, material );

        cube.rotateY(angle);

        cube.position.x = (parseFloat(w.x2)+parseFloat(w.x1))/2;
        cube.position.z = (parseFloat(w.y2)+parseFloat(w.y1))/2;
        cube.position.y = wallHeight/2;
        // Add more information to the object
        cube.length = length;
        cube.angle = angle;

        walls.push(cube);
        avg[0] += cube.position.x;
        avg[1] += cube.position.z;

    });



    // Add the corners for the floor and ceiling
    const corners = buildOuterShell(jsonWalls.filter(w => w.wtype === "0"));

    avg[0] = avg[0]/walls.length;
    avg[1] = avg[1]/walls.length;

    walls.forEach(c => {

        c.position.x -= avg[0];
        c.position.z -= avg[1];

        // DEBUG
        //var worldAxis = new THREE.AxesHelper(1);
        //c.add(worldAxis);

        scene.add(c);

    });

    corners.push(corners[0]);

    // Update the corners position
    var centered_corners = []

    corners.forEach(c => {
        centered_corners.push([c[0]-avg[0], c[1]-avg[1]])
    })

    centered_corners = Array.from(new Set(centered_corners.map(JSON.stringify)), JSON.parse);

    centered_corners.push(centered_corners[0]);

    buildFloorAndCeiling(centered_corners);

}

function addTWDLights(scene, zones) {

    zones.forEach(json => {
        let xPos = 0;
        let yPos = 0;

        for (let i=1; i<=4; i++) {
            xPos = xPos + parseFloat(json['x'+i]);
            yPos = yPos + parseFloat(json['y'+i]);
        }

        console.log(avg);

        xPos = xPos/4 - avg[0];
        yPos = yPos/4 - avg[1];

        console.log(xPos, yPos);

        let color = 0xEDEEFF;

        if(Math.random() > 0.9) {
            color = 0x671B1F;
        }

        let light = new THREE.PointLight( color, Math.random(), 10 );
        light.position.set( xPos, wallHeight, yPos);
        scene.add( light );

        const obj = {'on': true, 'light': light};
        lights.push(obj);
    });

}