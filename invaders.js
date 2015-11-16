;(function() {

	var Game = function () {

		var canvas = document.getElementById("space-invaders");
		var screen = canvas.getContext('2d');

		var gameSize = {x: canvas.width, y: canvas.height};

		this.bodies = [];
		this.bodies = this.bodies.concat(createInvaders(this));
		this.bodies = this.bodies.concat(new Player(this, gameSize));

		var self = this;

		var tick = function() {
			self.update();
			self.draw(screen, gameSize);

			requestAnimationFrame(tick);
		};

		tick();
	};

	Game.prototype = {

		update: function() {
			var self = this;

			var notCollidingWithAnything = function(b1) {
				return self.bodies.filter(function(b2) {return colliding(b1, b2); }).length === 0;
			};

			this.bodies = this.bodies.filter(notCollidingWithAnything);
 
			for (var i = 0; i < this.bodies.length; i++) {
				this.bodies[i].update();
			}
		},

		draw: function(screen, gameSize) {
			screen.clearRect(0, 0, gameSize.x, gameSize.y);

			screen.fillStyle = '#000000';
			screen.fillRect (0, 0, 300, 300);

			for (var i = 0; i < this.bodies.length; i++) {
				drawRect(screen, this.bodies[i]);
			}
		},

		invadersBelow: function(invader) {
			return this.bodies.filter(function(b) {

				return b instanceof Invader &&
					Math.abs(invader.center.x - b.center.x) < b.size.x &&
					b.center.y > invader.center.y;
			}).length > 0;
		},

		getInvaders: function() {
			return _.filter(this.bodies, function (body) {
				return body instanceof Invader;
			});
		},

		addBody: function(body) {
			this.bodies.push(body);
		},

		getFirstBodyByType: function (type) {
			return _.find(this.bodies, function (body) {
				return body instanceof type;
			});
		},

		removeBody: function(b2) {
			this.bodies = _.filter(this.bodies, function (b1) {
				return (b1 != b2);
			});
		},

		removeBodyByType: function (type) {
			this.bodies = _.filter(this.bodies, function (b1) {
				return !(b1 instanceof type);
			});
		},

		hasBodyByType: function (type) {
			return Boolean(_.find(this.bodies, function (body) {
				return body instanceof type;
			}));
		}
	};

	var Invader = function(game, center) {
		this.game = game;
		this.center = center;
		this.size = {x: 16, y: 8};

		this.patrolX = 0;
		this.speedX = 0.3;
	};

	Invader.prototype = {
		update: function() {
			// console.log(this.patrolX);
			if (this.patrolX <  0 || this.patrolX > 30) {
				this.speedX = -this.speedX;
			}

			// if (this.patrolX < 0 || this.patrolX > 30) {
				if (this.center.x < 15 || this.center.x > 285) {
					this.speedX = -this.speedX;
				}
			// }

			if (Math.random() > 0.995 &&
				!this.game.invadersBelow(this)) {
				var bullet = new Bullet({x: this.center.x, y: this.center.y + this.size.y / 2}, 
										{x: Math.random() - 0.5, y: 2}, this.game);

			this.game.addBody(bullet);
			}

			this.center.x += this.speedX;
			this.patrolX += this.speedX;
		},

		reverse: function() {
			// var invaders = [];
			// invaders = this.game.getInvaders();
			// for (var i = 0; i < invaders.length; i++) {
			// 	invaders[i].speedX = -invaders[i].speedX;
			// }

		}
	};

	var createInvaders = function(game) {
		var invaders = [];
		for (var i = 0; i < 24; i++) {
			var x = 30 + (i % 8) * 30;
			var y = 30 + (i % 3) * 30;

			console.log("X: " + (i % 8) + "\n" +"Y: " + y);
			// console.log("Invader number: " + i + "\n" + "x: " + x +"\n" + "y: " + y);

			invaders.push(new Invader(game, {x: x, y: y}));
		}

		return invaders;
	};

	var Player = function(game, gameSize) {
		this.game = game;
		this.size = {x: 15, y: 15};
		this.center = {x: gameSize.x / 2, y: gameSize.y - this.size.y * 2};

		this.keyboarder = new Keyboarder();
	};

	Player.prototype = {
		update: function() {
			if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
				if (this.center.x < 10) {
					return;
				}
				this.center.x -= 2;
				// console.log(this.center.x);
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
				if (this.center.x > 290) {
					return;	
				}
				this.center.x += 2;
				// console.log(this.center.x);
			}

			if (this.keyboarder.isDown(this.keyboarder.KEYS.S)) {
				var bullet = new Bullet({x: this.center.x, y: this.center.y - this.size.y - 10},
										{x: 0, y: -7}, this.game);

				this.game.addBody(bullet);
			}
		}
	};

	var Bullet = function(center, velocity, game) {
		this.center = center;
		this.size = {x: 3, y: 3};
		this.velocity = velocity;
		this.game = game;
	};

	Bullet.prototype = {
		update: function() {
			if (this.center.y == 0 || this.center.y == 300) {
				this.game.removeBody(this);
			}

			this.center.x += this.velocity.x;
			this.center.y += this.velocity.y;
		}
	};

	var Keyboarder = function() {
		var keyState = {};

		window.addEventListener('keydown', function(e) {
			keyState[e.keyCode] = true;
		});

		window.addEventListener('keyup', function(e) {
			keyState[e.keyCode] = false;
		});

		this.isDown = function (keyCode) {
			return keyState[keyCode] === true;
		};

		this.KEYS = {LEFT: 37, RIGHT: 39, S: 83};
	};

	var drawRect = function(screen, body) {
		screen.fillStyle = '#ffffff';
		screen.fillRect(body.center.x - body.size.x / 2, body.center.y - body.size.y / 2,
						body.size.x, body.size.y);
	};

	var colliding = function(b1, b2) {
		return !(
			b1 === b2 ||
			b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
			b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
			b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
			b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
	};

	window.addEventListener('load', function() {
		new Game();
	});
})();
