
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

var mountain = new Image();   
mountain.src = 'images/Mountain-Clipart-PNG-02.png';

//var forest = new Image();   
//forest.src = 'images/forest-clipart-free.png';

var gameModel;
var grid = false;
var selected;
var hover;
var ws;
var sessionInfo;

function initialLoadBoard(topLeftX, topLeftY, whichBoard, wsLocation) {
	
	canvas.addEventListener("click", onClick, false);
	//canvas.addEventListener("mouseover", onMouseOver, false);
	canvas.addEventListener("mousedown", onDrag, false);
	canvas.addEventListener("mouseup", onDrag, false);
	
	
	ctx = canvas.getContext("2d");
	loadBoardCharacteristics(canvas, topLeftX, topLeftY);
	sessionInfo.height = board.heightInPieces;
	sessionInfo.width = board.widthInPieces;
	
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
	
	canvas = document.getElementById("gameBoard");
	
	$.get("/register", {height: canvas.height/100, width: canvas.width/100}, function(data, status) {
		sessionInfo = data;
		initialLoadBoard(data.topLeftX, data.topLeftY, data.whichBoard, data.wsLocation);
		buildMoveButtons();
	});
}

function onDrag(e) {
	 console.log(e.clientX + " " + e.clientY);
}

function onClick(e) {
	var pos = getMousePos(e);
	console.log("click on " + pos.x + "," + pos.y);
	
	var rel = whichRelativeTile(pos);
	console.log("Relative " + rel.x + "," + rel.y);
	selected = rel;
	
	var act = whichActualTile(pos);
	console.log("Actual " + act.x + "," + act.y);
	
	act.action = "clicked";
	act.userName = sessionInfo.userName;
	act.whichBoard = sessionInfo.whichBoard;
	
	sendMsg(act);
}

function move(dir) {
	
	if (dir === "up") {
		moveMap(board.topLeft.x, board.topLeft.y - 1);
	} else if (dir === "down") {
		moveMap(board.topLeft.x, board.topLeft.y + 1);
	} else if (dir === "left") {
		moveMap(board.topLeft.x - 1, board.topLeft.y);
	} else if (dir === "right") {
		moveMap(board.topLeft.x + 1, board.topLeft.y);
	}
	
}

function buildMoveButtons() {
	var btns = "<button name=\"upBtn\" id=\"upBtn\" onClick=\"move('up'); \" type=\"button\" class=\"btn\">Up</button>";
	btns += "<button name=\"downBtn\" id=\"downBtn\" onClick=\"move('down'); \" type=\"button\" class=\"btn\">Down</button>";
	btns += "<button name=\"leftBtn\" id=\"leftBtn\" onClick=\"move('left'); \" type=\"button\" class=\"btn\">Left</button>";
	btns += "<button name=\"rightBtn\" id=\"rightBtn\" onClick=\"move('right'); \" type=\"button\" class=\"btn\">Right</button>";
	
	$("#moveButtons").html(btns);
}

function moveMap(x, y) {
	var act = {x: x,
			   y: y };
	
	console.log("Moving to Actual " + act.x + "," + act.y);
	
	act.action = "mappan";
	act.userName = sessionInfo.userName;
	act.whichBoard = sessionInfo.whichBoard;
	
	sendMsg(act);
}

function onMouseOver(e) {
	var pos = getMousePos(e);
	var rel = whichRelativeTile(pos);
	
	hover = rel;
}

function whichRelativeTile(pos) {
	return {
		x: Math.floor(pos.x/board.heightPerPiece),
		y: Math.floor(pos.y/board.heightPerPiece)
	};
}

function whichActualTile(pos) {
	var rel = whichRelativeTile(pos);
	
	return relativeToActual(rel);
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
		//console.log(data.data);
		gameModel = JSON.parse(data.data);
		showGreeting(new Date(gameModel.update));
	}
	ws.onopen = function() {
		sendMsg(sessionInfo);
	}
}

function disconnect() {
    if (ws != null) {
        ws.close();
    }
    console.log("Disconnected");
}

function sendMsg(msg) {
    ws.send(JSON.stringify(msg));
}

function showGreeting(date) {
    $("#greetings").html("Last Updated: " + date);
}

function renderBoard() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "green";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	gameModel.pieces.forEach(function(piece) {
		if (piece.item == 1) {
			drawPiece(castle1, piece.x, piece.y);
		} else if (piece.item == 2) {
			drawPiece(castle2, piece.x, piece.y);
		} else if (piece.item == 3) {
			drawPiece(mountain, piece.x, piece.y);
		} //else if (piece.item == 4) {
		//	drawPiece(mountain2, piece.x, piece.y);
		//} //else if (piece.item == 5) {
		//	drawPiece(forest, piece.x, piece.y);
		//}
		
		if (piece.actions != null && piece.actions.length > 0) {
			piece.actions.forEach(function(act) {
				if (act.action === "clicked" && act.userName != sessionInfo.userName) {
					drawBox(actualToRelative(piece), "red", act.userName);
				}
			});
		}
		//	.piece.action.action === "clicked" && piece.action.userName !== sessionInfo.userName) {
		
		//	drawBox(actualToRelative(piece), "red", piece.action.userName);
		
	});
	
	if (grid == true)
		drawGrid();
	
	if (selected)
		drawSelected();
	
	drawUserDetails();
	
//	if (hover)
//		drawHover();
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

function relativeToActual(relativeXy) {
	return {
		x: relativeXy.x + board.topLeft.x,
		y: relativeXy.y + board.topLeft.y
	}
}

function actualToRelative(actualXy) {
	return {
		x: actualXy.x - board.topLeft.x,
		y: actualXy.y - board.topLeft.y
	}
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
	var act = relativeToActual(selected);
	drawBox(selected, "blue", act.x + "," + act.y);
	
}

function drawUserDetails() {
	ctx.beginPath();
	//ctx.lineWidth = "0.5";
	ctx.font="18px Arial";
	var userDetails = gameModel.user.userName + "  Gold: " + gameModel.user.gold + "  Wood: " + gameModel.user.wood + "  Land: " + gameModel.user.land + "  Stone: " + gameModel.user.stone;
	ctx.strokeText(userDetails, 10, 15);
	
}

function drawBox(xy, color, text) {
	ctx.beginPath();
	ctx.lineWidth = "4";
	ctx.strokeStyle = color;
	ctx.rect(xy.x*board.widthPerPiece,
			 xy.y*board.heightPerPiece,
			 board.widthPerPiece,
			 board.heightPerPiece);
	ctx.stroke();
	
	ctx.lineWidth = "0.5";
	ctx.font="12px Georgia";
	ctx.strokeText(text, (xy.x*board.widthPerPiece)+5,(xy.y*board.heightPerPiece)+15);
	
}

//function drawHover() {
//	ctx.beginPath();
//	ctx.fillStyle = "#8ED660"
//	ctx.fillRect(hover.x*board.widthPerPiece,
//			 hover.y*board.heightPerPiece,
//			 board.widthPerPiece,
//			 board.heightPerPiece);
//}

function toggleGrid() {
	grid = !grid;
	
	if (grid == true) {
		$("#gridBtn").text("Hide Grid");
	} else {
		$("#gridBtn").text("Show Grid");
	}
}

