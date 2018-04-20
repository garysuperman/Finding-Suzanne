'use strict';
//basic
var camera, scene, renderer;
var geometry, material, mesh;
var controls, time = Date.now();
var objectLoader;
var textureLoader;
var jsonLoader;
var ray;
var yareyareSound;
//Enemy
var enemies, fireballs, spawned, swords, fireSound, chargeSound;
//Skybox
var skyGeo;
//level
var floor, trapWalls, wall, sentries, doors, doorSound, ceiling, elevator, lava, firstaid, platform, lights;
var wallMaterial, doorMaterial, sentryMaterial, ceilingMaterial, lavaMaterial, firstaidMaterial;
var soundtrack;
//HUD
var gun, health, reload, reloadRotation, fire, ammo, chainsaw, chainsawRotation, damageTaken, startTime;
var firenloadSound, loadSound, emptySound, firstaidSound, chainsawSound;
var raycaster, audioLoader, listener;
//BOSS
var suzanne, bossHealth;
var fingersR, fingersL, bigFireBall, bigFireBallOrg, bigFireBallDest;
var smashSound, painSound, handMaterial, mudaSound, deathSound;
var palm1R, palm2R, handR;
var palm1L, palm2L, handL;
//PointerLockAPI Implementation
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {
		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controls.enabled = true;
			blocker.style.display = 'none';
		} else {
			controls.enabled = false;
			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';
			instructions.style.display = '';
		}
	}
	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	}
	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
	instructions.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none';
		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		if ( /Firefox/i.test( navigator.userAgent ) ) {
			var fullscreenchange = function ( event ) {
				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
					element.requestPointerLock();
				}
			}
			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
			element.requestFullscreen();
		} else {
			element.requestPointerLock();
		}
	}, false );
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

function init(){
	//Basic
    damageTaken = 0;
    startTime = new Date();
	health = 100;
	reload = 35;
	fire = 20;
	ammo = 6;
    chainsawRotation = 25;
	reloadRotation = Math.PI * 2/reload;
    bossHealth = 1000;
	enemies = {'model'  : [], 
               'name'   : [], 
			   'health' : [],
			   'attack' : [],
			   'entry'  : []};
    swords = []
	fireballs = {'model'       : [],
				 'origin'      : [],
				 'destination' : [],
				 'caster'      : [],
				 'duration'    : [],
                 'sound'       : []}; 
	//spawnEvent trigger to stop
    lights = [];
	trapWalls = [];	
	spawned = [];
    for(var x = 0; x<20; x+= 1)
	   spawned.push(false)
    
    bigFireBall = []
    bigFireBall.push(null)
    bigFireBall.push(null)
    
    bigFireBallOrg = []
    bigFireBallOrg.push(null)
    bigFireBallOrg.push(null)
    
    bigFireBallDest = []
    bigFireBallDest.push(null)
    bigFireBallDest.push(null)
    
	objectLoader = new THREE.ObjectLoader();
	textureLoader = new THREE.TextureLoader();
    jsonLoader = new THREE.JSONLoader();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 5000 );
	scene = new THREE.Scene();
	camera.position.z = 0;
	
    //for sound
    audioLoader = new THREE.AudioLoader();
	listener = new THREE.AudioListener();
	camera.add( listener );
    
    fireSound = new THREE.Audio( listener );
	audioLoader.load( 'assets/fire/fire.mp3', function( buffer ) {
		fireSound.setBuffer( buffer );
		fireSound.setPlaybackRate(1)
		fireSound.setVolume( 1 );
	});
    
    chargeSound = new THREE.Audio( listener );
	audioLoader.load( 'assets/enemies/charge.mp3', function( buffer ) {
		chargeSound.setBuffer( buffer );
		chargeSound.setPlaybackRate(1)
		chargeSound.setVolume( 1 );
	});
    
    doorSound = new THREE.Audio( listener );
	audioLoader.load( 'assets/door/door.mp3', function( buffer ) {
		doorSound.setBuffer( buffer );
		doorSound.setPlaybackRate(1)
		doorSound.setVolume( 1 );
	});
    
    firstaidSound = new THREE.Audio( listener );
	audioLoader.load( 'assets/firstaid/firstaid.mp3', function( buffer ) {
		firstaidSound.setBuffer( buffer );
		firstaidSound.setPlaybackRate(1)
		firstaidSound.setVolume( 1.5 );
	});
    
    chainsawSound = new THREE.Audio( listener );
    audioLoader.load( 'assets/chainsaw/chainsaw.mp3', function( buffer ) {
		chainsawSound.setBuffer( buffer );
		chainsawSound.setPlaybackRate(1)
		chainsawSound.setVolume( 1 );
	});
    
    smashSound = new THREE.Audio( listener );
    audioLoader.load( 'assets/boss/smash.mp3', function( buffer ) {
		smashSound.setBuffer( buffer );
		smashSound.setPlaybackRate(1)
		smashSound.setVolume( 1.5 );
	});
    
    painSound = new THREE.Audio( listener );
    audioLoader.load( 'assets/boss/pain.mp3', function( buffer ) {
		painSound.setBuffer( buffer );
		painSound.setPlaybackRate(1)
		painSound.setVolume( 1.5 );
	});
    
    mudaSound = new THREE.Audio( listener );
    audioLoader.load( 'assets/boss/muda.mp3', function( buffer ) {
		mudaSound.setBuffer( buffer );
		mudaSound.setPlaybackRate(1)
		mudaSound.setVolume( 6 );
	});
    
    deathSound = new THREE.Audio( listener );
    audioLoader.load( 'assets/boss/wry.mp3', function( buffer ) {
		deathSound.setBuffer( buffer );
		deathSound.setPlaybackRate(1)
		deathSound.setVolume( 4.5 );
	});
    
    yareyareSound = new THREE.Audio( listener );
    audioLoader.load( 'assets/yareYareDaze.mp3', function( buffer ) {
		yareyareSound.setBuffer( buffer );
		yareyareSound.setPlaybackRate(1)
		yareyareSound.setVolume( 2 );
	});
    
    soundtrack = []
    soundtrack.push(new THREE.Audio( listener ))
    audioLoader.load( 'assets/soundtrack/01.mp3', function( buffer ) {
		soundtrack[0].setBuffer( buffer );
		soundtrack[0].setPlaybackRate(1)
		soundtrack[0].setVolume( 1 );
        soundtrack[0].setLoop( true );
        soundtrack[0].play()
	});
    
    soundtrack.push(new THREE.Audio( listener ))
    audioLoader.load( 'assets/soundtrack/02.mp3', function( buffer ) {
		soundtrack[1].setBuffer( buffer );
		soundtrack[1].setPlaybackRate(1)
		soundtrack[1].setVolume( 1 );
        soundtrack[1].setLoop( true );
	});
    
    soundtrack.push(new THREE.Audio( listener ))
    audioLoader.load( 'assets/soundtrack/03.mp3', function( buffer ) {
		soundtrack[2].setBuffer( buffer );
		soundtrack[2].setPlaybackRate(1)
		soundtrack[2].setVolume( 1 );
        soundtrack[2].setLoop( true );
	});
    
	//light
	//var light = new THREE.AmbientLight( 0x404040 );
    lights.push(new THREE.AmbientLight( 0x868686 ));
	lights[0].name = 'light'
	scene.add( lights[0] );
    
	//controls init
	controls = new PointerLockControls(camera)
	scene.add(controls.getObject());
	
	//HUD
	$('body').append('<div id="hud"><p>Health: <span id="health">100%</span><br />Ammo: <span id="ammo">6</span></p></div>');
	// Set up "hurt" flash
	$('body').append('<div id="hurt"></div>');
	$('#hurt').css({width: window.innerWidth, height: window.innerHeight,});
	
	//resizer
	window.addEventListener( 'resize', onWindowResize, false );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	$('#hurt').css({width: window.innerWidth , height: window.innerHeight,});
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function init3DModels(){
	var objectLoader = new THREE.ObjectLoader();
	var textureLoader = new THREE.TextureLoader();  
	
	//Skybox
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: textureLoader.load( "assets/night/night_px.jpg" )}));
	materialArray.push(new THREE.MeshBasicMaterial( { map: textureLoader.load( "assets/night/night_nx.jpg" )}));
	materialArray.push(new THREE.MeshBasicMaterial( { map: textureLoader.load( "assets/night/night_py.jpg" )}));
	materialArray.push(new THREE.MeshBasicMaterial( { map: textureLoader.load( "assets/night/night_ny.jpg" ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: textureLoader.load( "assets/night/night_pz.jpg" ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: textureLoader.load( "assets/night/night_nz.jpg" ) }));
	for (var i = 0; i < 6; i++)
	 materialArray[i].side = THREE.BackSide;
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyboxGeom = new THREE.CubeGeometry( 3000, 3000, 3000, 1, 1, 1 );
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
	skybox.name = 'skybox'
	scene.add( skybox );
}

function initWeapons(){
	//crosshair
	var radius   = 0.01,
		segments = 128,
		material = new THREE.LineBasicMaterial( { color: 0xffffff } ),
		geometry = new THREE.CircleGeometry( radius, segments );
	// Remove center vertex
	geometry.vertices.shift();
	var crosshair = new THREE.Line( geometry, material );
    crosshair.position.set(-0.1, 0, -2)
	camera.add( crosshair);
	
	//shotgun sound
	firenloadSound = new THREE.Audio( listener );
	audioLoader.load( 'assets/shotgun/fireandload.mp3', function( buffer ) {
		firenloadSound.setBuffer( buffer );
		firenloadSound.setPlaybackRate(1.5)
		firenloadSound.setVolume( 1 );
	});
	
	loadSound = new THREE.Audio( listener );
	audioLoader.load( 'assets/shotgun/load.mp3', function( buffer ) {
		loadSound.setBuffer( buffer );
		loadSound.setPlaybackRate(1.5)
		loadSound.setVolume( 1 );
	});
	
	emptySound = new THREE.Audio( listener );
	audioLoader.load( 'assets/shotgun/empty.mp3', function( buffer ) {
		emptySound.setBuffer( buffer );
		emptySound.setPlaybackRate(1)
		emptySound.setVolume( 1 );
	});
	
	//shotgun	
	objectLoader.load("assets/shotgun/shotgun.json",function ( obj ) {
		gun = obj;
        gun.name = 'shotgun'
        gun.position.set(1.5, -1.5, -2)
		gun.rotation.y = Math.PI;
		gun.scale.multiplyScalar(.60);
        gun.scale.x *= 2;
        gun.scale.z *= 0.9;
		camera.add(gun);
	});
	
	//reload shotgun
	window.addEventListener( 'keypress', function ( event ) {
		var key = event.which || event.keyCode;
		if((key == 82 || key === 114) && camera.getObjectByName('shotgun') != null){
			if(reload === 35 && fire === 20){
				reload = 0;
				ammo = 6;
				$('#ammo').html(ammo);
				if(loadSound.isPlaying)
					loadSound.stop();
				loadSound.play();
			} 
		}
		
	}, false );
	
    //CHAINSAW
	jsonLoader.load('assets/chainsaw/chainsaw.json', function (geometry, materials) {
		var material = new THREE.MultiMaterial(materials);
		chainsaw = new THREE.Mesh(geometry, material); 
        chainsaw.name ='chainsaw'
        chainsaw.position.set(1.5, -0.75, -1);
        chainsaw.rotation.y = 0.30
		chainsaw.scale.multiplyScalar(.45);
        scene.add(chainsaw)
	});
    
    //melee
	window.addEventListener( 'keypress', function ( event ) {
		var key = event.which || event.keyCode;
        if(camera.getObjectByName('shotgun') != null && (key == 70 || key == 102)){
            camera.remove(gun)
            camera.add(chainsaw)
            if(chainsawSound.isPlaying)
                chainsawSound.stop();
            chainsawSound.play();
			chainsawRotation = 24;
        }
	}, false );
    
	//shoot shot gun/attack with chainsaw
	window.addEventListener( 'mousedown', function ( event ) {
        var key = event.which || event.keyCode;
        if(key == 1 ){
            if(blocker.style.display === 'none'){
                if(fire === 20 && reload === 35 && ammo != 0 && camera.getObjectByName('shotgun') != null) {
                    fire = 0;
                    reload = 0;
                    ammo -= 1;
                    if(firenloadSound.isPlaying)
                        firenloadSound.stop();
                    firenloadSound.play();
                    $('#ammo').html(ammo);
                    //Raycaster
                    raycaster = new THREE.Raycaster();
                    var mouse = new THREE.Vector2();
                    mouse.x = 0;
                    mouse.y = 0; 
                    raycaster.setFromCamera(mouse, camera);
                    if(bossHealth > 200){
                        var intersects = raycaster.intersectObjects(enemies['model'], true);
                        if (intersects.length > 0) {	
                            var firstIntersectedObject  = intersects[0];
                            calculateDamageToEnemy(firstIntersectedObject.object.name)
                        }
                        else console.log('nothing')
                    }
                    else if(bossHealth > 0){       
                        var intersects = raycaster.intersectObjects(scene.children, true);
                        if (intersects.length > 0) {	
                            if(intersects[0].object.name == 'suzanne'){
                                bossHealth -= 20;
                                $('#bHealth').html(bossHealth+'%');
                                if(bossHealth > 0){
                                    if(mudaSound.isPlaying)
                                        mudaSound.stop
                                    mudaSound.play();
                                }
                            }
                        }
                        else console.log('nothing (suzanne)')
                    }
                }
                else if(ammo == 0 && camera.getObjectByName('shotgun') != null){
                    if(emptySound.isPlaying)
                        emptySound.stop();
                    emptySound.play();
                    console.log('empty');
                }   
            }
        }
	}, false );
}

function calculateDamageToEnemy(name){
	for(var x = 0; x < enemies['name'].length; x+=1){
		if(enemies['name'][x] === name){
            if(name.includes('gold') && enemies['health'][x] > 0){
                bossHealth -= 100;
                $('#bHealth').html(bossHealth+'%');
                if(painSound.isPlaying)
                    painSound.stop
                painSound.play();
            }
            enemies['health'][x] -= 100;
		}
	}
}

function spawnRedMonkey(x, y, z){
    //redMonkeyHead
	jsonLoader.load('assets/enemies/redMonkeyHead.json', function (geometry, materials) {
		var material = new THREE.MultiMaterial(materials);
		enemies['model'].push(new THREE.Mesh(geometry, material)); 
		var w = enemies['model'].length - 1;
		enemies['model'][w].scale.multiplyScalar(7);
		enemies['model'][w].position.set(x, 0, z)
		enemies['model'][w].name = 'red' + enemies['model'].length;
		enemies['name'].push(enemies['model'][w].name) 
		enemies['health'].push(100)             
		enemies['attack'].push(false)
		enemies['entry'].push(y)
		scene.add(enemies['model'][w]);
	});
}

function spawnGoldMonkey(x, y, z){
    //redMonkeyHead
	jsonLoader.load('assets/suzanne/suzanne-blender.json', function (geometry, materials) {
		var material = new THREE.MultiMaterial(materials);
		enemies['model'].push(new THREE.Mesh(geometry, material)); 
		var w = enemies['model'].length - 1;
		enemies['model'][w].scale.multiplyScalar(7);
		enemies['model'][w].position.set(x, 0, z)
		enemies['model'][w].name = 'gold1' + enemies['model'].length;
		enemies['name'].push(enemies['model'][w].name) 
		enemies['health'].push(100)             
		enemies['attack'].push(false)
		enemies['entry'].push(y)
		scene.add(enemies['model'][w]);
	});
}

function spawnGoldHornedMonkey(x, y, z){
    //redMonkeyHead
	jsonLoader.load('assets/suzanne/goldhorned.json', function (geometry, materials) {
		var material = new THREE.MultiMaterial(materials);
		enemies['model'].push(new THREE.Mesh(geometry, material)); 
		var w = enemies['model'].length - 1;
		enemies['model'][w].scale.multiplyScalar(7);
		enemies['model'][w].position.set(x, 0, z)
		enemies['model'][w].name = 'gold2' + enemies['model'].length;
		enemies['name'].push(enemies['model'][w].name) 
		enemies['health'].push(100)             
		enemies['attack'].push(false)
		enemies['entry'].push(y)
		scene.add(enemies['model'][w]);
	});
}

function spawnBlueMonkey(x, y, z){
    //blueMonkeyHead
	jsonLoader.load('assets/enemies/blueMonkeyHead.json', function (geometry, materials) {
		var material = new THREE.MultiMaterial(materials);
		enemies['model'].push(new THREE.Mesh(geometry, material)); 
		var w = enemies['model'].length - 1;
        enemies['model'][w].scale.multiplyScalar(7);
		enemies['model'][w].position.set(x, 0, z)
		enemies['model'][w].name = 'blue' + enemies['model'].length;
        enemies['name'].push(enemies['model'][w].name) 
        enemies['health'].push(100)  
        enemies['attack'].push(30)
        enemies['entry'].push(y)
        scene.add(enemies['model'][w]);
	});
}

function createWall(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	wall.push(new THREE.Mesh( geometry, wallMaterial));
	var index = wall.length - 1
	wall[index].position.set(x, y, z)
	scene.add(wall[index])
}

function createTrapWalls(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	trapWalls.push(new THREE.Mesh( geometry, wallMaterial));
	var index = trapWalls.length - 1
	trapWalls[index].position.set(x, y, z)
	scene.add(trapWalls[index])
}

function createDoors(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	doors.push(new THREE.Mesh( geometry, doorMaterial));
	var index = doors.length - 1
	doors[index].position.set(x, y, z)
	scene.add(doors[index])
}

function createFirstAid(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	firstaid.push(new THREE.Mesh( geometry, firstaidMaterial));
	var index = firstaid.length - 1
	firstaid[index].position.set(x, y, z)
    firstaid[index].name ='firstaid'
	scene.add(firstaid[index])
}

function createCeiling(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	ceiling.push(new THREE.Mesh( geometry, ceilingMaterial));
	var index = ceiling.length - 1
	ceiling[index].position.set(x, y, z)
	scene.add(ceiling[index])
}

function createPlatform(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	platform.push(new THREE.Mesh( geometry, sentryMaterial));
	var index = platform.length - 1
	platform[index].position.set(x, y, z)
	scene.add(platform[index])
}

function createLava(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	lava.push(new THREE.Mesh( geometry, lavaMaterial));
	var index = lava.length - 1
	lava[index].position.set(x, y, z)
    lava[index].name = 'lava'
	scene.add(lava[index])
}

function createElevator(h, w, d, x, y, z){
	geometry = new THREE.BoxGeometry( h, w, d ); 
	elevator.push(new THREE.Mesh( geometry, ceilingMaterial));
	var index = elevator.length - 1
	elevator[index].position.set(x, y, z)
    elevator[index].name ='elevator'
	scene.add(elevator[index])
}

function createSentry(rT, rB, h, rS, x, y, z){
	geometry = new THREE.CylinderGeometry( rT, rB, h, rS);
	sentries.push(new THREE.Mesh( geometry, sentryMaterial));
	var index = sentries.length - 1
	sentries[index].position.set(x, y, z)
	scene.add( sentries[index] );
}

function initLevel(){
	//floor
	var grass = textureLoader.load('assets/grass.png');
	grass.wrapS = THREE.RepeatWrapping;
	grass.wrapT = THREE.RepeatWrapping;
	grass.repeat.set( 64, 64 );
	
	geometry = new THREE.PlaneGeometry( 2000, 2000, 1, 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	material = new THREE.MeshPhongMaterial( { map : grass, specular: 0x000000 });
	floor = new THREE.Mesh( geometry, material, 0);
	floor.name = 'floor';
	scene.add( floor );
	
    var wallTexture = textureLoader.load( "assets/wall.jpg" );
    wallTexture.wrapS = THREE.RepeatWrapping;
	wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set( 2, 1 );
	wallMaterial = new THREE.MeshPhongMaterial( { map : wallTexture, specular: 0x000000 } );
	doorMaterial = new THREE.MeshPhongMaterial( { map : textureLoader.load("assets/door/door.jpeg"), specular: 0x000000 } );
    sentryMaterial = new THREE.MeshPhongMaterial( { map : textureLoader.load("assets/sentry2.jpg"), specular: 0x000000 } );
    var ceilingTexture = textureLoader.load( "assets/ceiling.jpg" )
    ceilingTexture.wrapS = THREE.RepeatWrapping;
	ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set( 16, 16);
	ceilingMaterial = new THREE.MeshPhongMaterial( { map :  ceilingTexture, specular: 0x000000} );
    var lavaTexture = textureLoader.load( "assets/lava.gif" )
    lavaTexture.wrapS = THREE.RepeatWrapping;
	lavaTexture.wrapT = THREE.RepeatWrapping;
    lavaTexture.repeat.set( 4, 4);
    lavaMaterial = new THREE.MeshPhongMaterial( { map :  lavaTexture, specular: 0x000000} );
    firstaidMaterial = new THREE.MeshPhongMaterial( { map : textureLoader.load("assets/firstaid/firstaid.png"), specular: 0x000000 } ); 
    handMaterial = new THREE.MeshPhongMaterial( { map : textureLoader.load("assets/boss/gold.png")} );
    wall = []
	sentries = [];
	doors = [];
    ceiling = [];
    elevator = [];
    lava = [];
    firstaid = [];
	platform = [];
    
	entryWay();
    combatArena1();
    lavaArena();
    bossRoom();
}


function entryWay(){
	
	//walls - funnel 1
	createWall(2, 45, 100, -20, 45/2, -20)
	createWall(2, 45, 100, 20, 45/2, -20)
	createDoors(37.5, 45, 0, 0, 45/2, 30)
    createCeiling(215, 0.5, 150, 0, 45, -40)
	
	//monkey sentry
    createSentry(11, 11, 25, 32, 0, 12.5, -100)
    
    //light
    lights.push(new THREE.PointLight( 0xffffff, 0.25 ))
    lights[1].position.set(0, 44, -90);
    scene.add( lights[1] );
	
	//trap walls
	createWall(100, 45, 2, 0, 45/2, -115)
    createWall(100, 45, 2, 0, 45/2 + 45, -115)//wall extension
	
	createTrapWalls(60, 45, 2, 80, -45/2 - 1, -115)
    createWall(60, 45, 2, 80, 45/2 + 45, -115)//wall extension
	createTrapWalls(60, 45, 2, -80, -45/2 - 1, -115)
    createWall(60, 45, 2, -80, 45/2 + 45, -115)//wall extension
    
	createWall(102, 45, 2, 67, 45/2, -85)
    wall[wall.length - 1].rotation.y += 0.35
    
	createWall(102, 45, 2, -67, 45/2, -85)
    wall[wall.length - 1].rotation.y -= 0.35
}

function combatArena1(){
    //west
	createWall(2, 45, 60, -105, 45/2, -127.5)
    createWall(2, 45, 60, -105, 45/2 + 45, -127.5)//wall extension
    createWall(2, 45, 95, -105, 45/2,      -205)
    createWall(2, 45, 95, -105, 45/2 + 45, -205)//wall extension
    createTrapWalls(2, 45, 70, -105, 45/2, -287)
    createWall(2, 45, 70, -105, 45/2 + 45, -287)//wall extension
    
    //east
	createWall(2, 45, 60, 105, 45/2, -127.5)
    createWall(2, 45, 60, 105, 45/2 + 45, -127.5)//wall extension
    createWall(2, 45, 95, 105, 45/2,      -205)
    createWall(2, 45, 95, 105, 45/2 + 45, -205)//wall extension
    createWall(2, 45, 70, 105, 45/2,      -287)
    createWall(2, 45, 70, 105, 45/2 + 45, -287)//wall extension
	
    //north
	createWall(70, 45, 2, -70, 45/2,      -322)
    createWall(70, 45, 2, -70, 45/2 + 45, -322)//wall extension
    createTrapWalls(70, 45, 2, 70, 45/2,  -322)
    createWall(70, 45, 2, 70, 45/2 + 45,  -322)//wall extension
    createWall(70, 45, 2, 0, 45/2, -322)
    createWall(70, 45, 2, 0, 45/2 + 45, -322)//wall extension
    
    createCeiling(220, 0.5, 210, 0, 45*2, -220)
    
	//monkey sentries'
	createSentry(11, 11, 40, 32, 85, 20, -150)
    createSentry(11, 11, 20, 32, 85, 10, -200)
    createSentry(11, 11, 30, 32, 85, 15, -250)
    createSentry(11, 11, 25, 32, 85, 25/2, -300)
    
    createSentry(11, 11, 15, 32, -85, 7.5, -150)
    createSentry(11, 11, 30, 32, -85, 15, -200)
    createSentry(11, 11, 20, 32, -85, 10, -250)
    createSentry(11, 11, 30, 32, -85, 15, -300)
    
    createSentry(4, 4, 8, 32, 0, 4, -225)
	//suzanne
    jsonLoader.load('assets/suzanne/suzanne-blender.json', function (geometry, materials) {
		var material = new THREE.MultiMaterial(materials);
		suzanne = new THREE.Mesh(geometry, material); 
        suzanne.scale.multiplyScalar(2);
		suzanne.position.y = 12;
		suzanne.position.z = -225;
		suzanne.name = 'suzanne'
		scene.add(suzanne);
	});
    
    //light
    lights.push( new THREE.PointLight( 0xffffff, 0.25 ));
    lights[2].position.set(0, 88, -225);
    scene.add( lights[2] );
    
}

function lavaArena(){
    //elevator/south
    createWall(70, 45, 2, -140, 45/2,      -322)
    createWall(70, 45, 2, -140, 45/2 + 45, -322)//wall extension
    createWall(70, 45, 2, -140, 45/2,      -252)
    createWall(70, 45, 2, -140, 45/2 + 45, -252)//wall extension
    createWall(2, 45, 70, -175, 45/2, -287)
    createElevator(70, 1, 70, -140, 0, -287)
	
    //lava
    createLava(70, 1, 70, -210, 9, -287)
    createLava(70, 1, 70, -280, 9, -287)
    createLava(70, 1, 70, -140, 9, -357)
    createLava(70, 1, 70, -210, 9, -357)
    createLava(70, 1, 70, -280, 9, -357)
    createLava(70, 1, 70, -140, 9, -427)   
    createLava(70, 1, 70, -210, 9, -427)
    createLava(70, 1, 70, -280, 9, -427)
    createLava(70, 1, 70, -140, 9, -497)
    createLava(70, 1, 70, -210, 9, -497)
    createLava(70, 1, 70, -280, 9, -497)
    
    //arena
    //south
    createWall(70, 45, 2, -210, 45/2,      -252)
    createWall(70, 45, 2, -210, 45/2 + 45, -252)//wall extension
    createWall(70, 45, 2, -280, 45/2,      -252)
    createWall(70, 45, 2, -280, 45/2 + 45, -252)//wall extension
    
    //west
    createWall(2, 45, 70, -315, 45/2, -287)
    createWall(2, 45, 70, -315, 45/2 +45, -287)//wall extension
    createWall(2, 45, 70, -315, 45/2, -357)
    createWall(2, 45, 70, -315, 45/2 +45, -357)//wall extension
    createWall(2, 45, 70, -315, 45/2, -427)
    createWall(2, 45, 70, -315, 45/2 +45, -427)//wall extension
    createWall(2, 45, 70, -315, 45/2, -497)
    createWall(2, 45, 70, -315, 45/2 +45, -497)//wall extension
    
    //east
    createWall(2, 45, 70, -105, 45/2, -357)
    createWall(2, 45, 70, -105, 45/2 + 45, -357)//wall extension
    createWall(2, 45, 70, -105, 45/2, -427)
    createWall(2, 45, 70, -105, 45/2 + 45, -427)//wall extension
    createWall(2, 45, 70, -105, 45/2, -497)
    createWall(2, 45, 70, -105, 45/2 + 45, -497)//wall extension
    
    //north
    createWall(70, 45, 2, -140, 45/2,      -532)
    createWall(70, 45, 2, -140, 45/2 + 45, -532)//wall extension
    createWall(70, 45, 2, -210, 45/2,      -532)
    //createTrapWalls(70, 45, 2, -210, 45/2 + 45, -532)//wall extension
    createWall(70, 45, 2, -280, 45/2,      -532)
    createWall(70, 45, 2, -280, 45/2 + 45, -532)//wall extension
    //ceiling
    createCeiling(220, 0.5, 285, -215, 45*2, -395)
    
    //platfroms
	createSentry(11, 11, 40, 32,  -200, 20, -287) 
	createPlatform(9, 0.5, 45, -200, 39.5, -315) 
	createSentry(11, 11, 30, 32,  -200, 15, -354)
	createPlatform(11, 0.5, 75, -216, 29, -385)
	platform[platform.length - 1].rotation.y = 0.5
	createSentry(11, 11, 30, 32,  -250, 15, -427)
    createSentry(11, 11, 35, 32,  -230, 35/2, -448)
    createSentry(11, 11, 40, 32,  -210, 20, -469)
    createSentry(11, 11, 45, 32,  -190, 45/2, -490)
	createPlatform(11, 0.5, 35, -190, 44, -515)
    createFirstAid(5, 2.5, 5, -190, 48.5, -515)
    
    lights.push(new THREE.PointLight( 0xff0000, 1 ));
    lights[3].position.set(-250, 88, -427);
}

function bossRoom(){
    //west
    createWall(2, 45, 70, -250, 45/2, -567)
    createWall(2, 45, 70, -250, 45/2 + 45, -567) //wall extension
    createWall(2, 45, 70, -250, 45/2, -637)
    createWall(2, 45, 70, -250, 45/2 + 45, -637) //wall extension
    createWall(2, 45, 70, -250, 45/2, -707) 
    createWall(2, 45, 70, -250, 45/2 + 45, -707) //wall extension
    
    //north
    createWall(70, 45, 2, -280, 45/2,      -740)
    createWall(70, 45, 2, -280, 45/2 + 45, -740) //wall extension
    createWall(70, 45, 2, -210, 45/2,      -740)
    createWall(70, 45, 2, -210, 45/2 + 45, -740) //wall extension
    createWall(70, 45, 2, -140, 45/2,      -740)
    createWall(70, 45, 2, -140, 45/2 + 45, -740) //wall extension
    createWall(70, 45, 2, -70, 45/2,      -740)
    createWall(70, 45, 2, -70, 45/2 + 45, -740) //wall extension
    createWall(70, 45, 2, -0, 45/2,      -740)
    createWall(70, 45, 2, -0, 45/2 + 45, -740) //wall extension
    createWall(70, 45, 2, 70, 45/2,      -740)
    createWall(70, 45, 2, 70, 45/2 + 45, -740) //wall extension
    
    
    //east
    createWall(2, 45, 70, 105, 45/2     , -357)
    createWall(2, 45, 70, 105, 45/2 + 45, -357)//wall extension
    createWall(2, 45, 70, 105, 45/2     , -427)
    createWall(2, 45, 70, 105, 45/2 + 45, -427)//wall extension
    createWall(2, 45, 70, 105, 45/2     , -497)
    createWall(2, 45, 70, 105, 45/2 + 45, -497)//wall extension
    createWall(2, 45, 70, 105, 45/2     , -567)
    createWall(2, 45, 70, 105, 45/2 + 45, -567)//wall extension
    createWall(2, 45, 70, 105, 45/2     , -637)
    createWall(2, 45, 70, 105, 45/2 + 45, -637)//wall extension
    createWall(2, 45, 70, 105, 45/2     , -707)
    createWall(2, 45, 70, 105, 45/2 + 45, -707)//wall extension
    
    //middle alter
    createSentry(11, 11, 55, 32,  80, 55/2, -715)
    //east alters
    createSentry(11, 11, 45, 32,  95, 45/2, -687)
    createSentry(11, 11, 35, 32,  95, 35/2, -662)
    createSentry(11, 11, 25, 32,  95, 25/2, -637)
    createSentry(11, 11, 15, 32,  95, 15/2, -612)
    //north alter
    createSentry(11, 11, 45, 32,  50, 45/2, -730)
    createSentry(11, 11, 35, 32,  25, 35/2, -730)
    createSentry(11, 11, 25, 32,  0, 25/2, -730)
    createSentry(11, 11, 15, 32,  -25, 15/2, -730)
    
    //golden trap
    //createSentry(4, 4, 8, 32, 50, 4, -687)
    createHandRight(60, 4, -695);
    handR.lookAt(50, 4, -687);
    //createHandLeft(45, 4, -600)
}

function createHandRight(x, y, z){
    //hand
    var handGeo = new THREE.SphereGeometry( 1, 1, 1 );
	var handMat = new THREE.MeshPhongMaterial( {color: 0xffffff, specular: 0x000000 } );
    handR = new THREE.Mesh( handGeo, handMat )
    handR.position.set(x, y, z)
    handR.scale.multiplyScalar(2);
    handR.name = 'handR';
    scene.add(handR)
    
    //palm
    var palm2Geo = new THREE.BoxGeometry( 12, 8, 2.5 ); 
    palm2R = new THREE.Mesh( palm2Geo, handMaterial)
    palm2R.position.y = 4 + 4.5;
    
    //flex
    palm2R.rotation.x += 0.5;
    palm2R.position.z += 2;
    palm2R.position.y -= 0.5;
    
    var palm1Geo = new THREE.BoxGeometry( 10, 9, 2.5 ); 
    palm1R = new THREE.Mesh( palm1Geo, handMaterial)
    palm1R.add(palm2R)
    handR.add(palm1R);
   
    fingersR = []
    var fingerGeo = new THREE.BoxGeometry( 1.75, 3, 1.75 ); 
    var fingerGeo1 = new THREE.BoxGeometry( 1.75, 7, 1.75 ); 
    for(var x = 0; x<4; x+=1){
        fingersR.push(new THREE.Mesh( fingerGeo1, handMaterial));
        fingersR.push(new THREE.Mesh( fingerGeo, handMaterial));
        fingersR.push(new THREE.Mesh( fingerGeo, handMaterial));
    }
    
    var y = 0
    //regular right fingers
    for(var x = 0; x<4; x+=1){
        fingersR[y+2].position.y = 3;
        fingersR[y+1].add(fingersR[y+2]);
        fingersR[y+1].position.y = 1.5 + 3.5;
        fingersR[y].add(fingersR[y+1]);
        fingersR[y].position.y = 5;
        fingersR[y].position.x = 3*x-5;
        palm2R.add(fingersR[y])
        y+=3;
    }   
    
    for(var x = 0; x<12; x+=1){
        fingersR[x].rotation.x += 1;
        fingersR[x].position.z += 1.5;
        fingersR[x].position.y -= 1;
    }
    
    //thumb
    fingersR.push(new THREE.Mesh( fingerGeo, handMaterial));
    fingersR.push(new THREE.Mesh( fingerGeo, handMaterial));
    fingersR[13].position.y = 3;
    fingersR[12].add(fingersR[13]);
    fingersR[12].position.x = 7;
    fingersR[12].rotation.y = -1.5;
    palm2R.add(fingersR[12])
    
    for(var x = 12; x<14; x+=1){
        fingersR[x].rotation.x += 1;
        fingersR[x].position.z += 1;
        fingersR[x].position.y -= 1;
    }
    
    
    window.addEventListener( 'keypress', function ( event ) {
		var key = event.which || event.keyCode;
        if(key == 73 || key == 105){
            flexRightHand()
        }
        if(key == 79 || key == 111){
        }
        
	}, false );
}

var flexedRight = 1;
function flexRightHand(){
    if(flexedRight == 6)
        flexedRight = 0;
    if(flexedRight <= 2 ){
        flexedRight += 1;
        palm2R.rotation.x += 0.5;
        palm2R.position.z += 0.5;
        palm2R.position.y -= 0.75;
        for(var x = 0; x<14; x+=1){
            fingersR[x].rotation.x += 0.5;
            fingersR[x].position.z += 0.5;
            fingersR[x].position.y -= 0.5;
        }
    }else if(flexedRight <= 5 ){
        flexedRight += 1;
        palm2R.rotation.x -= 0.5;
        palm2R.position.z -= 0.5;
        palm2R.position.y += 0.75;
        for(var x = 0; x<14; x+=1){
            fingersR[x].rotation.x -= 0.5;
            fingersR[x].position.z -= 0.5;
            fingersR[x].position.y += 0.5;
        }
    }
}

function createHandLeft(x, y, z){
    //hand
    var handGeo = new THREE.SphereGeometry( 1, 1, 1 );
	var handMat = new THREE.MeshPhongMaterial( {color: 0xffffff, specular: 0x000000} );
    handL = new THREE.Mesh( handGeo, handMat )
    handL.position.set(x, y, z)
    handL.scale.multiplyScalar(2);
    handL.name = 'handL';
    scene.add(handL)
    
    //palm
    var palm2Geo = new THREE.BoxGeometry( 12, 8, 2.5 ); 
    palm2L = new THREE.Mesh( palm2Geo, handMaterial)
    palm2L.position.y = 4 + 4.5;
    
    //flex
    palm2L.rotation.x += 0.5;
    palm2L.position.z += 2;
    palm2L.position.y -= 0.5;
    
    var palm1Geo = new THREE.BoxGeometry( 10, 9, 2.5 ); 
    palm1L = new THREE.Mesh( palm1Geo, handMaterial)
    palm1L.add(palm2L)
    handL.add(palm1L);
   
    fingersL = []
    var fingerGeo = new THREE.BoxGeometry( 1.75, 3, 1.75 ); 
    var fingerGeo1 = new THREE.BoxGeometry( 1.75, 7, 1.75 ); 
    for(var x = 0; x<4; x+=1){
        fingersL.push(new THREE.Mesh( fingerGeo1, handMaterial));
        fingersL.push(new THREE.Mesh( fingerGeo, handMaterial));
        fingersL.push(new THREE.Mesh( fingerGeo, handMaterial));
    }
    
    var y = 0
    //regular right fingers
    for(var x = 0; x<4; x+=1){
        fingersL[y+2].position.y = 3;
        fingersL[y+1].add(fingersL[y+2]);
        fingersL[y+1].position.y = 1.5 + 3.5;
        fingersL[y].add(fingersL[y+1]);
        fingersL[y].position.y = 5;
        fingersL[y].position.x = 3*x-5;
        palm2L.add(fingersL[y])
        y+=3;
    }   
    
    for(var x = 0; x<12; x+=1){
        fingersL[x].rotation.x += 1;
        fingersL[x].position.z += 1.5;
        fingersL[x].position.y -= 1;
    }
    
    //thumb
    fingersL.push(new THREE.Mesh( fingerGeo, handMaterial));
    fingersL.push(new THREE.Mesh( fingerGeo, handMaterial));
    fingersL[13].position.y = 3;
    fingersL[12].add(fingersL[13]);
    fingersL[12].position.x = -7;
    fingersL[12].rotation.y = 1.5;
    palm2L.add(fingersL[12])
    
    for(var x = 12; x<14; x+=1){
        fingersL[x].rotation.x += 1;
        fingersL[x].position.z += 1;
        fingersL[x].position.y -= 1;
    }
}

var flexedLeft = 1;
function flexLeftHand(){
    if(flexedLeft == 6)
        flexedLeft = 0;
    if(flexedLeft <= 2){
        flexedLeft += 1;
        palm2L.rotation.x += 0.5;
        palm2L.position.z += 0.5;
        palm2L.position.y -= 0.75;
        for(var x = 0; x<14; x+=1){
            fingersL[x].rotation.x += 0.5;
            fingersL[x].position.z += 0.5;
            fingersL[x].position.y -= 0.5;
        }
    }else if(flexedLeft <= 5){
        flexedLeft += 1;
        palm2L.rotation.x -= 0.5;
        palm2L.position.z -= 0.5;
        palm2L.position.y += 0.75;
        for(var x = 0; x<14; x+=1){
            fingersL[x].rotation.x -= 0.5;
            fingersL[x].position.z -= 0.5;
            fingersL[x].position.y += 0.5;
        }
    }
}

function updateHUD(){
	//Fire animation
    if(camera.getObjectByName('shotgun') != null){
        if(fire < 10){
            gun.rotation.x += 0.1;
            gun.rotation.y += 0.05;
            fire += 1;
        }
        else if(fire >= 10 && fire < 20){
            gun.rotation.x -= 0.1;
            gun.rotation.y -= 0.05;
            fire += 1;
        }
        else if(fire == 20 && reload < 35){
            //gun cocking animation
            gun.rotation.x += reloadRotation;
            reload += 1;
        }
    }
    if(camera.getObjectByName('chainsaw') != null){
        if(chainsawRotation != 25){
			var chainsawAnimation = Math.PI * 2/75;
			if(chainsawRotation > 10){
                chainsaw.position.z -= chainsawAnimation
                //Raycaster
                raycaster = new THREE.Raycaster();
                var mouse = new THREE.Vector2();
                mouse.x = 0;
                mouse.y = 0; 
                raycaster.setFromCamera(mouse, camera);
                raycaster.far = 25
                var intersects = raycaster.intersectObjects(enemies['model'], true);
                if (intersects.length > 0) {	
                    var firstIntersectedObject  = intersects[0];
                    calculateDamageToEnemy(firstIntersectedObject.object.name)
                }
                else console.log('nothing') 
            }
			else chainsaw.position.z += chainsawAnimation
			chainsawRotation -= 1;
			if(chainsawRotation == -1){
				chainsaw.position.set(1.5, -0.75, -1);
				chainsawRotation = 25;
				camera.add(gun)
				camera.remove(chainsaw)
			}
		}
    } 
}

function suzanneAI(){
	if(suzanne){
        var x = controls.getObject().position.x,
            y = controls.getObject().position.y,
            z = controls.getObject().position.z;
        if(suzanne.scale.y >= 2){
            if(spawned[1] === false ){
                suzanne.rotation.x -= 0.01;
                suzanne.rotation.y -= 0.01;
                suzanne.rotation.z -= 0.01;
            }
            else if(spawned[2] === true && bossHealth > 0){
                suzanne.lookAt(x, y, z);
            }
            else if(bossHealth == 0){
                suzanne.rotation.y += 0.075;
            }
        }
	}
}

function spawnBigFireBall(origin){ 
    var x = controls.getObject().position.x,
	    y = controls.getObject().position.y,
		z = controls.getObject().position.z,
        ox = origin.position.x,
	    oy = origin.position.y,
        oz = origin.position.z;
    
    if(origin.name == 'handR'){
        if(!scene.getObjectByName('bigFireBallR')){
            var geometry = new THREE.SphereGeometry( 5, 32, 32 );
            var material = new THREE.MeshBasicMaterial({map : textureLoader.load( "assets/fire/fire.jpg" )});
            bigFireBall[0] = new THREE.Mesh( geometry, material );
            bigFireBall[0].position.set(ox, 425, oz);
            bigFireBall[0].name = 'bigFireBallR';
            bigFireBallOrg[0] = new THREE.Vector3(ox, 400, oz)
            bigFireBallDest[0] =  new THREE.Vector3(x, y, z);
            scene.add(bigFireBall[0])
            fireSound.setVolume( 2 );
            fireSound.play()
        }
        else if(bigFireBall[0].scale.x < 10){
            bigFireBall[0].scale.x += 0.20;
            bigFireBall[0].scale.y += 0.20;
            bigFireBall[0].scale.z += 0.20;
            origin.lookAt(x, y, z)
        }
        else if(bigFireBall[0].scale.x > 10 && bigFireBall[0].scale.x < 10.2){
            bigFireBall[0].scale.x +=0.20;
            bigFireBall[0].scale.y +=0.20;
            bigFireBall[0].scale.z +=0.20;
            orientPointerRight(1)
        }
        else if(bigFireBall[0].position.y <= -60){
            orientPointerRight(-1)
            scene.remove(bigFireBall[0])
        }
        else if(bigFireBall[0].position.y > -60 && scene.getObjectByName('bigFireBallR')){
            var speed = 50*(bossHealth/200);
            if(speed < 25)
                speed = 25;
            var difX = (bigFireBallDest[0].x - bigFireBallOrg[0].x)/speed;
            bigFireBall[0].position.x += difX;
            var difY = (bigFireBallDest[0].y - bigFireBallOrg[0].y)/speed;
            bigFireBall[0].position.y += difY;
            var difZ = (bigFireBallDest[0].z - bigFireBallOrg[0].z )/speed;
            bigFireBall[0].position.z += difZ;
        }
        bigFireBall[0].rotation.x += 0.01;
        bigFireBall[0].rotation.z += 0.01;
    }
    else if(origin.name == 'handL'){
        if(!scene.getObjectByName('bigFireBallL')){
            var geometry = new THREE.SphereGeometry( 5, 32, 32 );
            var material = new THREE.MeshBasicMaterial({map : textureLoader.load( "assets/fire/fire.jpg" )});
            bigFireBall[1] = new THREE.Mesh( geometry, material );
            bigFireBall[1].position.set(ox, 425, oz);
            bigFireBall[1].name = 'bigFireBallL';
            bigFireBallOrg[1] = new THREE.Vector3(ox, 400, oz)
            bigFireBallDest[1] =  new THREE.Vector3(x, y, z);
            scene.add(bigFireBall[1])
            fireSound.setVolume( 2 );
            fireSound.play()
        }
        else if(bigFireBall[1].scale.x < 18){
            bigFireBall[1].scale.x += 0.20;
            bigFireBall[1].scale.y += 0.20;
            bigFireBall[1].scale.z += 0.20;
            origin.lookAt(x, y, z)
        }
        else if(bigFireBall[1].scale.x > 18 && bigFireBall[1].scale.x < 18.2){
            bigFireBall[1].scale.x +=0.20;
            bigFireBall[1].scale.y +=0.20;
            bigFireBall[1].scale.z +=0.20;
            orientPointerLeft(1)
        }
        else if(bigFireBall[1].position.y <= -60){
            orientPointerLeft(-1)
            scene.remove(bigFireBall[1])
        }
        else if(bigFireBall[1].position.y > -60 && scene.getObjectByName('bigFireBallL')){
            var speed = 80*(bossHealth/200);
            if(speed < 40)
                speed = 40;
            var difX = (bigFireBallDest[1].x - bigFireBallOrg[1].x)/speed;
            bigFireBall[1].position.x += difX;
            var difY = (bigFireBallDest[1].y - bigFireBallOrg[1].y)/speed;
            bigFireBall[1].position.y += difY;
            var difZ = (bigFireBallDest[1].z - bigFireBallOrg[1].z )/speed;
            bigFireBall[1].position.z += difZ;
        }
        bigFireBall[1].rotation.x += 0.01;
        bigFireBall[1].rotation.z += 0.01;
    }  
}

function orientPointerRight(orient){
    for(var x = 0; x<4; x+=1){
        palm2R.rotation.x += 0.5*orient;
        palm2R.position.z += 0.5*orient;
        palm2R.position.y += -0.75*orient;
    }
}

function orientPointerLeft(orient){
    for(var x = 0; x<4; x+=1){
        palm2L.rotation.x += 0.5*orient;
        palm2L.position.z += 0.5*orient;
        palm2L.position.y += -0.75*orient;
    }
}

function spawnEvent(){
	var x = controls.getObject().position.x,
	    y = controls.getObject().position.y,
		z = controls.getObject().position.z;
	if(suzanne && spawned[5] === false)	
        var playerToBoss = suzanne.position.distanceTo(controls.getObject().position);
    else if(spawned[5] === false)
        playerToBoss = 100
    
    //sequential triggers based on position
	if(z < 0 && spawned[0] === false){
		spawned[0] = true;
		spawnRedMonkey(0, 35, -100)
	}
	else if(z < -200 && spawned[1] === false){
        if(doorSound.isPlaying)
            doorSound.stop()
        doorSound.play()
        scene.remove(lights[0])
        lights[0] = new THREE.AmbientLight( 0x2c2c2c )
        scene.add(lights[0])
        scene.remove(lights[1])
        scene.remove(lights[2])
        spawnRedMonkey(85, 50, -150)
		spawnRedMonkey(85, 30, -200)
		spawnRedMonkey(85, 40, -250)
		spawnRedMonkey(85, 35, -300)
		spawnRedMonkey(-85, 25, -150)
		spawnRedMonkey(-85, 40, -200)
		spawnRedMonkey(-85, 30, -250)
		spawnRedMonkey(-85, 40, -300)
        spawned[1] = true;
	}
	else if(z < -260 && x < -120 && spawned[2] === false && spawned[1] === true){
		spawned[2] = true
        if(doorSound.isPlaying)
            doorSound.stop()
        doorSound.play()
	}
    else if(z < -346 && x < -190 && spawned[3] === false && spawned[2] === true){
        spawned[3] = true
        spawnBlueMonkey(-190, 35, -427)
        spawnBlueMonkey(-115, 25, -375)
        spawnBlueMonkey(-115, 25, -427)
        spawnBlueMonkey(-310, 35, -375)
        spawnBlueMonkey(-310, 15, -287)
    }
    
    else if(z < - 445 && x < -220 && spawned[4] === false && spawned[3] === true){
        spawned[4] = true; 
        spawnBlueMonkey(-250, 40, -450)
        spawnBlueMonkey(-300, 40, -350)
        spawnBlueMonkey(-145, 40, -350)
        spawnBlueMonkey(-115, 40, -400)
        spawnBlueMonkey(-115, 40, -450)
        spawnBlueMonkey(-145, 40, -500)
    }
    else if(playerToBoss < 65 && spawned[2] === true && spawned[5] === false && spawned[4] === true){
        spawned[5] = true;   
        soundtrack[0].stop()
        soundtrack[1].play()
        flexRightHand();
    }
    else if(spawned[5] === true && spawned[6] === false && handR.position.y === -25){
        spawned[6] = true;   
        suzanne.scale.multiplyScalar(35);
        suzanne.position.set(155, 8, -787) //y = 200
        handR.position.set(10, -30, -787) 
        createHandLeft(150, -30, -647);
        for(var x = 0; x<5; x+=1)
            flexLeftHand();
        for(var x = 0; x<4; x+=1)
            flexRightHand();
        handL.scale.multiplyScalar(3);
        handR.scale.multiplyScalar(3);
        handR.lookAt(0, 15/2, -610);
        handL.lookAt(0, 15/2, -640);
    }
    else if(spawned[6] === true && spawned[7] === false && handR.position.y >= 30){
        spawned[7] = true;
        flexRightHand();
        smashSound.play();
    }	
    else if(spawned[7] === true && spawned[8] === false && handL.position.y >= 30){
        spawned[8] = true;
        flexLeftHand();
        smashSound.play();
    }	
    else if(spawned[8] === true && spawned[9] === false &&  suzanne.position.y >= 200){
        spawned[9] = true;
        //add healthbar of boss
        $('body').append('<div id="bossHealth"><p>Golden Suzanne: <span id="bHealth">1000%</span></p></div>');
        //Golden Guardians
        spawnGoldMonkey(95, 55, -687)
        spawnGoldMonkey(95, 45, -662)
        spawnGoldMonkey(95, 35, -637)
        spawnGoldHornedMonkey(95, 25, -612)
        spawnGoldMonkey(50, 55, -730)
        spawnGoldMonkey(25, 45, -730)
        spawnGoldMonkey(0, 35, -730)
        spawnGoldHornedMonkey(-25, 25, -730)
    }	
    else if(spawned[9] === true && spawned[10] === false && bossHealth === 200){
        fireSound.stop()
        spawned[10] = true;
        //Right hand frieza position
        flexRightHand();
        flexRightHand();
        for(var x = 0; x<4; x+=1){
            palm2R.rotation.x -= 0.5;
            palm2R.position.z -= 0.5;
            palm2R.position.y += 0.75;
        }
        for(var x = 0; x<4; x+=1){
            fingersR[9].rotation.x -= 0.5;
            fingersR[9].position.z -= 0.5;
            fingersR[9].position.y += 0.5;
            fingersR[10].rotation.x -= 0.5;
            fingersR[10].position.z -= 0.5;
            fingersR[10].position.y += 0.5;
            fingersR[11].rotation.x -= 0.5;
            fingersR[11].position.z -= 0.5;
            fingersR[11].position.y += 0.5;
        }
        //Left hand
        flexLeftHand();
        flexLeftHand();
        for(var x = 0; x<4; x+=1){
            palm2L.rotation.x -= 0.5;
            palm2L.position.z -= 0.5;
            palm2L.position.y += 0.75;
        }
        for(var x = 0; x<4; x+=1){
            fingersL[0].rotation.x -= 0.5;
            fingersL[0].position.z -= 0.5;
            fingersL[0].position.y += 0.5;
            fingersL[1].rotation.x -= 0.5;
            fingersL[1].position.z -= 0.5;
            fingersL[1].position.y += 0.5;
            fingersL[2].rotation.x -= 0.5;
            fingersL[2].position.z -= 0.5;
            fingersL[2].position.y += 0.5;
        }
    }
    else if(spawned[10] === true && spawned[11] === false && handR.position.y == 110){
        spawned[11] = true;
    }
    else if(spawned[11] === true && spawned[12] === false && bossHealth == 0){
        spawned[12] = true;
        soundtrack[1].stop()
        deathSound.play();
        scene.remove(bigFireBall[0])
        scene.remove(bigFireBall[1])
    }
    else if(spawned[12] === true && spawned[13] === false && handR.position.y <= -75 &&  suzanne.position.y <= 12){
        spawned[13] = true;
        soundtrack[2].play();
    }
    
    //transitions and context based events
	if(spawned[1] === true && trapWalls[0].position.y != 45/2){
		trapWalls[0].position.y += 0.5
		trapWalls[1].position.y += 0.5
	}
    if(spawned[1] === true && spawned[2] === false && suzanne.position.y > -1){
        suzanne.position.y -= 0.5;
    }
	if(spawned[1] === true && enemies['model'].length == 0 && spawned[2] === false && trapWalls[2].position.y > -45/2 - 1){
		trapWalls[2].position.y -= 0.5; //lava room entrance
        //trapWalls[3].position.y -= 0.5; //boss room exit
	}
    if(spawned[1] === true && enemies['model'].length == 0 && spawned[2] === false && trapWalls[2].position.y === 45/2 - 1 && !doorSound.isPlaying){
        createFirstAid(5, 2.5, 5, 0, 10, -225)
        doorSound.play()
        //light
        scene.remove(lights[0])
        lights[0] = new THREE.AmbientLight( 0x868686 )
        scene.add(lights[0])
        scene.add(lights[1])
        scene.add(lights[2])
        scene.add(lights[3]);
	}
    if(scene.getObjectByName('firstaid') != null){
        for(var x = 0; x < firstaid.length; x+=1)
            firstaid[x].rotation.y += 0.01;
    }
	if(spawned[2] === true && elevator[0].position.y < 45){
        elevator[0].position.y += 0.5;
	}
    if(spawned[2]==true && spawned[6]==false && suzanne.position.z != -687 && suzanne.position.x != 50){
        suzanne.position.set(50, 12, -687)
    }
    if(spawned[2] === true && elevator[0].position.y == 45 && elevator[0].name != 'done'){
        elevator[0].name = 'done'
        spawnBlueMonkey(-185, 55, -287)
	}
    if(spawned[5] === true && spawned[6] === false && handR.position.y > -25){
        handR.position.y -= 0.5;
        suzanne.position.y -= 0.5;
    }
    if(spawned[6] === true && spawned[7] === false && handR.position.y < 30){
        handR.position.y += 0.5;
    }
    if(spawned[7] === true && spawned[8] === false && handL.position.y < 30){
        handL.position.y += 0.5;
    }
    if(spawned[8] === true && spawned[9] === false && suzanne.position.y < 200){
        suzanne.position.y += 1;
    }
    if(spawned[10] === true && spawned[12] == false && handR.position.y < 110){
        handR.lookAt(x, y, z)
        handR.position.y += 1
        handL.lookAt(x, y, z)
        handL.position.y += 1
    }
    if(spawned[11] == true && spawned[12] == false && controls.enabled == true && bossHealth > 0){
       spawnBigFireBall(handR);
       spawnBigFireBall(handL); 
    }
    if(spawned[12] == true && handR.position.y > -75){
        handR.position.y -= 2;
        handR.rotation.x -= 0.05;
        handL.position.y -= 2;
        handL.rotation.y -= 0.05;
    }
    if(spawned[12] == true && suzanne.position.y > 12){
        var speed = 100;
        var difX = ((25) - 155)/speed;
        suzanne.position.x += difX;
        var difY = (12 - 200)/speed;
        suzanne.position.y += difY;
        var difZ = ((-662) - (-787))/speed;
        suzanne.position.z += difZ;
    }
    if(spawned[12] == true && suzanne.scale.y > 2){
        suzanne.scale.y -= 68/100;
        suzanne.scale.x -= 68/100;
        suzanne.scale.z -= 68/100;
    }
    
}

function enemyAI(){
	var x = controls.getObject().position.x,
	    y = controls.getObject().position.y,
		z = controls.getObject().position.z;
	for(var w = 0; w<enemies['model'].length;w += 1){
       if(enemies['model'][w].position.y < enemies['entry'][w] && enemies['health'][w] > 0 && enemies['entry'][w] != -1){
            enemies['model'][w].lookAt(x, y, z);
            enemies['model'][w].position.y += 1;
        }
        else if(enemies['health'][w] > 0 && controls.enabled == true){
			if(enemies['entry'][w] != -1)
				enemies['entry'][w] = -1;
            if(enemies['model'][w].name.includes('red') || enemies['model'][w].name.includes('gold1')){
				enemies['model'][w].lookAt(x, y, z);
                if(enemies['attack'][w] === false){
                    enemies['attack'][w] = true;
                    spawnFireBall(enemies['model'][w], enemies['model'][w].name);
                }
            }else if(enemies['model'][w].name.includes('blue') || enemies['model'][w].name.includes('gold2')){ 
                charge(w)
            }
        }else if(enemies['health'][w] <= 0){
            enemies['model'][w].rotation.x -= 0.1;
            enemies['model'][w].position.y -= 1;
            if(enemies['model'][w].position.y <= 0){
                scene.remove(enemies['model'][w])
                enemies['model'].splice(w, 1)   
                enemies['name'].splice(w, 1)   
                enemies['health'].splice(w, 1)  
                enemies['entry'].splice(w, 1)  
                enemies['attack'].splice(w, 1)   
            }
        }
	}
	if(controls.enabled == true)
	   animateFireballs();
}

function charge(index){
	var ox = enemies['model'][index].position.x,
	    oy = enemies['model'][index].position.y,
		oz = enemies['model'][index].position.z,
		cx = controls.getObject().position.x,
		cy = controls.getObject().position.y,
		cz = controls.getObject().position.z;
		
	var distance = enemies['model'][index].position.distanceTo(controls.getObject().position);
	var speed = 20;
	if(distance > 20 && enemies['attack'][index] == 30){
		enemies['model'][index].lookAt(cx, cy, cz);
		if(ox != cx){
			var difX = (cx - ox)/speed;
			enemies['model'][index].position.x += difX;
		}
		if(oy != cy){
			var difY = (cy - oy)/speed;
			enemies['model'][index].position.y += difY;
		}
		if(oz != cz){
			var difZ = (cz - oz)/speed;
			enemies['model'][index].position.z += difZ;
		}
	}else{
		if(enemies['attack'][index] < 28 && enemies['attack'][index] > 1){
            if(enemies['attack'][index] == 27)
               chargeSound.play()
			var attackRotation = Math.PI * 2/26;
			enemies['model'][index].rotation.z += attackRotation
			enemies['model'][index].rotation.y += attackRotation
		}
		if(enemies['attack'][index] == 13 && distance < 20){
			$('#hurt').fadeIn(75);
			health -= 5;
            damageTaken += 5;
			if (health < 0) health = 0;
			var val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
			$('#health').html(health+'%');
			$('#hurt').fadeOut(350);
		}
			
		enemies['attack'][index] -= 1;
		
		if(enemies['attack'][index] == -1){
			enemies['attack'][index] = 30;
		}
	}
}	

function spawnFireBall(origin, name){
	var ox = origin.position.x,
	    oy = origin.position.y,
		oz = origin.position.z,
		cx = controls.getObject().position.x,
		cy = controls.getObject().position.y,
		cz = controls.getObject().position.z;
	var geometry = new THREE.SphereGeometry( 5, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {map : textureLoader.load( "assets/fire/fire.jpg" )} );
    
	var index = -1;
	for(var v = 0; v<fireballs['caster'].length; v+=1){
		if(fireballs['caster'][v] == name){
			index = v;
		}
	}
	
	if(index == -1){
		fireballs['model'].push(new THREE.Mesh( geometry, material ))
		var w = fireballs['model'].length - 1;
		fireballs['origin'].push(new THREE.Vector3( ox, oy, oz));
		fireballs['destination'].push( new THREE.Vector3( cx, cy, cz) );
		fireballs['caster'].push(name)
		fireballs['duration'].push(70) // change with variables in Animate fireballs
        fireballs['sound'].push(fireSound)
	}
	else {
		var w = index;
		fireballs['model'][w] = new THREE.Mesh( geometry, material )
		fireballs['origin'][w] = new THREE.Vector3( ox, oy, oz);
		fireballs['destination'][w] = new THREE.Vector3( cx, cy, cz);
		fireballs['caster'][w] = name
		fireballs['duration'][w] = 70 // change with variables in Animate fireballs
	}
    if(!fireballs['sound'][w].isPlaying){
        fireballs['sound'][w].play()
    }
	fireballs['model'][w].name = 'fireball';
	fireballs['model'][w].position.set(ox, oy, oz)
	scene.add( fireballs['model'][w]);
}

function animateFireballs(){
    var speed = 45;
	for(var w = 0; w<fireballs['model'].length;w += 1){
		
        var difX = (fireballs['destination'][w].x - fireballs['origin'][w].x)/speed;
        fireballs['model'][w].position.x += difX;

        var difY = (fireballs['destination'][w].y - fireballs['origin'][w].y)/speed;
        fireballs['model'][w].position.y += difY;

        var difZ = (fireballs['destination'][w].z - fireballs['origin'][w].z )/speed;
        fireballs['model'][w].position.z += difZ;
		
		fireballs['duration'][w] -= 1;
		
		if(fireballs['duration'][w] == 0){
            //XXX
            for(var i = 0; i<enemies['attack'].length; i+=1 ){
                if(fireballs['caster'][w] == enemies['model'][i].name){
                    enemies['attack'][i] = false;
                }
            }
            scene.remove(fireballs['model'][w]);
		}
	}
}

function collision(){ 	
    var goBack = 1;
	
	ray = [];
	
	//-y
	ray.push(new THREE.Ray()) 
	ray[0].direction.set( 0,-1, 0); 
	ray[0].origin.copy( controls.getObject().position );
	ray[0].origin.y -= 1;
	
	//-x
	ray.push(new THREE.Ray()) 
    ray[1].direction.set(-1, 0, 0); 
	ray[1].origin.copy( controls.getObject().position );
	ray[1].origin.x -= 1;
	
	//-z
	ray.push(new THREE.Ray()) 
    ray[2].direction.set( 0, 0, -1); 
	ray[2].origin.copy( controls.getObject().position );
	ray[2].origin.z -= 1;
	
	//x
	ray.push(new THREE.Ray()) 
    ray[3].direction.set( 1, 0, 0); 
	ray[3].origin.copy( controls.getObject().position );
	ray[3].origin.x += 1;
	
	//z
	ray.push(new THREE.Ray()) 
    ray[4].direction.set( 0, 0, 1); 
	ray[4].origin.copy( controls.getObject().position );
	ray[4].origin.z += 1;
    
    //y
	ray.push(new THREE.Ray()) 
    ray[5].direction.set( 0, 1, 0); 
	ray[5].origin.copy( controls.getObject().position );
	ray[5].origin.y += 1;
    
	var interaction = false;
	for(var x = 0; x < 6; x+=1){
		raycaster = new THREE.Raycaster();
		raycaster.ray = ray[x];
		var intersections = raycaster.intersectObjects( scene.children );
		if ( intersections.length > 0 ) {
			var distance = intersections[ 0 ].distance;
			if ( distance > 0 && distance < 5 ) {
                if(intersections[0].object.name == 'suzanne'){
                    scene.remove(suzanne);
                    suzanne.position.set(-1.25, -1, -2)
                    suzanne.scale.multiplyScalar(0.25);
                    camera.add(suzanne);
                    suzanne.lookAt(1.5, 0, 2)
                    yareyareSound.play();
                    interaction = true;
                }
                if(intersections[0].object.name.includes('bigFireBall')){
                    if(intersections[0].object.name == 'bigFireBallR')
                        orientPointerRight(-1)
                    else orientPointerLeft(-1)
					scene.remove(intersections[0].object);
					$('#hurt').fadeIn(75);
					health -= 50;
                    damageTaken += 50;
					if (health < 0) health = 0;
					var val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
					$('#health').html(health+'%');
					$('#hurt').fadeOut(350);
                    interaction = true;
				}
				if(intersections[0].object.name == 'fireball'){
					scene.remove(intersections[0].object);
					$('#hurt').fadeIn(75);
					health -= 10;
                    damageTaken += 10;
					if (health < 0) health = 0;
					var val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
					$('#health').html(health+'%');
                    if(health > 0)
					   $('#hurt').fadeOut(350);
                    interaction = true;
				}
                if(intersections[0].object.name == 'firstaid'){
                    firstaidSound
                    if(firstaidSound.isPlaying)
                        firstaidSound.stop()
                    firstaidSound.play()
                    health += 75;
                    $('#health').html(health+'%');
                    scene.remove(intersections[0].object);
                    interaction = true;
                }
                if(intersections[0].object.name == 'elevator' && x == 0){
                    controls.isOnObject( true );
                    controls.getObject().position.y += 0.5
                    interaction = true;
                }
				if(intersections[0].object.name == 'lava'){
					$('#hurt').fadeIn(75);
					health -= 10;
                    damageTaken += 10;
					if (health < 0) health = 0;
					var val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
					$('#health').html(health+'%');
                    $('#hurt').fadeOut(350);
                    controls.getObject().position.set(-140, 55, -287)
				}
                if(interaction == false){
                    if(x == 0){ //-y
                        controls.isOnObject( true );
                    }
                    if(x == 1){
                        controls.collision();
                        controls.getObject().position.x += goBack;
                    }
                    if(x == 2){
                        controls.collision();
                        controls.getObject().position.z += goBack;
                    }
                    if(x == 3){
                        controls.collision();
                        controls.getObject().position.x -= goBack;
                    }
                    if(x == 4){
                        controls.collision();
                        controls.getObject().position.z -= goBack;
                    }
                    if(x == 5){
                        controls.collision();
                        controls.getObject().position.y -= goBack;
                    }
                }
			}
		}
	}
}

function endgame(){
    if(health == 0 && controls.enabled == true){
        camera.remove(gun)
        controls.enabled = false;
        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';
        instructions.style.display = '';
        $('#instructions').html('<span style="font-size:60px">YOU DIED</span><br/><br/>Refresh the browser to play again');
        instructions.style.color = "Red";
    }
    else if(camera.getObjectByName('suzanne') && controls.enabled == true){
        $('#bossHealth').html('')
        controls.enabled = false;
        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';
        instructions.style.display = '';
        instructions.style.color = 'Gold'
        
        var endTime = new Date();
        var timeDiff = endTime - startTime;
        timeDiff /= 1000;
        var sec = Math.round(timeDiff % 60);
        timeDiff = Math.floor(timeDiff / 60);
        var min = Math.round(timeDiff % 60);
        timeDiff = Math.floor(timeDiff / 60);
        if(sec <= 9)
            var secAc = '0' + String(sec)
        else secAc = sec;

        $('#instructions').html('<span style="font-size:60px">YOU WIN!</span><br/><br/>Damage Taken : ' + damageTaken + '%<br/><br/>Time : '+min+':'+secAc+'<br/><br/>Refresh the browser to play again');
    }
}

 function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	updateHUD()
	suzanneAI()
	enemyAI();
    endgame();
	spawnEvent();
	controls.isOnObject(false);
	collision()
	controls.update( Date.now() - time );	
	renderer.render(scene, camera);
	time = Date.now();
}
init();
init3DModels();
initWeapons();
initLevel();
animate();
