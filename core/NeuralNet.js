class NeuralNet {

	range
	layers
	neurons
	inputs
	outputs
	activation
	mutationRate

	fitness = 0

	weights

	constructor(layers, neurons, inputs, outputs, range, mutationRate, activation) {
			
		if (layers == 0)
			throw new Error("Your neural net must have at least 1 neuron layer")
		
		this.range = range
		this.layers = layers
		this.neurons = neurons
		this.inputs = inputs
		this.outputs = outputs
		this.activation = activation
		this.mutationRate = mutationRate

		const weights = []
		for (let i = 0; i < layers + 1; i++) {

			weights[weights.length] = []

			const numberOfWeights = this.getNumberOfWeights(i)

			for (let j = 0; j < numberOfWeights; j++)
				weights[i][j] = (Math.random() - (1 / 2)) * 2 * range
		}

		this.weights = weights
	}

	output(input) {
		this.neuronLayer = new Array(this.neurons).fill(0)
		this.neuronLayerPrev = new Array(this.neurons).fill(0)
		this.outputArray = new Array(this.outputs).fill(0)

		for (let i = 0; i < this.layers + 1; i++) {

			this.neuronLayer.fill(0)
			//console.log(this.neuronLayer)
			//console.log(this.neuronLayerPrev)

			if (i == 0) {                      // First layer

				for (let j = 0; j < this.neurons; j++) {
					for (let k = 0; k < this.inputs; k++)
						this.neuronLayer[j] = this.neuronLayer[j] + input[k] * this.weights[i][j + k * this.neurons]
					
					this.neuronLayer[j] = activate(this.neuronLayer[j], this.activation)
					this.neuronLayerPrev[j] = this.neuronLayer[j]
				}

			} else if (i == this.layers) {            // Output layer

				for (let j = 0; j < this.outputs; j++) {
					for (let k = 0; k < this.neurons; k++)
						this.outputArray[j] = this.outputArray[j] + this.neuronLayerPrev[k] * this.weights[i][j + k * this.outputs]
					
					this.outputArray[j] = activate(this.outputArray[j], this.activation)
				}

			} else {								// Middle layers

				for (let j = 0; j < this.neurons; j++) {
					for (let k = 0; k < this.neurons; k++)
						this.neuronLayer[j] = this.neuronLayer[j] + this.neuronLayerPrev[k] * this.weights[i][j + k * this.neurons]
					
					this.neuronLayer[j] = activate(this.neuronLayer[j], this.activation)
					this.neuronLayerPrev[j] = this.neuronLayer[j]
				}
			}
		}
		
		return this.outputArray
	}

	
	// Manages individual fitness
	addFitness(value) {
		this.fitness += value
	}

	resetFitness() {
		this.fitness = 0
	}

	setFitness(value) {
		this.fitness = value
	}

	mutate() {

		for (i = 0; i < this.layers + 1; i++) {

			const numberOfWeights = this.getNumberOfWeights(i)

			for (let j = 0; j < numberOfWeights; j++) {
				if (Math.random() < this.mutationRate)
					this.weights[i][j] = (Math.random() - (1 / 2)) * 2 * this.range
			}
		}
	}

	getNumberOfWeights(weightsLayerIndex) {
		switch (weightsLayerIndex) {
			case 0:
				return this.inputs * this.neurons
			case this.layers:
				return this.outputs * this.neurons
			default:
				return this.neurons * this.neurons
		}
	}

	static breed(parent1, parent2) {

		const offsRange = parent1.range
		const offsLayers = parent1.layers
		const offsNeurons = parent1.neurons
		const offsInputs = parent1.inputs
		const offsOutputs = parent1.outputs
		const offsActivation = parent1.activation
		const offsMutationRate = parent1.mutationRate
	
		const offspring = new NeuralNet(offsLayers, offsNeurons, offsInputs, offsOutputs, offsRange, offsMutationRate, offsActivation)
	
		// Crossover algorithm
		for (let i = 0; i < offspring.layers + 1; i++) {
	
			offspring.weights[offspring.weights.length] = []
	
			if (i == 0) {                      // Create the first weights, from the input values to the first layer
	
				for (let j = 0; j < offspring.inputs * offspring.neurons; j++) {
					if (Math.random() > offspring.mutationRate) {
						if (Math.random() > 0.5) {
							offspring.weights[i][j] = parent1.weights[i][j]
						} else {
							offspring.weights[i][j] = parent2.weights[i][j]
						}
					} else {
						offspring.weights[i][j] = (Math.random() - (1 / 2)) * 2 * offspring.range
					}
				}
	
			} else if (i == offspring.layers) {            // Create the last weights, from the last layer to the output values
	
				for (let j = 0; j < offspring.outputs * offspring.neurons; j++) {
					if (Math.random() > offspring.mutationRate) {
						if (Math.random() > 0.5) {
							offspring.weights[i][j] = parent1.weights[i][j]
						} else {
							offspring.weights[i][j] = parent2.weights[i][j]
						}
					} else {
						offspring.weights[i][j] = (Math.random() - (1 / 2)) * 2 * offspring.range
					}
				}
	
			} else {								// Create the weights between hidden neuron layers
	
				for (let j = 0; j < offspring.neurons * offspring.neurons; j++) {
					if (Math.random() > offspring.mutationRate) {
						if (Math.random() > 0.5) {
							offspring.weights[i][j] = parent1.weights[i][j]
						} else {
							offspring.weights[i][j] = parent2.weights[i][j]
						}
					} else {
						offspring.weights[i][j] = (Math.random() - (1 / 2)) * 2 * offspring.range
					}
				}
			}
		}
	
		return offspring
	}
}

function activate(value, activation) {
	switch (activation) {
		case "identity":
			return value
		case "binary":
			return value > 0 ? 1 : 0
		case "softsign":
			return value / (1 + Math.abs(value))
		case "relu":
			return value > 0 ? value : 0
		default:
			console.log("No valid activation function selected")
			return value
	}
}
