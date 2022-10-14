// three.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';


import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';



// physics
import { AmmoPhysics, ExtendedMesh, PhysicsLoader } from '@enable3d/ammo-physics'






const MainScene = () => {

//let stageReference = ("sitting : 0","layingDown : 1","rolledLeft : 2","rolledRight : 3","rolledToPromeFromLeft : 4","rolledToPromeFromRight : 5")


let endolymph
let innerEar
let canals
let endolymph_left
let innerEar_left
let canals_left
let tr_control
let tr_control_temp
let or_control
let or_control_right
let or_control_left
let box
let stone
let displayDiv = document.getElementById("posValue")
let rotationGroup_right = new THREE.Group();
let rotationGroup_left = new THREE.Group();
let character
let characterHead
let mixer_character
let characterAnim
let charStage = 0

let randomNumber = -1
let randomTemp = -2

let randomNumberVid = -1
let randomTempVid = -2

let sphere1

let container, container_right

let rotationComplete = true

let composer, outlinePass, effectFXAA

container = document.getElementById( 'threejs-canvas' );
container_right = document.getElementById( 'threejs-canvas2' );



container.width = container.clientWidth;  //970px
container.height = container.clientHeight;  //790px


var CANVAS_WIDTH = container.width;
var CANVAS_HEIGHT = container.height;

container_right.width = 500; //500px
container_right.height = 500; //500px



var CANVAS_WIDTH_RIGHT = container_right.width;
var CANVAS_HEIGHT_RIGHT = container_right.height;

var rotXslider = document.getElementById("rotX")! as HTMLInputElement
document.getElementById("sitButton")?.addEventListener('click', function(){
  if(charStage == 1){
  sit();}
})

document.getElementById("layDownButton")?.addEventListener('click', function(){

  if (charStage == 0){
  layDown();}

  else if(charStage == 2){
    rolledLeftToLay();
  }

  else if (charStage == 3){
    rolledRightToLay();

  }
  

})
document.getElementById("rollLeftButton")?.addEventListener('click', function(){

  if(charStage == 1){ //if character is "supine" position/on his back
    rollLeft();}
  
  else if(charStage == 4) {
    rollDownToLeft();}
  

})
document.getElementById("rollRightButton")?.addEventListener('click', function(){

  if(charStage == 1){ //if character is "supine" position/on his back
  rollRight();}

  else if(charStage == 5) {
  rollDownToRight();}
    

})
document.getElementById("rollDownButton")?.addEventListener('click', function(){

  if(charStage == 2){ //if character is "rolled left"
  rollDownfromLeft();}

  else if(charStage == 3){ //if character is "rolled right"
    rollDownfromRight();
  }

})



  // sizes
  const width = window.innerWidth
  const height = window.innerHeight

  // scene
  const scene = new THREE.Scene()
  //scene.background = new THREE.Color( "rgb(229,226,244)" );

  scene.add(rotationGroup_right)
  scene.add(rotationGroup_left)


    // ---------------------------------------------------------------------
    // HDRI - IMAGE BASED LIGHTING
    // ---------------------------------------------------------------------
    new RGBELoader()
    .setPath('./textures/')
    .load('brown_photostudio_01_2k.hdr', function (texture) {

        
        texture.mapping = THREE.EquirectangularReflectionMapping;

        

        
        //scene1.background = texture;
        scene.background = new THREE.Color( "rgb(38,36,43)" );
        //scene.background = texture,

        scene.environment = texture;


    });



    //////////////////////////////////////////////////////////////////////////////

  // camera
  const camera = new THREE.PerspectiveCamera(50, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000)
  camera.position.set(0, 5, 7.5)
  scene.add(camera)

  // camera_right
  var camera_right = new THREE.PerspectiveCamera(50, CANVAS_WIDTH_RIGHT / CANVAS_HEIGHT_RIGHT, 0.1, 1000)
  camera_right.position.set(-3.5, 6.25, 2)
  scene.add(camera_right)

  // camera_left
  var camera_left = new THREE.PerspectiveCamera(50, CANVAS_WIDTH_RIGHT / CANVAS_HEIGHT_RIGHT, 0.1, 1000)
  camera_left.position.set(3.5, 6.25, 2)
  scene.add(camera_left)


  // you can access Ammo directly if you want
  // new Ammo.btVector3(1, 2, 3).y()

  // 2d camera/2d scene
  const scene2d = new THREE.Scene()
  const camera2d = new THREE.OrthographicCamera(0, CANVAS_WIDTH, CANVAS_HEIGHT, 0, 1, 1000)
  camera2d.position.setZ(10)

  // renderer


  
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: container} )
  //renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT)
  renderer.autoClear = false
  renderer.shadowMap.enabled = true;
  
  const renderer_right = new THREE.WebGLRenderer({ antialias: true, canvas: container_right} )
  //renderer.setPixelRatio( window.devicePixelRatio );
  renderer_right.setSize(CANVAS_WIDTH_RIGHT, CANVAS_HEIGHT_RIGHT)
  renderer_right.autoClear = false
  renderer_right.shadowMap.enabled = true;
  //document.body.appendChild(container)


  
  

  // dpr
  const DPR = window.devicePixelRatio
  renderer.setPixelRatio(Math.min(2, DPR))
  renderer_right.setPixelRatio(Math.min(2, DPR))

  
  // orbit controls
  or_control = new OrbitControls(camera, renderer.domElement)
  or_control_right = new OrbitControls(camera_right, renderer_right.domElement)
  or_control_left = new OrbitControls(camera_left, renderer_right.domElement)



  var lookAtVector = new THREE.Vector3(0,5,-3.5)
  var lookAtVector_right = new THREE.Vector3(-3.5,6,-3.5)
  var lookAtVector_left = new THREE.Vector3(4,6,-3.5)

  camera.lookAt(lookAtVector)
  or_control.target = lookAtVector

  camera_right.lookAt(lookAtVector_right)
  or_control_right.target = lookAtVector_right

  camera_left.lookAt(lookAtVector_left)
  or_control_left.target = lookAtVector_left
  
/*
  //transform controls
  tr_control = new TransformControls( camera, renderer.domElement );
  tr_control.setMode( 'rotate' );
  //tr_control.setRotationSnap( 0.1 );
  scene.add(tr_control)
  tr_control.size = 0.2

  //transform controls temporary
  tr_control_temp = new TransformControls( camera, renderer.domElement );
  tr_control_temp.setMode( 'rotate' );
  //tr_control.setRotationSnap( 0.1 );
  //scene.add(tr_control_temp)
  

  

  tr_control.addEventListener( 'dragging-changed', function ( event ) {

  or_control.enabled = ! event.value;


});

  tr_control_temp.addEventListener( 'dragging-changed', function ( event ) {

  or_control.enabled = ! event.value;


});
*/

////////////////////////////////////////////////////////////////////////////////////////////////////
// POST PROCESSING - OUTLINE PASS /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////





  composer = new EffectComposer( renderer );

  //composer_right = new EffectComposer( renderer );

  const renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );

  composer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT)

  outlinePass = new OutlinePass( new THREE.Vector2( CANVAS_WIDTH, CANVAS_HEIGHT ), scene, camera );
  composer.addPass( outlinePass );




  // light
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
  scene.add(new THREE.AmbientLight(0x666666))
  const light = new THREE.DirectionalLight(0xdfebff, 1)
  light.position.set(50, 200, 100)
  light.position.multiplyScalar(1.3)

  // physics
  const physics = new AmmoPhysics(scene as any)
  //physics.debug?.enable()
  physics.physicsWorld.stepSimulation(1/2400,10,1/240)
  physics.physicsWorld.setGravity(new Ammo.btVector3(0,-0.1,0))

  // extract the object factory from physics
  // the factory will make/add object without physics
  const { factory } = physics



  // static ground
  physics.add.ground({ width: 20, height: 20, depth:0.1 },{ lambert: { color: '#436FF0' , transparent: true, opacity: 0.05}})




////////////////////////////////////////////////////////////////////////////////////////////////////
// MAPPING VALUES TO CANAL SELECTION DROPDOWN OPTIONS /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var selectedCanal = -1
document.getElementById("rightGreenSelect")?.addEventListener('click', function(){  document.getElementById("selectAffected")!.innerHTML = "Right Posterior";selectedCanal = 0 })
document.getElementById("rightBlueSelect")?.addEventListener('click', function(){  document.getElementById("selectAffected")!.innerHTML = "Right Horizontal";selectedCanal = 1 })
document.getElementById("rightRedSelect")?.addEventListener('click', function(){  document.getElementById("selectAffected")!.innerHTML = "Right Anterior";selectedCanal = 2 })
document.getElementById("leftRedSelect")?.addEventListener('click', function(){  document.getElementById("selectAffected")!.innerHTML = "Left Anterior"; selectedCanal = 3 })
document.getElementById("leftBlueSelect")?.addEventListener('click', function(){  document.getElementById("selectAffected")!.innerHTML = "Left Horizontal";selectedCanal = 4 })
document.getElementById("leftGreenSelect")?.addEventListener('click', function(){  document.getElementById("selectAffected")!.innerHTML = "Left Posterior";selectedCanal = 5 })

////////////////////////////////////////////////////////////////////////////////////////////////////
// VIDEO FUNCTION /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//red = anterior, blue = horizontal, green = posterior

function selectVideo(){
let vidArr = [

  ["RPC_sec", 0],
  ["RHC_headleft", 1],
  ["RHC_sec", 1],
  ["RAC_sec", 2],
  ["LAC_sec", 3],
  ["LHC_headright", 4],
  ["LHC_sec", 4 ],
  ["LPC_sec", 5],

];

//check to see it doesn't randomize to
//the same number as previous one
//when randomize is clicked
randomTempVid = randomNumberVid

do{
randomNumberVid = Math.floor(Math.random() * (8) )
} while(randomNumberVid == randomTempVid);

(document.getElementById("eyeVideo") as HTMLInputElement).src = "./videos/" + vidArr[randomNumberVid][0] + ".mp4";
console.log(vidArr[randomNumberVid][0])

randomNumber = Number(vidArr[randomNumberVid][1])

}
selectVideo();

////////////////////////////////////////////////////////////////////////////////////////////////////
// INDICATOR SPHERE TO CALL ATTENTION TO THE STONE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const indicatorGeo = new THREE.SphereGeometry( 0.3, 15, 32, 16 );
const indicatorMat = new THREE.MeshPhysicalMaterial( { color: '#ffffff' } );

indicatorMat.transparent = true;
indicatorMat.opacity = 0.2;
//indicatorMat.blending = THREE.AdditiveBlending;

indicatorMat.depthTest = false


const indicatorSphere = new THREE.Mesh( indicatorGeo, indicatorMat );
scene.add(indicatorSphere)

indicatorSphere.position.set(0,0,0)


////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE STONE FUNCTION /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////



//right green, right blue, right red, left red, left blue, left green positions
let posArr = [new THREE.Vector3(-3.93,4.41,-4.88), new THREE.Vector3(-4.98,5.68,-4.80),new THREE.Vector3(-3.50,8.10,-4.38),
  new THREE.Vector3(3.59,8.10,-4.33),new THREE.Vector3(5.24,5.80,-4.56),new THREE.Vector3(4.92,5.17,-5.59)]

function createStone() {

/*
//check to see it doesn't randomize to
//the same number as previous one
//when randomize is clicked
randomTemp = randomNumber

do{
randomNumber = Math.floor(Math.random() * (6) )
} while(randomNumber == randomTemp);
*/


sphere1 = physics.add.sphere({radius:0.03, x: posArr[randomNumber].x, y: posArr[randomNumber].y, z: posArr[randomNumber].z, mass:0.5},{ lambert: { color: '#436FF0' , emissive:'#436FF0', emissiveIntensity: 1}})

scene.add( sphere1 );

sphere1.visible = false;
indicatorSphere.visible = false;

//tr_control.attach(sphere1)
  
sphere1.body.setBounciness(0) ;
sphere1.body.setFriction(0);


indicatorSphere.parent = sphere1

outlinePass.selectedObjects = [indicatorSphere];
outlinePass.edgeStrength = 5;
outlinePass.visibleEdgeColor.set( "#ffffff" );
outlinePass.edgeThickness = 1;
outlinePass.edgeGlow = 0.2;
}

createStone();

////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE STONE FUNCTION WITH ORIGINAL VALUE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////


function recreateStone() {

sphere1 = physics.add.sphere({radius:0.03, x: posArr[randomNumber].x, y: posArr[randomNumber].y, z: posArr[randomNumber].z, mass:0.5},{ lambert: { color: '#436FF0' , emissive:'#436FF0', emissiveIntensity: 1}})

scene.add( sphere1 );
//tr_control.attach(sphere1)
  
sphere1.body.setBounciness(0) ;
sphere1.body.setFriction(0);

indicatorSphere.parent = sphere1
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// RESET POSITION - CALL RECREATE STONE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("resetButton")?.addEventListener('click', function(){
  if(rotationComplete == true){ //listen for any in-progress animations

    let warningPrompt = confirm("This will reset this module, put the stone at its initial position, and you will lose your progress. Continue?");

    if (warningPrompt == true){

    disableAllButtons();
    enableButton("sitButton");
    enableButton("layDownButton");
    
    rotationGroup_left.rotation.x = 0
    rotationGroup_right.rotation.x = 0
    rotationGroup_left.rotation.y = 0
    rotationGroup_right.rotation.y = 0
    
    mixer_character.stopAllAction();
    //mixer_character.clipAction(characterAnim[2]).stop();
    //mixer_character.clipAction(characterAnim[3]).stop();
    //mixer_character.clipAction(characterAnim[1]).stop();
    //mixer_character.clipAction(characterAnim[0]).stop();

    layedDown = false
  

  sphere1.geometry.dispose()
  sphere1.material.dispose()
  physics.destroy(sphere1.body)
  scene.remove(sphere1)
  
  characterHead.rotation.x = 0
  characterHead.rotation.y = 0
  characterHead.rotation.z = 0

  setTimeout(createStone, 100) 
    }
  }
})

////////////////////////////////////////////////////////////////////////////////////////////////////
// RANDOMIZE POSITION - CALL CREATE STONE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("hideControlsButton")?.addEventListener('click', function(){

  let warningPrompt = confirm("This will reset this module, a different video will be displayed; and you will lose your progress. Continue?");

  if (warningPrompt == true){

    randomize();
  }

  
})

function randomize(){
  if(rotationComplete == true){ //listen for any in-progress animations

    disableAllButtons();
    enableButton("sitButton");
    enableButton("layDownButton");

    mixer_character.stopAllAction();
    //mixer_character.clipAction(characterAnim[3]).stop();
    //mixer_character.clipAction(characterAnim[1]).stop();
    //mixer_character.clipAction(characterAnim[0]).stop();
    rotationGroup_left.rotation.x = 0
    rotationGroup_right.rotation.x = 0
    rotationGroup_left.rotation.y = 0
    rotationGroup_right.rotation.y = 0
    layedDown = false
  

  sphere1.geometry.dispose()
  sphere1.material.dispose()
  physics.destroy(sphere1.body)
  scene.remove(sphere1)
  
  characterHead.rotation.x = 0
  characterHead.rotation.y = 0
  characterHead.rotation.z = 0

  selectVideo();
  setTimeout(createStone, 100)

  resetSelectionPanel()

}
}
function resetSelectionPanel(){
  document.getElementById("correctAnswerDiv")!.style.display = "none"
  document.getElementById("incorrectAnswerDiv")!.style.display = "none"
  document.getElementById("selectAffected")!.innerHTML = "Select Affected Canal"
  selectedCanal = -1
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// TEMP SPHERE FOR POSITION VALUES /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const geometry = new THREE.SphereGeometry( 0.03, 15, 32, 16 );
const material = new THREE.MeshBasicMaterial( { color: '#436FF0' } );
const sphere = new THREE.Mesh( geometry, material );
//scene.add(sphere)



////////////////////////////////////////////////////////////////////////////////////////////////////
// ROUND SLIDER IMAGES /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var roundSlider1 = document.getElementsByClassName("c-rng--circular")[0] as HTMLInputElement
var roundSlider2 = document.getElementsByClassName("c-rng--circular")[1] as HTMLInputElement
var roundSlider3 = document.getElementsByClassName("c-rng--circular")[2] as HTMLInputElement

roundSlider1.style.setProperty('--imageURL', 'url(./textures/flexExtension.png)');
roundSlider2.style.setProperty('--imageURL', 'url(./textures/rotation.png)');
roundSlider3.style.setProperty('--imageURL', 'url(./textures/lateralFlex.png)');

/*
document.getElementsByClassName("c-rng--circular")[0].style.setProperty('--imageURL', 'url(/textures/lateralFlex.png)');
document.getElementsByClassName("c-rng--circular")[1].style.setProperty('--imageURL', 'url(/textures/rotation.png)');
document.getElementsByClassName("c-rng--circular")[2].style.setProperty('--imageURL', 'url(/textures/flexExtension.png)');
*/
/////////////////////////////////////////////////////////////////////
// LOGIC TO DETERMINE IF USER SELECTED CORRECT CANAL/////////////////
/////////////////////////////////////////////////////////////////////
document.getElementById("submitSelectedCanal")?.addEventListener('click', function(){

  var result


  if (selectedCanal == -1){ 
    result = -1 //no option selected
  }
  else if (randomNumber == selectedCanal){
    result = 1 //correct answer
  }
  else if(randomNumber != selectedCanal){
    result = 0 //incorrect answer
  }



  if(result == -1){
    document.getElementById("noneSelected")!.style.display = "inline"
  }

  else if(result == 1){
  document.getElementById("correctAnswerDiv")!.style.display = "inline"
  document.getElementById("incorrectAnswerDiv")!.style.display = "none"
  document.getElementById("noneSelected")!.style.display = "none"
  
  sphere1.visible = true
  indicatorSphere.visible = true

  document.getElementById("submitSelectedCanal")!.style.backgroundColor = "#D5E1EB"
  document.getElementById("submitSelectedCanal")!.style.border = "thick solid #0000FF"
  document.getElementById("submitSelectedCanal")!.style.color = "white"
  }


  else if(result == 0){
    document.getElementById("incorrectAnswerDiv")!.style.display = "inline"
    document.getElementById("correctAnswerDiv")!.style.display = "none"
    document.getElementById("noneSelected")!.style.display = "none"}


})

document.getElementById("proceedToTreat")?.addEventListener('click',function(){
  document.getElementById("mode")!.innerHTML = "Treatment Mode"
  document.getElementById("selectionDiv")!.style.display = "none"
  document.getElementById("card-space")!.style.display = "flex"
 

})

document.getElementById("restartModule")?.addEventListener('click', function(){

  resetSelectionPanel()
  randomize()
  document.getElementById("mode")!.innerHTML = "Diagnosis Mode"
  document.getElementById("selectionDiv")!.style.display = "inline"
  document.getElementById("card-space")!.style.display = "none"

})

var mode = "diagnosis"
document.getElementById("mode")?.addEventListener('click', function(){

  if(mode ==  "diagnosis"){
    document.getElementById("selectionDiv")!.style.display = "none"
    document.getElementById("card-space")!.style.display = "flex"
    mode = "treatment"
    document.getElementById("mode")!.innerHTML = "Treatment Mode"
  }
  else if(mode == "treatment"){
    document.getElementById("selectionDiv")!.style.display = "inline"
    document.getElementById("card-space")!.style.display = "none"
    mode = "diagnosis"
    document.getElementById("mode")!.innerHTML = "Diagnosis Mode"
  }

})


//////////////////////////LOADING MANAGER////////////////////////////
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function(){}


loadingManager.onLoad = function(){
  
  document.getElementById("enterButton")!.style.display = "inline";
  document.getElementById("loadingText")!.innerHTML = "Loaded!"

}

document.getElementById("enterButton")!.addEventListener('click', function(){

  document.getElementById("loadingPage")!.style.display = "none";
})


/////////////////////////////////////////////////////////////////////
// CHARACTER GLTF LOADER/////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
new GLTFLoader(loadingManager).loadAsync('./models/leonard_v02.glb').then(gltf => {

  characterAnim = gltf.animations
  character= gltf.scene;

  character.scale.set(5,5,5)

  scene.add(character)

  character.getObjectByName("Ch31_Sweater").material.roughness = 1;
  character.getObjectByName("Ch31_Pants").material.roughness = 1;

  characterHead = character.getObjectByName("mixamorig9Neck");

  characterHead.rotation.set(0,0,0)
  
  //tr_control_temp.attach(characterHead)
  

   //animation
   mixer_character = new THREE.AnimationMixer( character );

     
  mixer_character.addEventListener('finished', function(e) {

    console.log("the animation is finished!")
  });
  

});

////////////////////////////////////////////////////////////////
// RIGHT EAR GLTF LOADER/////////////////////////////////////////////
///////////////////////////////////////////////////////////////
  new GLTFLoader().loadAsync('./models/endolymph.glb').then(gltf => {

    innerEar= gltf.scene;

    
    canals = innerEar.children[0]

    endolymph = canals.children[4]

    scene.add(innerEar)
  
    
    rotationGroup_right.add(innerEar);

    rotationGroup_right.position.x = -3
    rotationGroup_right.position.y = 6    
    rotationGroup_right.position.z = -3.5
    


    
  
    physics.add.existing(canals, {shape: 'concave'})
    //physics.add.existing(stone, {shape: 'sphere'})

    canals.body.setCollisionFlags(2)



    

    canals.body.needUpdate = true

    
    
    //material adjustments - transparency
    for(var i = 0; i <endolymph.children.length; i++){
       
    endolymph.children[i].material.side = "BackSide"

     
    endolymph.children[i].material.transparent = true
    endolymph.children[i].material.opacity = 0.7
    endolymph.children[i].material.roughness = 0.3
    endolymph.children[i].material.refractionRatio = 1.2
    endolymph.children[i].material.reflectivity = 0

    
    }
    
    /*
    physics.config.maxSubSteps = 100
    physics.config.fixedTimeStep = 1/240
    */


  });

////////////////////////////////////////////////////////////////
// LEFT EAR GLTF LOADER/////////////////////////////////////////////
///////////////////////////////////////////////////////////////
new GLTFLoader().loadAsync('./models/endolymph_left.glb').then(gltf => {

  innerEar_left= gltf.scene;

  
  canals_left = innerEar_left.children[0]

  endolymph_left = canals_left.children[4]

  scene.add(innerEar_left)
  
  rotationGroup_left.add(innerEar_left);
  
  rotationGroup_left.position.y = 6
  rotationGroup_left.position.x = 5
  rotationGroup_left.position.z = -3.5
  


  

  physics.add.existing(canals_left, {shape: 'concave'})
  //physics.add.existing(stone, {shape: 'sphere'})

  canals_left.body.setCollisionFlags(2)



  

  canals_left.body.needUpdate = true

  
  
  //material adjustments - transparency
  for(var i = 0; i <endolymph_left.children.length; i++){
     
  endolymph_left.children[i].material.side = "BackSide"

   
  endolymph_left.children[i].material.transparent = true
  endolymph_left.children[i].material.opacity = 0.7
  endolymph_left.children[i].material.roughness = 0.3
  endolymph_left.children[i].material.refractionRatio = 1.2
  endolymph_left.children[i].material.reflectivity = 0

  
  }
  
  /*
  physics.config.maxSubSteps = 100
  physics.config.fixedTimeStep = 1/240
  */


});
////////////////////////////////////////////////////////////////
// ROTATION BUTTONS////////////////////////////////////////////
///////////////////////////////////////////////////////////////





function rotationButtons(button, direction, limit){

var interval
document.getElementById(button)?.addEventListener('mousedown', function(){

  interval = setInterval(function(){

    rotateHead(direction, THREE.MathUtils.degToRad(limit))

  }, 50)

})

document.getElementById(button)?.addEventListener('mouseup', function(){

  clearInterval(interval);

})

document.getElementById(button)?.addEventListener('mouseleave', function(){

  clearInterval(interval);

})

}

function rotateHead(direction, limit){

  if (direction == "x_negative" && characterHead.rotation.x > limit){
  characterHead.rotation.x -= THREE.MathUtils.degToRad(0.6)}
  if (direction == "x_positive" && characterHead.rotation.x < limit){
  characterHead.rotation.x += THREE.MathUtils.degToRad(0.6)}
  if (direction == "y_negative" && characterHead.rotation.y > limit){
  characterHead.rotation.y -= THREE.MathUtils.degToRad(0.6)}
  if (direction == "y_positive" && characterHead.rotation.y < limit){
  characterHead.rotation.y += THREE.MathUtils.degToRad(0.6)}
  if (direction == "z_negative" && characterHead.rotation.z < limit){
  characterHead.rotation.z += THREE.MathUtils.degToRad(0.6)}
  if (direction == "z_positive" && characterHead.rotation.z > limit){
  characterHead.rotation.z -= THREE.MathUtils.degToRad(0.6)}

  canals.body.needUpdate = true
  canals_left.body.needUpdate = true
  sphere1.body.needUpdate = true
}


rotationButtons("rotX_leftButton", "x_negative", -90)
rotationButtons("rotX_rightButton", "x_positive", 90)
rotationButtons("rotY_leftButton", "y_negative", -90)
rotationButtons("rotY_rightButton", "y_positive", 90)
rotationButtons("rotZ_leftButton", "z_negative", 90)
rotationButtons("rotZ_rightButton", "z_positive", -90)


////////////////////////////////////////////////////////////////
// KEY DOWN DETECTION///////////////////////////////////
///////////////////////////////////////////////////////////////
  document.onkeydown = function(e) {



    //detect "z" for undo
    if(e.keyCode == 37){
  
        characterHead.rotation.x += 0.01
        canals.body.needUpdate = true
        canals_left.body.needUpdate = true

       
   

    }
    if(e.keyCode == 39){
  
      characterHead.rotation.x -= 0.01
        canals.body.needUpdate = true
        canals_left.body.needUpdate = true
       

    }
    if(e.keyCode == 38){
  
      characterHead.rotation.y += 0.01
        canals.body.needUpdate = true
        canals_left.body.needUpdate = true

        
    }
    if(e.keyCode == 40){
  
      characterHead.rotation.y -= 0.01
        canals.body.needUpdate = true
        canals_left.body.needUpdate = true

    }
    if(e.keyCode == 90){

      randomize();

    }
  }

////////////////////////////////////////////////////////////////
// SHORTEST DISTANCE FUNCTION///////////////////////////////////
///////////////////////////////////////////////////////////////

  function shortestDistance(object) {

    var result = ""

    let greenArr = canals.children[1].children
    let redArr = canals.children[2].children
    let blueArr = canals.children[0].children
  
  
    let minGreen = calculateMinDistance(greenArr,object)
    let minRed = calculateMinDistance(redArr,object)
    let minBlue = calculateMinDistance(blueArr,object)
  
    let allMins = [minRed, minGreen, minBlue]
  
  
    let minOfAll = 0.01
    let minOfAllIndex = -1
  
    let whichCanal = ""
  
    //determine the smallest of minGreen, minRed, minBlue
    for(var i = 0; i < allMins.length; i++){
  
  
      if(allMins[i] < minOfAll){
  
        minOfAll = allMins[i]
        minOfAllIndex = i
  
      }
    }
      if (minOfAllIndex == -1){
  
        result =  "You are in <font style='color:grey;'> GREY </font> canal!"
      }
      if (minOfAllIndex == 0){
  
        result =  "You are in <font style='color:red;'> RED </font> canal!"
      }
      if (minOfAllIndex == 1){
  
        result =  "You are in <font style='color:green;'> GREEN </font> canal!"
      }
      if (minOfAllIndex == 2){
  
        result = "You are in <font style='color:blue;'> BLUE </font> canal!"
      }

    return result.toString()

    
  }
  
  //calculates the distance from every object
  //in a given array 'contentArr' to the specified 'object'
  //and returns the mimimum of those distances
  function calculateMinDistance(contentArr, object){
  
    //let distancesArr = []

    let distancesArr: any[] = [];
    
  
    for(var i = 0; i < contentArr.length; i++){
  
  
      contentArr[i].matrixWorldNeedsUpdate = true
      var childPos = new THREE.Vector3()
      contentArr[i].getWorldPosition(childPos)

      var distanceSquared = childPos.distanceToSquared(object.position)
  
      distancesArr.push(distanceSquared)
      
      
    }
  
    //calculate the minimum of all distances 
    var min = Math.min.apply(Math, distancesArr)
    
    
    return min
  
  }
  ////////////////////////////////////////////////////////////////
// DISABLE ALL BUTTONS////////////////////////////////////////
///////////////////////////////////////////////////////////////

function disableAllButtons(){
  let allButtons = ["sitButton", "layDownButton", "rollLeftButton", "rollRightButton", "rollDownButton"];

  allButtons.forEach(function(buttonName){
    disableButton(buttonName);
  })

}
////////////////////////////////////////////////////////////////
// DISABLE BUTTON STYLE////////////////////////////////////////
///////////////////////////////////////////////////////////////

function disableButton(buttonName){

  document.getElementById(buttonName)!.style.opacity = '0.5';
}
////////////////////////////////////////////////////////////////
// ENABLE BUTTON STYLE////////////////////////////////////////
///////////////////////////////////////////////////////////////

function enableButton(buttonName){

  document.getElementById(buttonName)!.style.opacity = '1';
}
////////////////////////////////////////////////////////////////
// INITIALLY DISABLE SOME BUTTONS////////////////////////////////////////
///////////////////////////////////////////////////////////////

disableButton("rollLeftButton");
disableButton("rollRightButton");
disableButton("rollDownButton");

////////////////////////////////////////////////////////////////
// LAY DOWN FUNCTION/////////////////////////////////////////////
///////////////////////////////////////////////////////////////
var layedDown = false;
function layDown() {

      if(charStage == 0){ //if character is sitting up

      //mixer_character.clipAction(characterAnim[0]).fadeOut(0.1);
      //mixer_character.clipAction(characterAnim[1]).stop();
      //mixer_character.clipAction(characterAnim[1]).weight = 0
      
      //mixer_character.clipAction(characterAnim[0]).enabled=true;
      mixer_character.clipAction(characterAnim[0]).clampWhenFinished = true;
      mixer_character.clipAction(characterAnim[0]).setLoop(THREE.LoopOnce);
      mixer_character.clipAction(characterAnim[0]).setDuration(0.3);
      mixer_character.clipAction(characterAnim[0]).play();
      mixer_character.clipAction(characterAnim[3]).stop();
      //mixer_character.clipAction(characterAnim[0]).fadeIn(0.225);
      


      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = 0

      function negRotateGroup() {

        if(rotateDeg <= -90){
          clearInterval(rotateCanalInterval)
          rotationComplete = true;
          enableButton("rollLeftButton");
          enableButton("rollRightButton");
          enableButton("sitButton");
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg -= 0.5
        rotationGroup_right.rotation.x = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.x = THREE.MathUtils.degToRad(rotateDeg);
        }

      }


    }

    charStage = 1
    /*
    enableButton("rollLeftButton");
    enableButton("rollRightButton");
    */

  }
  
  ////////////////////////////////////////////////////////////////
  // SIT FUNCTION/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  
  function sit() {

    


      if(rotationGroup_left.rotation.x == THREE.MathUtils.degToRad(-90)){ //sit btn wont work until layDown function is finished
      
      //  mixer_character.clipAction(characterAnim[0]).fadeOut(0.225);

      mixer_character.clipAction(characterAnim[3]).clampWhenFinished = true;
      mixer_character.clipAction(characterAnim[3]).setLoop(THREE.LoopOnce);
      mixer_character.clipAction(characterAnim[3]).setDuration(0.3);
      mixer_character.clipAction(characterAnim[3]).play();
      mixer_character.clipAction(characterAnim[4]).stop();
      mixer_character.clipAction(characterAnim[9]).stop();
      mixer_character.clipAction(characterAnim[0]).stop();
      //mixer_character.stopAllAction();
      console.log("Sit Funtion triggered!")

      //distributing rotation of rotationGroup_right over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = -90

      function negRotateGroup() {

        if(rotateDeg >=0){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("layDownButton")
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg += 0.5
        rotationGroup_right.rotation.x = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.x = THREE.MathUtils.degToRad(rotateDeg);

        }

      }


    }
    charStage = 0
    /*
    enableButton("layDownButton")
    disableButton("rollLeftButton");
    disableButton("rollRightButton");
    disableButton("rollDownButton");
    */
  }
  ////////////////////////////////////////////////////////////////
  // ROLL LEFT FUNCTION/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  function rollLeft(){
    
    mixer_character.clipAction(characterAnim[1]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[1]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[1]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[1]).play();
    mixer_character.clipAction(characterAnim[0]).stop();
    mixer_character.clipAction(characterAnim[5]).stop();
    mixer_character.clipAction(characterAnim[4]).stop();
    mixer_character.clipAction(characterAnim[9]).stop();
    console.log("Roll Left Funtion triggered!")


      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = 0

      function negRotateGroup() {

        if(rotateDeg >= 90){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("rollDownButton");
          enableButton("layDownButton");
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg += 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }

      }

      charStage = 2
      /*
      disableButton("rollRightButton");
      disableButton("sitButton");
      enableButton("rollDownButton");
      enableButton("layDownButton");
      disableButton("rollLeftButton")
      */
  }


  ////////////////////////////////////////////////////////////////
  // ROLL DOWN FROM LEFT FUNCTION/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  function rollDownfromLeft(){
    
    mixer_character.clipAction(characterAnim[2]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[2]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[2]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[2]).play();
    mixer_character.clipAction(characterAnim[1]).stop();
    mixer_character.clipAction(characterAnim[9]).stop();
    mixer_character.clipAction(characterAnim[5]).stop();
    console.log("Roll Down from Left Funtion triggered!")

      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = 90

      function negRotateGroup() {

        if(rotateDeg >= 180){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("rollLeftButton")
          enableButton("sitButton");
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg += 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }
  }

  charStage = 4
  /*
  enableButton("sitButton");
  disableButton("layDownButton");
  enableButton("rollLeftButton")
  disableButton("rollDownButton")
  */
  }

  ////////////////////////////////////////////////////////////////
  // ROLL RIGHT FUNCTION/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  function rollRight(){
    
    mixer_character.clipAction(characterAnim[8]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[8]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[8]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[8]).play();
    mixer_character.clipAction(characterAnim[0]).stop();
    mixer_character.clipAction(characterAnim[4]).stop();
    console.log("Roll Right Funtion triggered!")


      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = 0

      function negRotateGroup() {

        if(rotateDeg <= -90){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("rollDownButton");
          enableButton("layDownButton");

        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg -= 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }

      }

      charStage = 3
      /*
      disableButton("rollLeftButton");
      disableButton("sitButton");
      enableButton("rollDownButton");
      enableButton("layDownButton");
      disableButton("rollRightButton")
      */
  }

    ////////////////////////////////////////////////////////////////
  // ROLL DOWN FROM RIGHT FUNCTION/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  function rollDownfromRight(){
    
    mixer_character.clipAction(characterAnim[6]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[6]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[6]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[6]).play();
    mixer_character.clipAction(characterAnim[8]).stop();
    mixer_character.clipAction(characterAnim[7]).stop();
    console.log("Roll Down from Right Funtion triggered!")

      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = -90

      function negRotateGroup() {

        if(rotateDeg <= -180){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("rollRightButton")
          enableButton("sitButton");
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg -= 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }
  }

  charStage = 5
  /*
  enableButton("sitButton");
  disableButton("layDownButton");
  enableButton("rollRightButton")
  disableButton("rollDownButton")
  */
  }

  ////////////////////////////////////////////////////////////////
  // ROLL DOWN 'TO' RIGHT FUNCTION/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  function rollDownToRight(){
    
    mixer_character.clipAction(characterAnim[7]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[7]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[7]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[7]).play();
    mixer_character.clipAction(characterAnim[6]).stop();
    mixer_character.clipAction(characterAnim[4]).stop();
    console.log("Roll Down to Right Funtion triggered!")

      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = -180

      function negRotateGroup() {

        if(rotateDeg >= -90){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("layDownButton");
          enableButton("rollDownButton")
          
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg += 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }
  }
  charStage = 3
  /*
  enableButton("layDownButton");
  disableButton("sitButton")
  enableButton("rollDownButton")
  disableButton("rollRightButton")
  */
  }
    ////////////////////////////////////////////////////////////////
  // ROLL DOWN 'TO' LEFT FUNCTION/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  function  rollDownToLeft(){
    
    mixer_character.clipAction(characterAnim[5]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[5]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[5]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[5]).play();
    mixer_character.clipAction(characterAnim[2]).stop();
    console.log("Roll Down to Right Funtion triggered!")

      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = 180

      function negRotateGroup() {

        if(rotateDeg <= 90){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("layDownButton");
          enableButton("rollDownButton")
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg -= 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }
  }
  charStage = 2
  /*
  enableButton("layDownButton");
  disableButton("sitButton")
  disableButton("rollLeftButton")
  enableButton("rollDownButton")
  */
  }
  ////////////////////////////////////////////////////////////////
  // ROLLED LEFT TO SUPINE/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  function rolledLeftToLay(){
    
    mixer_character.clipAction(characterAnim[4]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[4]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[4]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[4]).play();
    mixer_character.clipAction(characterAnim[1]).stop();
    mixer_character.clipAction(characterAnim[5]).stop();
    console.log("Roll Left to Lay Funtion triggered!")

      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = 90

      function negRotateGroup() {

        if(rotateDeg <= 0){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("rollLeftButton");
          enableButton("rollRightButton");
          enableButton("sitButton");
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg -= 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }
  }
  charStage = 1
  /*
  enableButton("rollLeftButton");
  enableButton("rollRightButton");
  enableButton("sitButton");
  disableButton("rollDownButton")
  */
  }

  ////////////////////////////////////////////////////////////////
  // ROLLED RIGHT TO SUPINE/////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  function rolledRightToLay(){
    
    mixer_character.clipAction(characterAnim[9]).clampWhenFinished = true;
    mixer_character.clipAction(characterAnim[9]).setLoop(THREE.LoopOnce);
    mixer_character.clipAction(characterAnim[9]).setDuration(0.3);
    mixer_character.clipAction(characterAnim[9]).play();
    mixer_character.clipAction(characterAnim[7]).stop();
    mixer_character.clipAction(characterAnim[8]).stop();
    console.log("Roll Left to Lay Funtion triggered!")

      //distributing rotation of rotationGroup over an interval
      //so that stone dynamics can follow the path
      var rotateCanalInterval = setInterval(negRotateGroup,25)
      var rotateDeg = -90

      function negRotateGroup() {

        if(rotateDeg >= 0){
          clearInterval(rotateCanalInterval)
          rotationComplete = true
          enableButton("rollLeftButton");
          enableButton("rollRightButton");
          enableButton("sitButton");
        }
        else{
        rotationComplete = false
        disableAllButtons()
        rotateDeg += 0.3
        rotationGroup_right.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        rotationGroup_left.rotation.y = THREE.MathUtils.degToRad(rotateDeg);
        }
  }
  charStage = 1
  enableButton("rollLeftButton");
  enableButton("rollRightButton");
  enableButton("sitButton");
  disableButton("rollDownButton")
  }



  // clock
  const clock = new THREE.Clock()
  
  // loop
  const animate = () => {

    
    

    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()

    // you have to clear and call render twice because there are 2 scenes
    // one 3d scene and one 2d scene
    renderer.clear()
    renderer.render(scene, camera)
    renderer.clearDepth()
    renderer.render(scene2d, camera2d)
    
    renderer_right.clear()

    if(randomNumber < 3) {
    renderer_right.render(scene, camera_right)}
    else{
      renderer_right.render(scene,camera_left)
    }

    
    composer.render()

    if(innerEar && characterHead){
    innerEar.rotation.x = characterHead.rotation.x 
    innerEar.rotation.y = characterHead.rotation.y 
    innerEar.rotation.z = characterHead.rotation.z 
    canals.body.needUpdate = true

    innerEar_left.rotation.x = characterHead.rotation.x 
    innerEar_left.rotation.y = characterHead.rotation.y 
    innerEar_left.rotation.z = characterHead.rotation.z 
    canals_left.body.needUpdate = true

    }

var delta = clock.getDelta();




if ( mixer_character )        
    mixer_character.update( delta );
     ////////////////////////////////////
    function shortestDistance(object) {

      if(canals_left){
      var result: string = ""


      let greenArr = canals.children[1].children
      let redArr = canals.children[2].children
      let blueArr = canals.children[0].children
      let greyArr = canals.children[3].children

      let greenArr_left = canals_left.children[1].children
      let redArr_left = canals_left.children[2].children
      let blueArr_left = canals_left.children[0].children
      let greyArr_left = canals_left.children[3].children
    
    
      let minGreen = calculateMinDistance(greenArr,object)
      let minRed = calculateMinDistance(redArr,object)
      let minBlue = calculateMinDistance(blueArr,object)
      let minGrey = calculateMinDistance(greyArr,object)

      let minGreen_left = calculateMinDistance(greenArr_left,object)
      let minRed_left = calculateMinDistance(redArr_left,object)
      let minBlue_left = calculateMinDistance(blueArr_left,object)
      let minGrey_left = calculateMinDistance(greyArr_left,object)
    
      let allMins = [minRed, minGreen, minBlue, minRed_left, minGreen_left, minBlue_left, minGrey, minGreen_left]
    
    
      let minOfAll = 0.1
      let minOfAllIndex = -1
    
      let whichCanal = ""
    
      //determine the smallest of minGreen, minRed, minBlue
      for(var i = 0; i < allMins.length; i++){
    
    
        if(allMins[i] < minOfAll){
    
          minOfAll = allMins[i]
          minOfAllIndex = i
    
        }
      }
        if (minOfAllIndex == -1){
    
          result =  "You are in <font style='color:grey;'> GREY </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "Keep Trying"
        }
        if (minOfAllIndex == 0){
    
          result =  "You are in <font style='color:red;'> RIGHT RED </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "Keep Trying"
        }
        if (minOfAllIndex == 1){
    
          result =  "You are in <font style='color:green;'> RIGHT GREEN </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "Keep Trying"
        }
        if (minOfAllIndex == 2){
    
          result = "You are in <font style='color:blue;'> RIGHT BLUE </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "Keep Trying"
        }
        if (minOfAllIndex == 3){
    
          result =  "You are in <font style='color:red;'> LEFT RED </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "Keep Trying"
        }
        if (minOfAllIndex == 4){
    
          result =  "You are in <font style='color:green;'> LEFT GREEN </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "Keep Trying"
        }
        if (minOfAllIndex == 5){
    
          result = "You are in <font style='color:blue;'> LEFT BLUE </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "Keep Trying"
        }
        if (minOfAllIndex == 6){
    
          result =  "You are in <font style='color:grey;'> RIGHT GREY </font> canal!"
          document.getElementById("maneuverResultsText")!.innerHTML = "That was the correct maneuver!"
        }
        if (minOfAllIndex == 7){
    
          result =  "You are in <font style='color:grey;'> LEFT GREY </font> canal!"
          
        }
        return(result)
      }
      

      
    }
    
    //calculates the distance from every object
    //in a given array 'contentArr' to the specified 'object'
    //and returns the mimimum of those distances
    function calculateMinDistance(contentArr, object){
    
      //let distancesArr = []

      let distancesArr: any[] = [];
      
    
      for(var i = 0; i < contentArr.length; i++){
    
    
        //contentArr[i].matrixWorldNeedsUpdate = true
        var childPos = new THREE.Vector3()
        contentArr[i].getWorldPosition(childPos)

        var distanceSquared = childPos.distanceToSquared(object.position)
    
        distancesArr.push(distanceSquared)
        
        
      }
    
      //calculate the minimum of all distances 
      var min = Math.min.apply(Math, distancesArr)
    
      
      return min
    
    } 



    
    if(displayDiv && shortestDistance(sphere1) != undefined){
    displayDiv.innerHTML = shortestDistance(sphere1)!.toString()}
      

    ////////////////////////////////////
    
    
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

// '/ammo' is the folder where all ammo file are
PhysicsLoader('./ammo', () => MainScene())



