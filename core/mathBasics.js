class Vector {
	x = 0
	y = 0

	constructor(x, y) {
		this.x = x
		this.y = y
	}

	heading() {
		return Math.atan2(this.y, this.x)
	}

	add(x, y) {
		this.x += x
		this.y += y
	}

	mult(value) {
		this.x *= value
		this.y *= value
	}

	mag() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
	}

	unit() {
		const length = this.mag()

		if (length === 0)
			return { x: 0, y: 0 }
		
		return {
			x: this.x / length,
			y: this.y / length
		}
	}
}
