let canvas;

let balls = [];

// config
let enabled = false;
let numBalls = 100;
let slowFactor = 0.999;
let grav = {x: 0.0, y: 1};
let gravityType = 1; // 0 = none, 1 = normal, 2 = positional
let gravityPosition = {x: 0, y: 0};

// color config
let colorMode = 0; // 0 = normal, 1 = velocity, 2 = acceleration

class Circle {
	constructor (positon, radius, velocity, bouncyNess, color) {
		this._position = positon;
		this._velocity = velocity;
		this._color = color || "red";
		this._radius = radius;
		this._velocity = velocity;
		this._bouncyNess = bouncyNess;
	}

	draw (ctx) {
		ctx.beginPath();

		if (colorMode == 0) {
			ctx.fillStyle = this._color;
		} else if (colorMode == 1) {
			ctx.fillStyle = "rgb(" + Math.abs(this._velocity.x) * 10 + ", " + Math.abs(this._velocity.y) * 10 + ", 0)";
		} else if (colorMode == 2) {
			ctx.fillStyle = "rgb(" + Math.abs(this._velocity.x) * 10 + ", " + Math.abs(this._velocity.y) * 10 + ", 0)";
		}

		ctx.arc(this._position.x, this._position.y, this._radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	update(ctx) {
		this._position.x += this._velocity.x;
		this._position.y += this._velocity.y;

		// Gravity
		if (gravityType == 0) {
			// none
		} else if (gravityType == 1) {
			this._velocity.x += grav.x;
			this._velocity.y += grav.y;
		} else if (gravityType == 2) {
			let dx = gravityPosition.x - this._position.x;
			let dy = gravityPosition.y - this._position.y;
			let angle = Math.atan2(dy, dx);

			this._velocity.x += Math.cos(angle);
			this._velocity.y += Math.sin(angle);
		}

		this._velocity.x *= slowFactor;
		this._velocity.y *= slowFactor;

		// Y border
		if (this._position.y > canvas.height - this._radius) {
			this._position.y = canvas.height - this._radius;
			this._velocity.y = -this._velocity.y * this._bouncyNess;
		} else if (this._position.y < this._radius) {
			this._position.y = this._radius;
			this._velocity.y = -this._velocity.y * this._bouncyNess;
		}

		// X border
		if (this._position.x > canvas.width - this._radius) {
			this._position.x = canvas.width - this._radius;
			this._velocity.x = -this._velocity.x * this._bouncyNess;
		} else if (this._position.x < this._radius) {
			this._position.x = this._radius;
			this._velocity.x = -this._velocity.x * this._bouncyNess;
		}

		// Collision
		for (let i = 0; i < balls.length; i++) {
			let that = balls[i];

			if (this == that) continue;

			let dx = that._position.x - this._position.x;
			let dy = that._position.y - this._position.y;

			let distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < this._radius + that._radius) {
				let angle = Math.atan2(dy, dx);
				let targetX = this._position.x + Math.cos(angle) * (this._radius + that._radius);
				let targetY = this._position.y + Math.sin(angle) * (this._radius + that._radius);

				let ax = (targetX - that._position.x) * 0.5;
				let ay = (targetY - that._position.y) * 0.5;

				this._position.x -= ax;
				this._position.y -= ay;
				this._velocity.x -= ax * this._bouncyNess;
				this._velocity.y -= ay * this._bouncyNess;

				that._position.x += ax;
				that._position.y += ay;
				that._velocity.x += ax * that._bouncyNess;
				that._velocity.y += ay * that._bouncyNess;
			}
		}

		this.draw(ctx);
	}
}

window.addEventListener("load", function () {
	canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	gravityPosition = {x: canvas.width / 2, y: canvas.height / 2};

	// let c = new circle({x: 100, y: 100}, 10, 0.8);
	// c.velocity = {x: 2, y: 2};
	// balls.push(c);

	function createBall() {
		let maxSize = Number(document.getElementById("ballSizeMax").value);
		let minSize = Number(document.getElementById("ballSizeMin").value);

		let startPosition = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
		let startVelocity = { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5 };
		let radius = Math.random() * (maxSize - minSize) + minSize; // 10
		let bouncyNess = 0.8; // 0.8

		let c = new Circle(startPosition, radius, startVelocity, bouncyNess);
		c.update(ctx); // initial update to kick balls from the sides

		balls.push(c);
	}

	for (let i = 0; i < numBalls; i++) {
		createBall();
	}

	// Primary update function
	function step() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < balls.length; i++) {
			balls[i].update(ctx);
		}

		if (gravityType == 2) {
			ctx.beginPath();
			ctx.arc(gravityPosition.x, gravityPosition.y, 10, 0, Math.PI * 2);
			ctx.fillStyle = "black";
			ctx.fill();
		}
	}

	// Mouse gravity
	canvas.addEventListener("mousemove", function (e) {
		gravityPosition = {x: e.offsetX, y: e.offsetY};
	});

	// ===== Event listeners =====
	// Reset
	let resetButton = document.getElementById("reset");

	resetButton.addEventListener("click", function () {
		window.location.reload();
	});

	// # of balls
	let ballSlider = document.getElementById("numBalls");

	ballSlider.addEventListener("input", function () {
		numBalls = Number(ballSlider.value);

		document.getElementById("numBallLabel").innerHTML = "Number of Balls (" + numBalls + ")";
	});

	// Ball size
	let ballSizeSliderMin = document.getElementById("ballSizeMin");
	let ballSizeSliderMax = document.getElementById("ballSizeMax");
	let ballSizeLabel = document.getElementById("ballSize");

	ballSizeSliderMin.addEventListener("input", function () {
		if (Number(ballSizeSliderMin.value) > Number(ballSizeSliderMax.value)) {
			ballSizeSliderMax.value = ballSizeSliderMin.value;
		}

		ballSizeLabel.innerHTML = `Ball Size (${ballSizeSliderMin.value}-${ballSizeSliderMax.value})`;
	});

	ballSizeSliderMax.addEventListener("input", function () {
		if (Number(ballSizeSliderMax.value) < Number(ballSizeSliderMin.value)) {
			ballSizeSliderMin.value = ballSizeSliderMax.value;
		}

		ballSizeLabel.innerHTML = `Ball Size (${ballSizeSliderMin.value}-${ballSizeSliderMax.value})`;
	});

	// Clear balls
	let clearButton = document.getElementById("clearBalls");

	clearButton.addEventListener("click", function () {
		balls = [];

		for (let i = 0; i < numBalls; i++) {
			createBall();
		}

		step();
	});

	// Drag
	let dragSlider = document.getElementById("slowFactor");

	dragSlider.addEventListener("input", function () {
		slowFactor = Number(dragSlider.value);
		document.getElementById("slowFactorLabel").innerHTML = "Drag (" + slowFactor + ")";

		if (slowFactor > 1) {
			document.getElementById("slowFactorLabel").innerHTML += " [DANGER | UNSTABLE BEHAVIOR MAY OCCUR]";
		}
	});

	// Gravity
	let gravSliderX = document.getElementById("gravityX");
	let gravSliderY = document.getElementById("gravityY");

	gravSliderX.addEventListener("input", function () {
		grav.x = Number(gravSliderX.value);
		document.getElementById("gravityLabel").innerHTML = `Gravity (x:${grav.x}, y:${grav.y})`;
	});

	gravSliderY.addEventListener("input", function () {
		grav.y = Number(gravSliderY.value);
		document.getElementById("gravityLabel").innerHTML = `Gravity (x:${grav.x}, y:${grav.y})`;
	});

	// Gravity type
	let gravityTypeSelect = document.getElementById("gravitySetting");
	gravityTypeSelect.value = gravityType;

	gravityTypeSelect.addEventListener("change", function () {
		gravityType = gravityTypeSelect.value;
	});

	// Custom Ball
	document.getElementById("insertCustomBall").addEventListener("click", function () {
		let radius = Number(document.getElementById("customBallSize").value);
		let bouncyNess = Number(document.getElementById("customBallBouncyNess").value);
		let color = document.getElementById("customBallColor").value;

		let startPosition = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
		let startVelocity = { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5 };

		let c = new Circle(startPosition, radius, startVelocity, bouncyNess, color);
		c.update(ctx); // initial update to kick balls from the sides

		balls.push(c);
	});

	// Set all the slider information
	let sliders = document.getElementsByTagName("input");

	for (let i = 0; i < sliders.length; i++) {
		if (sliders[i].type == "range") {
			sliders[i].dispatchEvent(new Event("input"));
		}
	}

	// ===== Main =====
	let toggleButton = document.getElementById("autoStep");
	let stepButton = document.getElementById("step");

	toggleButton.addEventListener("click", function () {
		enabled = !enabled;

		toggleButton.value = enabled ? "Pause Simulation" : "Resume Simulation";
		stepButton.style.display = enabled ? "none" : "inline-block";
	});

	stepButton.addEventListener("click", step);
	setInterval(function () {
		if (enabled) {
			step();
		}
	}, 10);
});