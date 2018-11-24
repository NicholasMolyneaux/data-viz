// Load the Minecraft Steve
function loadMinecraft() {

    console.log("DEBUG FUNCTION!")

    var loader = new THREE.GLTFLoader();
    loader.load( modelsFolder + 'minecraft-char.glb', gltf => {

        console.log(gltf);

        // Set the position
        gltf.scene.position.set(0,0,0);

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject( gltf.scene );
        var size = box.getSize();

        // Define the ration and scale the minecraft steve
        var ratio = peopleHeight/size.y;
        gltf.scene.scale.set(ratio, ratio, ratio);

        // Add the object to the scene
        scene.add( gltf.scene );
    }, undefined, function ( e ) {
        console.error( e );
    } );

}

function loadZombie() {

    console.log("DEBUG FUNCTION!");

    let nbr = 30;

    for ( var i = 0; i < nbr; i ++ ) {
        var loader = new THREE.GLTFLoader();

        let text = i%10+1;
        let val = i;

        loader.load(modelsFolder + '3DRT/zombie_male3_text' + text + '_walk.glb', function (gltf) {

            let object = gltf.scene;

            object.traverse(function (child) {
                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            object.position.set(val, 0, 0);

            // Bounding box to get the size of the object
            var box = new THREE.Box3().setFromObject(object);
            var size = box.getSize();

            // Define the ration and scale the minecraft steve
            var ratio = peopleHeight / size.y;
            console.log("ratio = " + ratio);
            object.scale.set(ratio, ratio, ratio);

            // Animation of the object
            object.mixer = new THREE.AnimationMixer( object );

            mixers.push( object.mixer );
            var action = object.mixer.clipAction( gltf.animations[0]);
            action.play();

            scene.add(object);

            clocks.push(new THREE.Clock());

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

    for ( var i = 0; i < nbr; i ++ ) {
        var loader = new THREE.GLTFLoader();

        let text = i%10+1;
        let val = i;

        loader.load(modelsFolder + '3DRT/zombie_male1_text' + text + '_crawl.glb', function (gltf) {

            let object = gltf.scene;

            object.traverse(function (child) {
                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            object.position.set(val, 0, 1.5);

            // Bounding box to get the size of the object
            var box = new THREE.Box3().setFromObject(object);
            var size = box.getSize();

            // Define the ration and scale the minecraft steve
            var ratio = peopleHeight / size.y;
            console.log("ratio = " + ratio);
            object.scale.set(ratio, ratio, ratio);

            // Animation of the object
            object.mixer = new THREE.AnimationMixer( object );

            mixers.push( object.mixer );
            var action = object.mixer.clipAction( gltf.animations[0]);
            action.play();

            scene.add(object);

            clocks.push(new THREE.Clock());

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

    for ( var i = 0; i < nbr; i ++ ) {
        var loader = new THREE.GLTFLoader();

        let text = i%10+1;
        let val = i;

        loader.load(modelsFolder + '3DRT/zombie_male2_text' + text + '_lunwalk.glb', function (gltf) {

            let object = gltf.scene;

            object.traverse(function (child) {
                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            object.position.set(val, 0, 3);

            // Bounding box to get the size of the object
            var box = new THREE.Box3().setFromObject(object);
            var size = box.getSize();

            // Define the ration and scale the minecraft steve
            var ratio = peopleHeight / size.y;
            console.log("ratio = " + ratio);
            object.scale.set(ratio, ratio, ratio);

            // Animation of the object
            object.mixer = new THREE.AnimationMixer( object );

            mixers.push( object.mixer );
            var action = object.mixer.clipAction( gltf.animations[0]);
            action.play();

            scene.add(object);

            clocks.push(new THREE.Clock());

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

}


function loadZombie3() {

    console.log("DEBUG FUNCTION!")


    var loader = new THREE.FBXLoader();

    loader.load(modelsFolder + '3DRT/female_zomb_v1_UNITY.FBX', function (object) {


        /*const colors = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/BaseColor.png' );
        const ao = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/AO.png' );
        const normal = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/Normal.png' );
        const roughness = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/Roughness.png' );*/

        console.log(object.animations);

        object.position.set(0, 0, 0);

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
        console.log("ratio = " + ratio);
        object.scale.set(ratio, ratio, ratio);

        /*
        // Animation of the object
        object.mixer = new THREE.AnimationMixer( object );
        const clips = anim.animations;

        mixers.push( object.mixer );
        var action = object.mixer.clipAction( clips[0] );
        action.play();*/

        scene.add(object);
    });

    console.log("ASD");
}

function loadZombie2() {

    console.log("DEBUG FUNCTION!")


    var loaderModel = new THREE.FBXLoader();
    var loaderAnim = new THREE.FBXLoader();

    loaderAnim.load(modelsFolder + 'ZombieSlaughter/Animation/Zombie Guy Animations/Zombie Guy@Walk.FBX', function (anim) {
        loaderModel.load( modelsFolder + 'ZombieSlaughter/Zombie+Guy+1+Mesh.FBX', function ( object ) {

            const name = "Zombie Guy 1A";

            const colors = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/BaseColor.png' );
            const ao = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/AO.png' );
            const normal = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/Normal.png' );
            const roughness = new THREE.TextureLoader().load( modelsFolder + 'ZombieSlaughter/Textures/' + name + '/Roughness.png' );


            object.position.set(0,0,0.1);

            object.traverse( function ( child ) {
                if ( child.isMesh ) {

                    var geometry = child.geometry;
                    geometry.addAttribute( 'uv2', new THREE.BufferAttribute( geometry.attributes.uv.array, 2 ) );

                    child.material.map = colors;
                    child.material.normalMap = normal;
                    child.material.specularMap = roughness;
                    child.material.aoMap = ao;

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );

            // Bounding box to get the size of the object
            var box = new THREE.Box3().setFromObject( object );
            var size = box.getSize();

            // Define the ration and scale the minecraft steve
            var ratio = peopleHeight/size.y;
            console.log("ratio = " + ratio);
            object.scale.set(ratio, ratio, ratio);

            // Animation of the object
            object.mixer = new THREE.AnimationMixer( object );
            const clips = anim.animations;

            mixers.push( object.mixer );
            var action = object.mixer.clipAction( clips[0] );
            action.play();

            scene.add( object );
        } );
    });

    /*
    let name = 'female_zomb_v1';

    loaderModel.load( modelsFolder + '3DRT/' + name +'.FBX', function ( object ) {


        object.traverse( function ( child ) {
            if ( child.isMesh ) {

                var geometry = child.geometry;
                geometry.addAttribute( 'uv2', new THREE.BufferAttribute( geometry.attributes.uv.array, 2 ) );

                const colors = new THREE.TextureLoader().load( modelsFolder + '3DRT/Torque-files/' + name + '/zomb-f_01.jpg.png' );


                //child.material.map = colors;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );

        // Bounding box to get the size of the object
        var box = new THREE.Box3().setFromObject( object );
        var size = box.getSize();

        // Define the ration and scale the minecraft steve
        var ratio = peopleHeight/size.y;
        console.log("ration = " + ratio);
        object.scale.set(ratio, ratio, ratio);

        scene.add( object );
    } );
    */




    }