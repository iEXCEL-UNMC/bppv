import * as THREE from 'three';


import { GLTFLoader } from './three/loaders/GLTFLoader.js';

import { RGBELoader } from './three/loaders/RGBELoader.js';
import { GUI } from './three/libs/lil-gui.module.min.js';
import { OrbitControls } from './three/controls/OrbitControls.js';
import { TransformControls } from './three/controls/TransformControls.js';









const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {

    save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}



function saveArrayBuffer( buffer, filename ) {

    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}

let container;

let camera, scene1,  renderer, controls, control;
let gridHelper, head;

let bppvHuman;
let ear;
let character;
let torus;
let torusMesh, ballMesh;


let rotationGroup = new THREE.Group();

let physicsWorld;

var clock = new THREE.Clock(); //clock to get delta from, for animation
let mixer; //mixer for animation
let mixer_head; //mixer for animation
let mixer_character;
let characterAnim;
let characterHead;


let x_rotation_limit = 90;
let y_rotation_limit = 40;
let z_rotation_limit = 40;

//physics variables

let rigidBodies = [];
let tmpTrans;

let colGroupPlane = 1, colGroupTorus = 1, colGroupBall = 2;



const params = {
    hideShow: true,
    turntable: false,
    isolate: true,

    
};

Ammo().then(start);

function start(){

    tmpTrans = new Ammo.btTransform();

    setupPhysicsWorld();
    init();
    animate();

}


function setupPhysicsWorld(){

let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration();
let dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration);
let overlappingPairCache    = new Ammo.btDbvtBroadphase();
let solver                  = new Ammo.btSequentialImpulseConstraintSolver();

physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

}






function init() {


    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // Make linear gradient texture
    
    const data = new Uint8ClampedArray( 100 * 100 * 4 );

    for ( let y = 0; y < 100; y ++ ) {

        for ( let x = 0; x < 100; x ++ ) {

            const stride = 4 * ( 100 * y + x );

            data[ stride ] = Math.round( 255 * y / 99 );
            data[ stride + 1 ] = Math.round( 255 - 255 * y / 99 );
            data[ stride + 2 ] = 0;
            data[ stride + 3 ] = 255;

        }

    }

    const gradientTexture = new THREE.DataTexture( data, 100, 100, THREE.RGBAFormat );
    gradientTexture.minFilter = THREE.LinearFilter;
    gradientTexture.magFilter = THREE.LinearFilter;
    gradientTexture.needsUpdate = true;

    scene1 = new THREE.Scene();
    scene1.name = 'Scene1';


    scene1.add(rotationGroup);

    // ---------------------------------------------------------------------
    // Perspective Camera
    // ---------------------------------------------------------------------
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.set( 0,0,800 );
    //camera.lookAt( 0,550,0);

    camera.name = 'PerspectiveCamera';


    scene1.add( camera );

    // ---------------------------------------------------------------------
    // Ambient light
    // ---------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    ambientLight.name = 'AmbientLight';
    //ambientLight.castShadow = true;
    scene1.add( ambientLight );

    // ---------------------------------------------------------------------
    // DirectLight
    // ---------------------------------------------------------------------
    const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.target.position.set( 0, 0, - 1 );
    dirLight.add( dirLight.target );
    dirLight.lookAt( - 1, - 1, 0 );
    dirLight.name = 'DirectionalLight';
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene1.add( dirLight );


    // ---------------------------------------------------------------------
    //PHYSICS SETUP
    //////////////////////////////////////////////////////////////////////





    // ---------------------------------------------------------------------
    //LOAD THE GLTF FILES
    //////////////////////////////////////////////////////////////////////
    
    //humanHead
    const gltfLoader = new GLTFLoader();
    gltfLoader.load( './three/models/human_blender_rigged.glb', function ( gltf ) {

        bppvHuman = gltf.scene;
        bppvHuman.scale.multiplyScalar( 15 );
        

        //bppvHuman.getObjectByName("mainBody").material.color.set( "rgb(255, 0, 0)" );
        bppvHuman.castShadow = true;
        bppvHuman.receiveShadow = true;

        camera.add( bppvHuman );
        bppvHuman.position.set( 60,25,-100 );
        //scene1.add(bppvHuman);
        


        
        head = bppvHuman.getObjectByName("neck3");

        
        head.rotation.x = 0;
        head.rotation.y = 0;
        head.rotation.z = 0;

  

     
        /*
        mixer_head = new THREE.AnimationMixer( bppvHuman );

        mixer_head.clipAction(gltf.animations[0]).play();

        mixer_head.clipAction(gltf.animations[0]).clampWhenFinished = true; //stop animation on last frame
        mixer_head.clipAction(gltf.animations[0]).setLoop(THREE.LoopOnce); //set loop to once\
        */

        
        
    } );
        

        //character
        gltfLoader.load( './three/models/leonard.glb', function ( gltf ) {



            characterAnim = gltf.animations;
            character = gltf.scene;
            character.scale.multiplyScalar( 500 );
            character.position.set( 0,-550,300 );
    
            scene1.add(character);
    
            character.getObjectByName("Ch31_Sweater").material.roughness = 1;
            character.getObjectByName("Ch31_Pants").material.roughness = 1;
    
    
            
    
            characterHead = character.getObjectByName("mixamorig9Neck");

            
    
            //animation
            mixer_character = new THREE.AnimationMixer( character );
    
            //mixer_character.clipAction(gltf.animations[0]).play();
            
            characterHead.rotation.x = 0;
            characterHead.rotation.y = 0;
            characterHead.rotation.z = 0;
    
            control.attach( characterHead );
            control.showX = false;
            control.showY = false;
            control.showZ = false;
    
     
    
    
        });


    //innerEar
    gltfLoader.load( './three/models/innerEar.glb', function ( gltf) {

        ear = gltf.scene;
        ear.scale.multiplyScalar( 12 );
        ear.position.set( 300,0,0 );


        ear.castShadow = true;
        ear.receiveShadow = true;
        scene1.add( ear );





        rotationGroup.add(ear);

        //ear.getObjectByName("BG_R_endolymph_LP").material.transparent = true;
        //ear.getObjectByName("BG_R_endolymph_LP").material.opacity = 0.5;
        ear.getObjectByName("BG_R_incus_LP").material.transparent = true;
        ear.getObjectByName("BG_R_incus_LP").material.opacity = 0.5;
        ear.getObjectByName("BG_R_malleus_LP").material.transparent = true;
        ear.getObjectByName("BG_R_malleus_LP").material.opacity = 0.5;
        ear.getObjectByName("BG_R_saccule_LP").material.transparent = true;
        ear.getObjectByName("BG_R_saccule_LP").material.opacity = 0.5;

        //making canals transparent
        for(var i = 1; i <=5; i++){
        ear.getObjectByName("BG_R_SemicircCanals_Cochlea_Bone_LP2_" + i).material.transparent = true;
        ear.getObjectByName("BG_R_SemicircCanals_Cochlea_Bone_LP2_" + i).material.opacity = 0.3;
        }
        
        //animation
        mixer = new THREE.AnimationMixer( ear );

        mixer.clipAction(gltf.animations[0]).play();

 

    } );
/*
    //torus physics test
    gltfLoader.load( './three/models/torus_physicsTest.glb', function ( gltf) {

        torus = gltf.scene;
        //torus.scale.multiplyScalar( 100 );
        //torus.position.set( 300,-200,0 );


        torus.castShadow = true;
        torus.receiveShadow = true;
        //scene1.add( torus );

        torusMesh = torus.getObjectByName("torus");
        ballMesh = torus.getObjectByName("ball");

        
        torus.getObjectByName("torus").material.transparent = true;
        torus.getObjectByName("torus").material.opacity = 0.3;

        //Ammojs Section
        let pos = {x: torusMesh.position.x, y: torusMesh.position.y - 20 , z: torusMesh.position.z};
        let scale = {x: 1, y: 1, z: 1};
        let quat = {x: 0, y: 0, z: 0, w: 1};
        let mass = 0;
    
        
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        
        let motionState = new Ammo.btDefaultMotionState( transform );
        let localInertia = new Ammo.btVector3( 0, 0, 0 );

        let colShape =  createRigidBody2(torusMesh);
        colShape.setMargin( 0.05 );

        colShape.calculateLocalInertia( mass, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );


        physicsWorld.addRigidBody( body, colGroupTorus, colGroupBall );


        //Ammojs Section
        let pos2 = {x: ballMesh.position.x, y: ballMesh.position.y+50, z: ballMesh.position.z};
        let scale2 = {x: 1, y: 1, z: 1};
        let quat2 = {x: 0, y: 0, z: 0, w: 1};
        let mass2 = 0.5;
    
        
        let transform2 = new Ammo.btTransform();
        transform2.setIdentity();
        transform2.setOrigin( new Ammo.btVector3( pos2.x, pos2.y, pos2.z ) );
        transform2.setRotation( new Ammo.btQuaternion( quat2.x, quat2.y, quat2.z, quat2.w ) );
        
        let motionState2 = new Ammo.btDefaultMotionState( transform2 );
        let localInertia2 = new Ammo.btVector3( 0, 0, 0 );

        let colShape2 = createRigidBody2(ballMesh);
        colShape2.setMargin( 0.05 );

        colShape2.calculateLocalInertia( mass2, localInertia2 );

        let rbInfo2 = new Ammo.btRigidBodyConstructionInfo( mass2, motionState2, colShape2, localInertia2 );
        let body2 = new Ammo.btRigidBody( rbInfo2 );


        physicsWorld.addRigidBody( body2, colGroupBall, colGroupTorus );

        ballMesh.userData.physicsBody = body2;
        rigidBodies.push(ballMesh);

        //control.attach( torus );
        
    });
*/


    // ---------------------------------------------------------------------
    // Grid
    // ---------------------------------------------------------------------
    gridHelper = new THREE.GridHelper( 2000, 20, 0x888888, 0x444444 );
    gridHelper.position.y = - 150;
    gridHelper.name = 'Grid';
    //scene1.add( gridHelper );

    

    // ---------------------------------------------------------------------
    // Axes
    // ---------------------------------------------------------------------
    const axes = new THREE.AxesHelper( 300 );
    axes.name = 'AxesHelper';
    //scene1.add( axes );


    

    // ---------------------------------------------------------------------
    // Ortho camera
    // ---------------------------------------------------------------------
    const cameraOrtho = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10 );
    scene1.add( cameraOrtho );
    cameraOrtho.name = 'OrthographicCamera';




    // ---------------------------------------------------------------------
    // HDRI - IMAGE BASED LIGHTING
    // ---------------------------------------------------------------------
    new RGBELoader()
    .setPath('./three/textures/')
    .load('brown_photostudio_01_2k.hdr', function (texture) {

        
        texture.mapping = THREE.EquirectangularReflectionMapping;

        

        
        //scene1.background = texture;
        scene1.background = new THREE.Color( "rgb(23, 25, 33)" );
        scene1.environment = texture;

    });



    //////////////////////////////////////////////////////////////////////////////

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;



    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );

    
    controls.listenToKeyEvents( window ); // optional
    controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = true;

    //controls.minDistance = 100;
    //controls.maxDistance = 1000;

    controls.maxPolarAngle = Math.PI / 2;

    


    ///////////////////////TRANSFORM CONTROLS////////////////////////////////
    control = new TransformControls( camera, renderer.domElement );
    control.addEventListener( 'change', render );

    control.setMode( 'rotate' );
    control.setSpace( 'local' );

    control.addEventListener( 'dragging-changed', function ( event ) {

        controls.enabled = ! event.value;

        document.getElementById("rotXvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(characterHead.rotation.x));
        document.getElementById("rotYvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(characterHead.rotation.y));
        document.getElementById("rotZvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(characterHead.rotation.z));

        document.getElementById ("rotX" ).value  = parseInt(THREE.MathUtils.radToDeg(characterHead.rotation.x)) + x_rotation_limit;
        document.getElementById ("rotY" ).value  = parseInt(THREE.MathUtils.radToDeg(characterHead.rotation.y)) + y_rotation_limit;
        document.getElementById ("rotZ" ).value  = parseInt(THREE.MathUtils.radToDeg(characterHead.rotation.z)) + z_rotation_limit;

        /*
        //ROTATION LIMITS


        ////////////////////////////////// lower limit for rotation x ///////////////////////////////////
        if (head.rotation.x <= -1 * THREE.MathUtils.degToRad(x_rotation_limit))
        {

            head.rotation.x = -1 * THREE.MathUtils.degToRad(x_rotation_limit);
            document.getElementById("rotXvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(head.rotation.x));
        }
        
        ////////////////////////////////// upper limit for rotation x ///////////////////////////////////
        if (head.rotation.x >= THREE.MathUtils.degToRad(x_rotation_limit))
        {

            head.rotation.x = THREE.MathUtils.degToRad(x_rotation_limit);
            document.getElementById("rotXvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(head.rotation.x));
        }

        ////////////////////////////////// lower limit for rotation y ///////////////////////////////////
        if (head.rotation.y <= -1 * THREE.MathUtils.degToRad(y_rotation_limit))
        {

            head.rotation.y = -1 * THREE.MathUtils.degToRad(y_rotation_limit);
            document.getElementById("rotYvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(head.rotation.y));
        }

        ////////////////////////////////// upper limit for rotation y ///////////////////////////////////
        if (head.rotation.y >= THREE.MathUtils.degToRad(y_rotation_limit))
        {

            head.rotation.y = THREE.MathUtils.degToRad(y_rotation_limit);
            document.getElementById("rotYvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(head.rotation.y));
        }

        ////////////////////////////////// lower limit for rotation z ///////////////////////////////////
        if (head.rotation.z <= -1 * THREE.MathUtils.degToRad(z_rotation_limit))
        {

            head.rotation.z = -1 * THREE.MathUtils.degToRad(z_rotation_limit);
            document.getElementById("rotZvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(head.rotation.z));
        }

        ////////////////////////////////// upper limit for rotation z ///////////////////////////////////
        if (head.rotation.z >= THREE.MathUtils.degToRad(z_rotation_limit))
        {

            head.rotation.z = THREE.MathUtils.degToRad(z_rotation_limit);
            document.getElementById("rotZvalue").innerHTML = parseInt(THREE.MathUtils.radToDeg(head.rotation.z));
        }
*/

    } );
        
    
    scene1.add( control );




    window.addEventListener( 'resize', onWindowResize );



}

// HIDE/SHOW TRANSFORMATION CONTROLS //////////////////////////////////
///////////////////////////////////////////////////////////////

function hideShowControls(){
if(control.showX){
    control.showX = false;
    control.showY = false;
    control.showZ = false;
    }
    else{

        control.showX = true;
        control.showY = true;
        control.showZ = true;
    }

}

////////////////////////////////////////////////////////////////
// HIGHLIGHT OBJECT FUNCTION //////////////////////////////////
///////////////////////////////////////////////////////////////
function highlightObject(name) {



    var blue =  new THREE.Color("rgb(0,115,130)");
    var black =  new THREE.Color(0,0,0);
    var white = new THREE.Color(1,1,1);


    //UNHIGHLIGHT EVERYTHING ELSE

    bppvHuman.traverse( function( object ) {

    if(object.material){
    if ( object.material.emissive.equals(blue))
    {
        object.material.emissive.set(black);
        
    } 
}
    } );}

////////////////////////////////////////////////////////////////
// RESET ROTATION /////////////////////////////////////////////
///////////////////////////////////////////////////////////////

function resetRotation(){
document.getElementById ("rotX" ).value  = x_rotation_limit;
document.getElementById ("rotY" ).value  = y_rotation_limit;
document.getElementById ("rotZ" ).value  = z_rotation_limit;


characterHead.rotation.x = 0;
characterHead.rotation.y = 0;
characterHead.rotation.z = 0;

document.getElementById("rotXvalue").innerHTML = "";
document.getElementById("rotYvalue").innerHTML = "";
document.getElementById("rotZvalue").innerHTML = "";

render();

}

////////////////////////////////////////////////////////////////
// LAY DOWN FUNCTION/////////////////////////////////////////////
///////////////////////////////////////////////////////////////

function layDown() {

//detect "s" for layingdown

    //mixer_character.clipAction(characterAnim[1]).stop();
    //mixer_character.clipAction(characterAnim[0]).fadeOut(1);
    mixer_character.clipAction(characterAnim[0]).stop();
    //mixer_character.clipAction(characterAnim[1]).fadeIn(1);
    mixer_character.clipAction(characterAnim[1]).play();

    rotationGroup.rotation.x = THREE.MathUtils.degToRad(-90);


}

////////////////////////////////////////////////////////////////
// SIT FUNCTION/////////////////////////////////////////////
///////////////////////////////////////////////////////////////

function sit() {
//detect "a" for sit

    //mixer_character.clipAction(characterAnim[1]).fadeOut(1);
    mixer_character.clipAction(characterAnim[1]).stop();
    //mixer_character.clipAction(characterAnim[0]).fadeIn(1);
    mixer_character.clipAction(characterAnim[0]).play();

    rotationGroup.rotation.x = THREE.MathUtils.degToRad(0);

}

////////////////////////////////////////////////////////////////
// SLIDER CONTROLLED ROTATIONS //////////////////////////////////
///////////////////////////////////////////////////////////////


    //////////////////////// ROTATION X //////////////////////////////////////////////////////
    document.getElementById ("rotX" ).addEventListener( "input", function (rotationXslider) {

        
        characterHead.rotation.x = THREE.MathUtils.degToRad(rotationXslider.target.value - x_rotation_limit) ;
        document.getElementById("rotXvalue").innerHTML = rotationXslider.target.value - x_rotation_limit;
        render();

    } );

    //////////////////////// ROTATION Y //////////////////////////////////////////////////////
    document.getElementById ("rotY" ).addEventListener( "input", function (rotationYslider) {


        characterHead.rotation.y = THREE.MathUtils.degToRad(rotationYslider.target.value - y_rotation_limit);
        document.getElementById("rotYvalue").innerHTML = rotationYslider.target.value - y_rotation_limit;
        render();

    } );

    //////////////////////// ROTATION Z //////////////////////////////////////////////////////
    document.getElementById ("rotZ" ).addEventListener( "input", function (rotationZslider) {


        characterHead.rotation.z = THREE.MathUtils.degToRad(rotationZslider.target.value - z_rotation_limit);
        document.getElementById("rotZvalue").innerHTML = rotationZslider.target.value - z_rotation_limit;
        render();

    } );


    //////////////////////// RESET BUTTON //////////////////////////////////////////////////////
    document.getElementById ("resetButton" ).addEventListener( "click", function () {

        resetRotation();

    } );

    //////////////////////// HIDE/SHOW CONTROLS //////////////////////////////////////////////////////
    document.getElementById ("hideControlsButton" ).addEventListener( "click", function () {


       
        hideShowControls();
        

    } );

    //////////////////////// SIT BUTTON //////////////////////////////////////////////////////
    document.getElementById ("sitButton" ).addEventListener( "click", function () {

        sit();

    } );

    //////////////////////// LAY DOWN //////////////////////////////////////////////////////
    document.getElementById ("layDownButton" ).addEventListener( "click", function () {

        layDown();

    } );

    //////////////////////// UNDO FUNCTION //////////////////////////////////////////////////////
    document.onkeydown = function(e) {



        //detect "z" for undo
        if(e.keyCode == 90){

            control.reset();
        }


        //detect "h" for hide/show
        if(e.keyCode == 72){

            hideShowControls();
        }


        //detect "r" for reset
        if(e.keyCode == 82){

            resetRotation();
        }


        //detect "l" for layDown
        if(e.keyCode == 76){

            layDown();
        }


        //detect "s" for sit
        if(e.keyCode == 83){
            
            sit();
        }



        






        
    }


///////////////////////////////////////////////////// END FUNCTIONS////////////////////////////////////////


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//



function animate() {


    

    requestAnimationFrame( animate );

    var delta = clock.getDelta();
    

    updatePhysics(delta);

    if ( mixer && characterHead){

        mixer.setTime(characterHead.rotation.x * 3.5);
     //mixer.update( delta );
    
    }

    if ( mixer_head )        
     mixer_head.update( delta );
    
     if ( mixer_character )        
        mixer_character.update( delta );


      
    if(ear && character){


        ear.rotation.x = characterHead.rotation.x;
        ear.rotation.y = characterHead.rotation.y;
        ear.rotation.z = characterHead.rotation.z;

    }


    if(head && character){

        head.rotation.x = -characterHead.rotation.x;
        head.rotation.y = characterHead.rotation.y;
        head.rotation.z = -characterHead.rotation.z;

    }
    

    if(!params.turntable){
    render();}
    else{
        rotateCam();
    }




}

function render() {


    renderer.render( scene1, camera );


}


function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
}}


function createRigidBody(mesh){

    var vertices, face, triangles = [];


    //loop over the geometry to create a custom list of "triangle" data objects
    for ( i = 0; i < mesh.geometry.faces.length; i++ ) {
        face = geometry.faces[i];
        if ( face instanceof THREE.Face3) {

            triangles.push([
                { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
                { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z }
            ]);

        } else if ( face instanceof THREE.Face4 ) {

            triangles.push([
                { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
                { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
            ]);
            triangles.push([
                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
                { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
                { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
            ]);

        }
    }


    var i, triangle, triangle_mesh = new Ammo.btTriangleMesh;
    //triangles are passed off to Ammo.js to make a new Ammo.btBvhTriangleMeshShape
    for ( i = 0; i < description.triangles.length; i++ ) {
        triangle = description.triangles[i];

        _vec3_1.setX(triangle[0].x);
        _vec3_1.setY(triangle[0].y);
        _vec3_1.setZ(triangle[0].z);

        _vec3_2.setX(triangle[1].x);
        _vec3_2.setY(triangle[1].y);
        _vec3_2.setZ(triangle[1].z);

        _vec3_3.setX(triangle[2].x);
        _vec3_3.setY(triangle[2].y);
        _vec3_3.setZ(triangle[2].z);

        triangle_mesh.addTriangle(
            _vec3_1,
            _vec3_2,
            _vec3_3,
            true
        );
    }

    var shape = new Ammo.btBvhTriangleMeshShape(
        triangle_mesh,
        true,
        true
    );



}


function createRigidBody2(mesh){

    let verticesPos = mesh.geometry.getAttribute('position').array;
    let triangles = [];
    for(let i = 0; i < verticesPos.length; i+=3){
        triangles.push({
            x: verticesPos[i],
            y: verticesPos[i + 1],
            z: verticesPos[1 + 2]
        })
    }

    let triangle, triangle_mesh = new Ammo.btTriangleMesh();
    let vecA = new Ammo.btVector3(0,0,0);
    let vecB = new Ammo.btVector3(0,0,0);
    let vecC = new Ammo.btVector3(0,0,0);


    for(let i = 0; i < triangles.length - 3; i+=3) {

        vecA.setX(triangles[i].x);
        vecA.setY(triangles[i].y);
        vecA.setZ(triangles[i].z);

        vecB.setX(triangles[i + 1].x);
        vecB.setY(triangles[i + 1].y);
        vecB.setZ(triangles[i + 1].z);

        vecC.setX(triangles[i + 2].x);
        vecC.setY(triangles[i + 2].y);
        vecC.setZ(triangles[i + 2].z);

        triangle_mesh.addTriangle(vecA, vecB, vecC, true)
    }


    //Ammo.destory(vecB);
    //Ammo.destory(vecC);
    //Ammo.destory(vecA);


    const shape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true);
    mesh.geometry.verticesNeedUpdate = true;
    //shape.setMargin(0.05);


    return shape;

}

function rotateCam(){

    const timer = Date.now() * 0.0001;


    
    camera.position.x = Math.cos( timer ) * 800;
    camera.position.y = 100;
    camera.position.z = Math.sin( timer ) * 800;



    camera.lookAt( 0,0,0);
    
    renderer.render( scene1, camera );

}
