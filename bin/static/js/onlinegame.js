
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


var imageObj = new Image();   
imageObj.src = 'https://www.html5canvastutorials.com/demos/assets/darth-vader.jpg';

var gameModel;
var grid = false;

function initialLoadBoard() {
	
	canvas = document.getElementById("gameBoard");
	ctx = canvas.getContext("2d");
	loadBoardCharacteristics(canvas, 33, 45);
		
    var whichBoard = "whatever";    
    
	$.get("/gameboard/" + whichBoard, {
		topLeftX:board.topLeft.x,
		topLeftY:board.topLeft.y,
		height: board.heightInPieces,
		width: board.widthInPieces
		}, function(data, status) {
			gameModel = data;
			//console.log("Got stuff");
			renderLoop();
	});
	
	
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

function renderBoard() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	gameModel.pieces.forEach(function(piece) {
		if (piece.item == 1) {
			drawPiece(imageObj, piece.x, piece.y);
		}
	});
	
	if (grid == true)
		drawGrid();
}

function drawPiece(item, x, y) {
	ctx.drawImage(item, xToPixel(x), yToPixel(y), board.widthPerPiece, board.heightPerPiece);
}

function xToPixel(pieceX) {
	var relativeX = pieceX - board.topLeft.x;
	//console.log("Piece X = " + pieceX + " relative X = " + relativeX);
	return relativeX * board.widthPerPiece;
}

function yToPixel(pieceY) {
	var relativeY = pieceY - board.topLeft.y;
	//console.log("Piece Y = " + pieceY + " relative Y = " + relativeY);
	return relativeY * board.heightPerPiece;
}

function drawLine() {
	ctx.moveTo(0,0);
	ctx.lineTo(200,100);
	ctx.stroke();

}

function drawGrid() {

	for (var x = 0; x <= canvas.width-1; x = x + board.widthPerPiece) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.width);
		ctx.stroke();
	}
	
	for (var y=0; y<=canvas.height-1; y+=board.heightPerPiece) {
		ctx.moveTo(0 , y);
		ctx.lineTo(canvas.height, y);
		ctx.stroke();
	}
}

function toggleGrid() {
	grid = !grid;
	$("gridBtn").val("Hide Grid");
}

