//---------- SMART RACE 2 ----------

// Important objects
var carSprite

// Will the player be allowed to drive a car?
var playerDrive = false

// Defines the current state of the simulator (setStart is the first one)
var phase = "setStart"

// Defines the width of the race track
const trackWidth = 50

// Graphic overlays
var showGrid = false // Shows grid when building the track
var showMap = false // Shows collision map during runtime
var showInputs = false
const resolution = 3 // Get 1 out of [resolution] pixels to create the track collision map

// Visual settings
const buttonWidth = 60
const buttonHeight = 50

// Track building
var direction //of the starting track
var start // starting position of the cars
var currentPosition //of the last section of the current track
var currentDirection //of the next track segment

// Simulation settings
var ticks = 0
var generation = 0
var maxticks = 500

// Population settings
var population = []
const individuals = 30
const offspring = 3

// Neural net settings
const nnLayers = 1
const nnNeurons = 10
const nnInputs = 8
const nnOutputs = 2
const nnRange = 4
const nnMutationRate = 0.01
const nnActivation = "softsign"


// The simulation itself

function preload(){
	//carSprite = loadImage("./images/car.png")
	//carSprite = loadImage("car.png")
	carSprite = loadImage("https://raw.githubusercontent.com/Vtchoo/smartRace/master/images/car.png")
}

function setup(){

	// Create canvas
	createCanvas(window.innerWidth, window.innerHeight)
	renderTrack = createGraphics(canvas.width, canvas.height)
	renderCars = createGraphics(canvas.width, canvas.height)
	grid = createGraphics(canvas.width, canvas.height)
	background("green")

	trackMap = new Array(Math.floor(canvas.width/resolution));
	for (var i = 0; i < trackMap.length; i++) {
  		trackMap[i] = new Array(Math.floor(canvas.height/resolution));
	}
	renderMap = createGraphics(canvas.width, canvas.height)

}

function draw(){

	switch(phase){
		case "setStart":

			renderTrack.push();
			renderTrack.fill("green")
			renderTrack.rect(0,0,canvas.width,canvas.height)
			renderTrack.fill("black")
			renderTrack.noStroke()
			renderTrack.rect(mouseX-trackWidth/2, mouseY-trackWidth/2, trackWidth, trackWidth)
			renderTrack.pop();
			image(renderTrack,0,0)
			break

		case "rotateStart":

			renderTrack.push()
			renderTrack.fill("green")
			renderTrack.rect(0, 0, canvas.width,canvas.height)
			renderTrack.translate(start.x,start.y)
			renderTrack.rotate(atan2(mouseY - start.y, mouseX - start.x))
			renderTrack.fill("black")
			renderTrack.rect(-trackWidth/2, -trackWidth/2, trackWidth, trackWidth)
			renderTrack.stroke("white")
			renderTrack.line(-trackWidth/2, -trackWidth/2, trackWidth/2, -trackWidth/2)
			renderTrack.line(-trackWidth/2, +trackWidth/2, trackWidth/2, +trackWidth/2)
			renderTrack.pop()
			image(renderTrack,0,0)
			break

		case "buildTrack":

			background("green")
			image(renderTrack,0,0)
			if (showGrid == true){ image(grid,0,0) }
			break

		case "setup":

			for(let i = 0; i < individuals; i++){
				population[i] = new car(start.x, start.y, direction)
			}

			player = new car(start.x, start.y, direction)

			phase = "running"
			break

		case "running":

			image(renderTrack,0,0)
			if( showMap == true) { image(renderMap,0,0) }

			population.forEach( function(individual){ 
				individual.drive(individual.NN.output(individual.getInputs()))
				individual.update()
				individual.show()
				individual.NN.addfitness(individual.speed)
			})

			// Allows the player to drive a car
			if (playerDrive == true){
				getUserInput()
				player.update()
				player.show()
			}
			
			ticks++

			if (ticks >= maxticks){
				phase = "breeding"
			}

			break
		case "breeding":

			
			
			population.sort( function(a,b){ return b.NN.fitness - a.NN.fitness } )

			for (let i = 0; i < offspring; i++){
				population[individuals - 1 - i].NN = breed( population[2*i].NN , population[2*i+1].NN )
				population[individuals - 1 - i].generation = generation+1
			}

			population.forEach( function(individual){
				individual.pos = newVector(start.x + Math.random(), start.y + Math.random())
				individual.speed = 0
				individual.direction = direction
				individual.acceleration = 0
				individual.NN.resetfitness()
			})

			ticks = 0
			generation++
			//console.log("Current generation: " + generation)

			phase = "running"
			break
	}
}

function mouseClicked(){

	switch(phase){
		case "resetTrack":
			phase = "setStart"
			break
		case "setStart":
			start = newVector(mouseX, mouseY)
			phase = "rotateStart"
			break
		case "rotateStart":
			direction = Math.atan2(mouseY - start.y, mouseX - start.x)
			phase = "buildTrack"
			
			currentDirection = direction
			currentPosition = newVector(start.x + trackWidth*Math.cos(direction)/2, start.y + trackWidth*Math.sin(direction)/2)
			circle(currentPosition.x, currentPosition.y, 5)

			createTrackBuilder()
			createGrid()

			break
	}
}

function getUserInput(){

	var playerinput = []

	if( keyIsDown(87) ){
		playerinput[0] = 1
	} else if ( keyIsDown(83) ){
		playerinput[0] = -1
	} else {
		playerinput[0] = 0
	}

	if( keyIsDown(65) ){
		playerinput[1] = -1
	} else if ( keyIsDown(68) ){
		playerinput[1] = 1
	} else {
		playerinput[1] = 0
	}

	player.drive(playerinput)

}


