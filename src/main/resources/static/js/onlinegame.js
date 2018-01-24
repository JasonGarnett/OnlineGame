
var canvas;
var ctx;

var board = {
		heightPerPiece: 0,
		widthPerPiece: 0,
		heightInPieces: 0,
		widthInPieces: 0,
		topLeft: {},
		bottomRight: {}
}


var castle1 = new Image();   
castle1.src = 'images/images-castle-clipart-830x717.png';

var castle2 = new Image();   
castle2.src = 'images/castle-clip-art-2.png';

var gameModel;
var grid = false;
var selected;
var ws;

function initialLoadBoard(topLeftX, topLeftY, whichBoard, wsLocation) {
	
	canvas = document.getElementById("gameBoard");
	canvas.addEventListener("click", onClick, false);
	
	ctx = canvas.getContext("2d");
	loadBoardCharacteristics(canvas, topLeftX, topLeftY);
		    
	$.get("/gameboard/" + whichBoard, {
		topLeftX:board.topLeft.x,
		topLeftY:board.topLeft.y,
		height: board.heightInPieces,
		width: board.widthInPieces
		}, function(data, status) {
			gameModel = data;
			connect(wsLocation);
			renderLoop();
	});
	
	
}

function register() {
	$.get("/register", function(data, status) {
		initialLoadBoard(data.topLeftX, data.topLeftY, data.whichBoard, data.wsLocation);
	});
}

function onClick(e) {
	var pos = getMousePos(e);
	console.log("click on " + pos.x + "," + pos.y);
	
	var rel = whichRelativeTile(pos);
	console.log("Relative " + rel.x + "," + rel.y);
	selected = rel;
	
	var act = whichActualTile(pos);
	console.log("Actual " + act.x + "," + act.y);
}

function whichRelativeTile(pos) {
	return {
		x: Math.floor(pos.x/board.heightPerPiece),
		y: Math.floor(pos.y/board.heightPerPiece)
	};
}

function whichActualTile(pos) {
	var rel = whichRelativeTile(pos);
	return {
		x: board.topLeft.x + rel.x,
		y: board.topLeft.y + rel.y
	};
}

function getMousePos(e) {
	return {
		x: e.clientX - canvas.getBoundingClientRect().left,
		y: e.clientY - canvas.getBoundingClientRect().top
	};
}

function renderLoop() {
	
	window.requestAnimationFrame(renderLoop);
	
	renderBoard();
	
}

function loadBoardCharacteristics(canvas, topX, topY) {
	board.heightPerPiece = 100;
	board.widthPerPiece = 100;
	board.heightInPieces = canvas.height/board.heightPerPiece;
	board.widthInPieces = canvas.width/board.widthPerPiece;
	
	board.topLeft = {
		x: topX,
		y: topY
	}
	
	board.bottomRight = {
		x: board.topLeft.x + canvas.width,
		y: board.topLeft.y + canvas.height
	}
	
}

function connect(wsAddr) {
	ws = new WebSocket(wsAddr);
	ws.onmessage = function(data){
		showGreeting(data.data);
	}
}

function disconnect() {
    if (ws != null) {
        ws.close();
    }
    console.log("Disconnected");
}

function sendMsg() {
    ws.send("hello");
}

function showGreeting(message) {
    $("#greetings").html("Last Updated: " + (Date.now()));
}

function renderBoard() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "green";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	gameModel.pieces.forEach(function(piece) {
		if (piece.item == 1) {
			drawPiece(castle1, piece.x, piece.y);
		}
		if (piece.item == 2) {
			drawPiece(castle2, piece.x, piece.y);
		}
	});
	
	if (grid == true)
		drawGrid();
	
	if (selected)
		drawSelected();
}

function drawPiece(item, x, y) {
	ctx.drawImage(item, xToPixel(x), yToPixel(y), board.widthPerPiece, board.heightPerPiece);
}

function xToPixel(pieceX) {
	var relativeX = pieceX - board.topLeft.x;
	return relativeX * board.widthPerPiece;
}

function yToPixel(pieceY) {
	var relativeY = pieceY - board.topLeft.y;
	return relativeY * board.heightPerPiece;
}

function drawLine() {
	ctx.moveTo(0,0);
	ctx.lineTo(200,100);
	ctx.stroke();

}

function drawGrid() {

	ctx.lineWidth = "1";
	ctx.strokeStyle = "black";
	for (var x = 0; x <= canvas.width-1; x = x + board.widthPerPiece) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.width);
		ctx.stroke();
	}
	
	for (var y=0; y<=canvas.height-1; y+=board.heightPerPiece) {
		ctx.beginPath();
		ctx.moveTo(0 , y);
		ctx.lineTo(canvas.height, y);
		ctx.stroke();
	}
}

function drawSelected() {
	ctx.beginPath();
	ctx.lineWidth = "4";
	ctx.strokeStyle = "blue"
	ctx.rect(selected.x*board.widthPerPiece,
			 selected.y*board.heightPerPiece,
			 board.widthPerPiece,
			 board.heightPerPiece);
	ctx.stroke();
}

function toggleGrid() {
	grid = !grid;
	
	if (grid == true) {
		$("#gridBtn").text("Hide Grid");
	} else {
		$("#gridBtn").text("Show Grid");
	}
}

