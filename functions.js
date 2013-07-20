var canvas;
var context;

var snake; 
var apple; 
var SPEED = 10
var SPEED_X = SPEED;
var SPEED_Y = 0;
var isPaused = false;
var oldSpeedX;
var oldSpeedY;
var score = 0;
var changeDirs = [];

// Init
$(document).ready(function () {
	init();
});

function gameLoop(){
	snake.move();	
	var j = 1
	for (;j < snake.bodyLength+1; j++){
		if (snake.body[j] != null){
			snake.body[j].move();
		}
	}
	snake.appleHitTest(apple);
	redraw();	
}

function init(){
	canvas = document.getElementById("theCanvas");
	context = canvas.getContext('2d');
	snake = new Snake(120, 120);
	places = [];
	i = 0;
	while (i < canvas.width - 10){
		places.push(i);
		i += 10;
	}
	apple = new Apple(getValidApple(places)[0], getValidApple(places)[1]);		
	window.onkeydown = function(e){
		var key = (event || window.event).keyCode;
		keyPressed(key);	
	}

	interID = setInterval(gameLoop, 200);
}

function getValidApple(places){
	var randX = places[Math.floor(Math.random() * (places.length))];
	var randY = places[Math.floor(Math.random() * (places.length))];
	while (!checkApplePoints(randX, randY)){
	 	randX = Math.floor(Math.random() * (canvas.width - 10));
	 	randY = Math.floor(Math.random() * (canvas.height - 10));
	}
	return [randX, randY];
}

function gameOver(){
	stopSnake();
}

function stopSnake(){
	for (i = 0; i < snake.bodyLength + 1; i++){
		snake.body[i].speedX = 0;
		snake.body[i].speedY = 0;
	}
}

function ChangeDir(x, y, dir){
	this.x = x;
	this.y = y;
	this.dir = dir;
}

function Snake(x, y){	
	this.head = new BodyPart(x, y, SPEED, 0);	
	this.body = [this.head];
	this.bodyLength = 0;

	this.appleHitTest = function(a){
	 	if (this.head.x == a.x && this.head.y == a.y){
	 		this.addNewBodyPart();
	 		score += 1;
	 		document.getElementById("score").innerHTML = score;
	 		apple.x = getValidApple(places)[0];
	 		apple.y = getValidApple(places)[1];

	 	}
	}

	this.move = function(){
		if (this.head.speedX != 0){
			this.head.x = this.head.x + this.head.speedX;
			if (this.head.x == canvas.width - 10 && this.head.speedX > 0){
			 	gameOver();
			}
			if (this.head.x == 0 && this.head.speedX < 0){
				gameOver();
			}
		} else if (this.head.speedY != 0){
			this.head.y = this.head.y + this.head.speedY;
			if (this.head.y == canvas.height - 10 && this.head.speedY > 0){
			 	gameOver();
			}
			if (this.head.y == 0 && this.head.speedY < 0){
				gameOver();
			}
		}
	}
}

Snake.prototype.addNewBodyPart = function(){	
	end_x = this.body[this.bodyLength].x +  this.body[this.bodyLength].speedX * -1
	end_y = this.body[this.bodyLength].y +  this.body[this.bodyLength].speedY * -1
	this.body.push(new BodyPart(end_x,end_y, this.body[this.bodyLength].speedX, this.body[this.bodyLength].speedY));
	this.bodyLength += 1;
}

function BodyPart(x, y, speedX, speedY){
	this.x = x;
	this.y = y;
	this.speedX = speedX;
	this.speedY = speedY;

	this.move = function(){
		if (this.speedX != 0){
			changer = hitChanger(this.x, this.y);			
			if (changer == null ){			
				this.x = this.x + this.speedX;					
			} else {
				this.speedX = 0;			
				if (changer.dir == "U"){
					this.speedY = -1 * SPEED;		
					this.y = this.y + this.speedY;
				} else {
					this.speedY = SPEED;
					this.y = this.y + this.speedY;
				}
				if (this == snake.body[snake.bodyLength]){
					changeDirs.splice(0,1);
				}
			}
		}else if (this.speedY != 0){
			changer = hitChanger(this.x, this.y);			
			if (changer == null ){			
				this.y = this.y + this.speedY;					
			} else {
				this.speedY = 0;			
				if (changer.dir == "L"){
					this.speedX = -1 * SPEED;
					this.x = this.x + this.speedX
				} else {
					this.speedX = SPEED;		
					this.x = this.x + this.speedX
				}

				if (this == snake.body[snake.bodyLength]){
					changeDirs.splice(0,1);
				}
			}
		}
	}
}

function removeChangeDir(x, y){
	for (i=0; i < changeDirs.length; i++){
		if (x == changeDirs[i].x && y == changeDirs[i].y){
			return changeDirs.splice(i,1);
		}
	}
}

function hitChanger(x, y){	
	for (i=0; i < changeDirs.length; i++){
		if (x == changeDirs[i].x && y == changeDirs[i].y){
			return changeDirs[i];
		}
	}
	return null;
}

BodyPart.prototype.draw = function() {
	context.beginPath();
	context.rect(this.x, this.y, 10, 10);
	context.fillStyle = "#000";
	context.fill();
	context.closePath();
}

function Apple(x, y){
	this.x = x;
	this.y = y;
}

Apple.prototype.draw = function() {
	context.beginPath();
	context.rect(this.x, this.y, 10, 10);
	context.fillStyle = "#F00";
	context.fill();
	context.closePath();
}

function checkApplePoints(x, y){	
	for (i=0; i < snake.bodyLength + 1; i++){
		if (x == snake.body[i].x || y == snake.body[i].y){
			return false;
		}
	}
	return true;
}

function redraw(){
	context.save();
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.restore();
	for (var i = 0; i < snake.body.length; i++){
		snake.body[i].draw();
	}
	apple.draw();
}

function keyPressed(key){
	// A or left
	if (key == 65 || key == 37) {
		if (snake.head.speedX > 0 && snake.body[1] != null){
			return;
		} else if (snake.head.speedX > 0 && snake.body[1] == null){
			snake.head.speedX = -1 * SPEED;						 			
		} else if (snake.head.speedY != 0 && snake.body[1] != null){
			snake.head.speedX = -1 * SPEED;
			snake.head.speedY = 0;
			changeDirs.push(new ChangeDir(snake.head.x, snake.head.y, "L"));			
		} else if(snake.head.speedY != 0 && snake.body[1] == null){
			snake.head.speedX = -1 * SPEED;
			snake.head.speedY = 0;
		}
	}

	// D or right
	else if (key == 68 || key == 39) {
		if (snake.head.speedX < 0 && snake.body[1] != null){
			return;
		} else if (snake.head.speedX < 0 && snake.body[1] == null){
			snake.head.speedX = SPEED;
		} else if (snake.head.speedY != 0 && snake.body[1] != null){
			snake.head.speedX = SPEED;
			snake.head.speedY = 0;
			changeDirs.push(new ChangeDir(snake.head.x, snake.head.y, "R"));				
		} else if (snake.head.speedY != 0 && snake.body[1] == null){
			snake.head.speedX = SPEED;
			snake.head.speedY = 0;
		}
	}

	// S or down
	else if (key == 83 || key == 40) {
		if (snake.head.speedY < 0 && snake.body[1] != null){
			return;
		} else if (snake.head.speedY < 0 && snake.body[1] == null){
			snake.head.speedY = SPEED;
		} else if (snake.head.speedX != 0 && snake.body[1] != null){
			snake.head.speedX = 0;
			snake.head.speedY = SPEED;
			changeDirs.push(new ChangeDir(snake.head.x, snake.head.y, "D"));
		} else if (snake.head.speedX != 0 && snake.body[1] == null){
			snake.head.speedX = 0;
			snake.head.speedY = SPEED;
		}
	}
	// W or up
	else if (key == 87 || key == 38) {
		if (snake.head.speedY > 0 && snake.body[1] != null){
			return;
		} else if (snake.head.speedY > 0 && snake.body[1] == null){
			snake.head.speedY = -1 * SPEED;
		} else if (snake.head.speedX != 0 && snake.body[1] != null){
			snake.head.speedX = 0;
			snake.head.speedY = -1 * SPEED;
			changeDirs.push(new ChangeDir(snake.head.x, snake.head.y, "U"));
		} else if (snake.head.speedX != 0 && snake.body[1] == null){
			snake.head.speedX = 0;
			snake.head.speedY = -1 * SPEED;
		}
	}

	// PAUSE
	else if (key == 80){
		if (!isPaused){
			stopSnake();
			isPaused = true;
		} else {
			//SPEED_X = oldSpeedX;
			//SPEED_Y = oldSpeedY;
			isPaused = false;
		}
	}
}
