class Car {

	pos = new Vector(0, 0)
	speed = 0
	acceleration = 0
	direction = 0

	NN

	generation = 0

	lastInputs = null

	paintRGB = {
		r: int(Math.random() * 255),
		g: int(Math.random() * 255),
		b: int(Math.random() * 255)
	}

	get paint() {
		return `rgb(${this.paintRGB.r},${this.paintRGB.g},${this.paintRGB.b})`
	}

	constructor(startX, startY, startDir, options, neuralNetOptions) {
		this.pos = new Vector(startX, startY)
		this.direction = startDir

		this.NN = new NeuralNet(neuralNetOptions.layers, neuralNetOptions.neurons, neuralNetOptions.inputs, neuralNetOptions.outputs, neuralNetOptions.range, neuralNetOptions.mutationRate, neuralNetOptions.activation)

		if (options.generation)
			this.generation = options.generation
	}

	update({ game } = {}) {
		this.speed += this.acceleration

		if (this.speed < -2)
			this.speed = -2
		
		// if (track.isOutOfTrack(this.pos.x, this.pos.y))
		if (trackMap[Math.floor(this.pos.x / resolution)][Math.floor(this.pos.y / resolution)] == 0)
			this.speed = 0

		this.pos.add(
			this.speed * Math.cos(this.direction) * avgDeltaTime / (1 / 30),
			this.speed * Math.sin(this.direction) * avgDeltaTime / (1 / 30)
		)
	}

	draw({ p5, game } = {}) {
		push()
		translate(this.pos.x, this.pos.y)
		rotate(this.direction)
		imageMode(CENTER)
		carSprite.resize(20, 10)
		tint(this.paint)
		image(carSprite, 0, 0)
		// if (game?.showInputs) {
		// 	stroke(255)
		// 	line(this.pos.x, this.pos.y, x, y)
		// }
		pop()
	}

	drive(input) {
		
		const [acceleration, direction] = input

		this.acceleration = (acceleration > 0 && this.speed >= 0) || this.speed < 0 ? acceleration * .05 : acceleration * .15
		this.direction += direction * .05 * (1 - 1 / (1 + Math.abs(this.speed))) * Math.sign(this.speed) * avgDeltaTime / (1 / 30)
	}

	getInputs({ track } = {}) {

		const inputs = new Array(8).fill(0)
		const maxIncrements = 30

		inputs[7] = this.speed

		for (let i = 0; i < 7; i++) {

			const angle = this.direction + ((i - 3) / 10) * PI

			for (let j = 0; j < maxIncrements; j++) {
				const prevx = this.pos.x + (2 * Math.cos(((i - 3) / 10) * PI)) * j * Math.cos(angle) * 4
				const prevy = this.pos.y + (2 * Math.cos(((i - 3) / 10) * PI)) * j * Math.sin(angle) * 4

				let x = this.pos.x + (2 * Math.cos(((i - 3) / 10) * PI)) * (j + 1) * Math.cos(angle) * 4
				let y = this.pos.y + (2 * Math.cos(((i - 3) / 10) * PI)) * (j + 1) * Math.sin(angle) * 4

				// if (track.isOutOfBounds(x, y) || j == maxIncrements - 1)
				if (trackMap[Math.floor(x / resolution)][Math.floor(y / resolution)] == 0 || j == maxIncrements - 1) {
					x = prevx
					y = prevy

					inputs[i] = Math.sqrt(Math.pow(x - this.pos.x, 2) + Math.pow(y - this.pos.y, 2))
					if (showInputs) {
						stroke(255)
						line(this.pos.x, this.pos.y, x, y)
					}
					break
				}
			}
		}
		return inputs
	}
}
