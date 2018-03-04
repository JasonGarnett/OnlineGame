// Controller Code

var Controller = function() {
	/**
	 * Private Members
	 */ 
	var ws;
	var sessionInfo;
	var gameModel;
	var board = {
			heightPerPiece: 0,
			widthPerPiece: 0,
			heightInPieces: 0,
			widthInPieces: 0,
			topLeft: {},
			bottomRight: {}
	}
	
	function send(msg) {
		ws.send(JSON.stringify(msg));
	}
	function buildStub(action) {
		
		var msg = {};
		msg.detail = {}
		msg.detail.type = action;
		msg.userName = sessionInfo.userName;
		msg.whichBoard = sessionInfo.whichBoard;
		
		return msg;
	}
	function moveMap(x, y) {
		console.log("Moving to Actual " + x + "," + y);
		var msg = buildStub("mappan");
		msg.x = x;
		msg.y = y;
		
		send(msg);
	}
	
	
	return {
		/**
		 * Public Members
		 */
		register: function(canvas) {
			$.get("/register", {height: canvas.height/100, width: canvas.width/100}, function(data, status) {
				sessionInfo = data;
				initialLoadBoard(data.topLeftX, data.topLeftY, data.whichBoard, data.wsLocation);
			//	buildMoveButtons();
			});
		},
		getBoard: function() {
			return board;
		},
		setGameModel: function(gm) {
			gameModel = gm;
		},
		getGameModel: function() {
			return gameModel;
		},
		getSessionInfo: function() {
			return sessionInfo;
		},
		sendMsg: function(msg) {
		   	send(msg);
		},
		buildMsgStub: function(action) {
			return buildStub(action);
		},
		connect: function(wsAddr) {
			ws = new WebSocket(wsAddr);
			
			ws.onmessage = function (data) {
				//console.log(data.data);
				gameModel = JSON.parse(data.data);
				board.topLeft.x = gameModel.topLeftX;
				board.topLeft.y = gameModel.topLeftY;
				renderer.showGreeting(new Date(gameModel.update));
			}

			ws.onopen = function() {
				send(sessionInfo);
			}
		},
		disconnect: function() {
		    if (w != null) {
		        ws.close();
		    }
		    console.log("Disconnected");
		},
		moveMap: function(x, y) {
			console.log("Moving to Actual " + x + "," + y);
			var msg = buildStub("mappan");
			msg.x = x;
			msg.y = y;
			
			send(msg);
		},
		move: function(dir) {
			
			if (dir === "up" && board.topLeft.y > 0) {
				moveMap(board.topLeft.x, board.topLeft.y - 1);
			} else if (dir === "down") {
				moveMap(board.topLeft.x, board.topLeft.y + 1);
			} else if (dir === "left" && board.topLeft.x > 0) {
				moveMap(board.topLeft.x - 1, board.topLeft.y);
			} else if (dir === "right") {
				moveMap(board.topLeft.x + 1, board.topLeft.y);
			} else {
				console.log("Illegal move");
			}
			
		},
		loadBoardCharacteristics: function(canvas, topX, topY) {
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
			
		},
		whichActualTile: function(pos) {
			var rel = controller.whichRelativeTile(pos);
			
			return controller.relativeToActual(rel);
		},
		whichRelativeTile: function(pos) {
			return {
				x: Math.floor(pos.x/board.heightPerPiece),
				y: Math.floor(pos.y/board.heightPerPiece)
			};
		},
		xToPixel: function(pieceX) {
			var relativeX = pieceX - board.topLeft.x;
			return relativeX * board.widthPerPiece;
		},

		yToPixel: function(pieceY) {
			var relativeY = pieceY - board.topLeft.y;
			return relativeY * board.heightPerPiece;
		},

		relativeToActual: function(relativeXy) {
			return {
				x: relativeXy.x + board.topLeft.x,
				y: relativeXy.y + board.topLeft.y
			}
		},

		actualToRelative: function(actualXy) {
			return {
				x: actualXy.x - board.topLeft.x,
				y: actualXy.y - board.topLeft.y
			}
		}
	}
};


var controller = new Controller();

//Renderer Code
function register() {
	
	canvas = document.getElementById("gameBoard");
	controller.register(canvas);
}


var Renderer = function() {
	
	var ctx;
	
	var castle1 = new Image();   
	castle1.src = 'images/images-castle-clipart-830x717.png';

	var castle2 = new Image();   
	castle2.src = 'images/castle-clip-art-2.png';

	var mountain = new Image();   
	mountain.src = 'images/Mountain-Clipart-PNG-02.png';
		
	return {
		MAX_ZOOM_IN: 8,
		MAX_ZOOM_OUT: 30,
		setCtx: function(c) {
			ctx = c;
		},
		getCtx: function() {
			return ctx;
		},
		onDrag: function(e) {
			console.log(e.clientX + " " + e.clientY);
		},
		buildMoveButtons: function() {
			var btns = "<button name=\"upBtn\" id=\"upBtn\" onClick=\"move('up'); \" type=\"button\" class=\"btn\">Up</button>";
			btns += "<button name=\"downBtn\" id=\"downBtn\" onClick=\"move('down'); \" type=\"button\" class=\"btn\">Down</button>";
			btns += "<button name=\"leftBtn\" id=\"leftBtn\" onClick=\"move('left'); \" type=\"button\" class=\"btn\">Left</button>";
			btns += "<button name=\"rightBtn\" id=\"rightBtn\" onClick=\"move('right'); \" type=\"button\" class=\"btn\">Right</button>";
			
			$("#moveButtons").html(btns);
		},
		showGreeting: function(date) {
			$("#greetings").html("Last Updated: " + date);
		},
		drawBox: function(xy, color, text) {
			ctx.beginPath();
			ctx.lineWidth = "4";
			ctx.strokeStyle = color;
			ctx.rect(xy.x*controller.getBoard().widthPerPiece,
					 xy.y*controller.getBoard().heightPerPiece,
					 controller.getBoard().widthPerPiece,
					 controller.getBoard().heightPerPiece);
			ctx.stroke();
			
			ctx.lineWidth = "0.5";
			ctx.font="12px Georgia";
			ctx.strokeText(text, (xy.x*controller.getBoard().widthPerPiece)+5,(xy.y*controller.getBoard().heightPerPiece)+15);
			
		},
		drawPiece: function(item, x, y) {
			if (item == 1) {
				ctx.drawImage(castle1, controller.xToPixel(x), controller.yToPixel(y), controller.getBoard().widthPerPiece, controller.getBoard().heightPerPiece);
			} else if (item == 2) {
				ctx.drawImage(castle2, controller.xToPixel(x), controller.yToPixel(y), controller.getBoard().widthPerPiece, controller.getBoard().heightPerPiece);
			} else if (item == 3) {
				ctx.drawImage(mountain, controller.xToPixel(x), controller.yToPixel(y), controller.getBoard().widthPerPiece, controller.getBoard().heightPerPiece);
			}

		},
		drawUserDetails: function() {
			ctx.beginPath();
			//ctx.lineWidth = "0.5";
			ctx.font="18px Arial";
			var userDetails = controller.getGameModel().user.userName + "  Gold: " +  controller.getGameModel().user.gold + "  Wood: " +  controller.getGameModel().user.wood + 
							  "  Land: " +  controller.getGameModel().user.land + "  Stone: " +  controller.getGameModel().user.stone;
			ctx.strokeText(userDetails, 10, 15);
			
		},
		drawGrid: function() {

			ctx.lineWidth = "1";
			ctx.strokeStyle = "black";
			// Draw Vertical Lines
			for (var x = 0; x <= canvas.width-1; x = x + controller.getBoard().widthPerPiece) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, canvas.height);
				ctx.stroke();
			}
			
			// Draw Hoizontal Lines
			for (var y=0; y<=canvas.height-1; y+=controller.getBoard().heightPerPiece) {
				ctx.beginPath();
				ctx.moveTo(0 , y);
				ctx.lineTo(canvas.width, y);
				ctx.stroke();
			}
		}
	}
};

var canvas;

var renderer = new Renderer();

var grid = false;
var selected;
var hover;

function initialLoadBoard(topLeftX, topLeftY, whichBoard, wsLocation) {
	
	registerEventHandlers();
	renderer.buildMoveButtons();
	renderer.setCtx(canvas.getContext("2d"));
	controller.loadBoardCharacteristics(canvas, topLeftX, topLeftY);
	controller.getSessionInfo().height = controller.getBoard().heightInPieces;
	controller.getSessionInfo().width = controller.getBoard().widthInPieces;
	
	$.get("/gameboard/" + whichBoard, {
		topLeftX:controller.getBoard().topLeft.x,
		topLeftY:controller.getBoard().topLeft.y,
		height: controller.getBoard().heightInPieces,
		width: controller.getBoard().widthInPieces
		}, function(data, status) {
			controller.setGameModel(data);
			controller.connect(wsLocation);
			renderLoop();
	});
	
}

function registerEventHandlers() {
	canvas.addEventListener("click", onClick, false);
	//canvas.addEventListener("mouseover", onMouseOver, false);
	canvas.addEventListener("mousedown", renderer.onDrag, false);
	canvas.addEventListener("mouseup", renderer.onDrag, false);
	canvas.addEventListener("mousewheel", onMouseWheel, false);
	window.addEventListener("keydown", onKeyDown, false);
}

function move(dir) {
	controller.move(dir);
}

function onMouseOver(e) {
	var pos = getMousePos(e);
	var rel = controller.whichRelativeTile(pos);
	
	hover = rel;
}

function onMouseWheel(e) {
		
	zoom(e.wheelDelta/120);
	 if ((e.wheelDelta/120) > 0) {
		 console.log("Zooming in to " + e.clientX + " " + e.clientY);
	 } else {
		 console.log("Zooming out from " + e.clientX + " " + e.clientY);
	 }
}

function zoom(where) {
	if (((where > 0) && (controller.getBoard().heightInPieces > renderer.MAX_ZOOM_IN || controller.getBoard().widthInPieces > renderer.MAX_ZOOM_IN)) || 
		((where < 0) && (controller.getBoard().heightInPieces < renderer.MAX_ZOOM_OUT || controller.getBoard().widthInPieces < renderer.MAX_ZOOM_OUT))	) {
		if (where > 0) {
			controller.getBoard().heightPerPiece = controller.getBoard().heightPerPiece + 1;
			controller.getBoard().widthPerPiece = controller.getBoard().widthPerPiece + 1;
		} else {
			controller.getBoard().heightPerPiece = controller.getBoard().heightPerPiece - 1;
			controller.getBoard().widthPerPiece = controller.getBoard().widthPerPiece - 1;
		}
		controller.getBoard().heightInPieces = Math.ceil(canvas.height / controller.getBoard().heightPerPiece);
		controller.getBoard().widthInPieces = Math.ceil(canvas.width / controller.getBoard().widthPerPiece);
		
		console.log("new height: " + controller.getBoard().heightInPieces + "::new width: " + controller.getBoard().widthInPieces)
		
		var msg = controller.buildMsgStub("zoom");
		msg.x = 0;
		msg.y = 0;
		msg.detail.newHeight = controller.getBoard().heightInPieces
		msg.detail.newWidth = controller.getBoard().widthInPieces;
		
		controller.sendMsg(msg);
	} else {
		console.log("Max zoom reached");
	}
}

function onClick(e) {
	var pos = getMousePos(e);
	console.log("click on " + pos.x + "," + pos.y);
	
	var rel = controller.whichRelativeTile(pos);
	console.log("Relative " + rel.x + "," + rel.y);
	selected = rel;
	
	var act = controller.whichActualTile(pos);
	console.log("Actual " + act.x + "," + act.y);
	var msg = controller.buildMsgStub("clicked");
	msg.x = act.x;
	msg.y = act.y;
	
	controller.sendMsg(msg);
}

function onKeyDown(e) {
	
	var code = e.keyCode;
	
	switch (code) {
    	case 37: move("left"); break; //Left key
    	case 38: move("up"); break; //Up key
    	case 39: move("right"); break; //Right key
    	case 40: move("down"); break; //Down key
	}	
}

function getMousePos(e) {
	return {
		x: e.clientX - canvas.getBoundingClientRect().left,
		y: e.clientY - canvas.getBoundingClientRect().top
	};
}

function drawSelected() {
	var act = controller.relativeToActual(selected);
	renderer.drawBox(selected, "blue", act.x + "," + act.y);
	
}

function toggleGrid() {
	grid = !grid;
	
	if (grid == true) {
		$("#gridBtn").text("Hide Grid");
	} else {
		$("#gridBtn").text("Show Grid");
	}
}

function renderLoop() {
	
	window.requestAnimationFrame(renderLoop);
	
	renderBoard();
}

function renderBoard() {
	renderer.getCtx().clearRect(0, 0, canvas.width, canvas.height);
	renderer.getCtx().fillStyle = "green";
	renderer.getCtx().fillRect(0, 0, canvas.width, canvas.height);
	controller.getGameModel().pieces.forEach(function(piece) {
	
		renderer.drawPiece(piece.item, piece.x, piece.y);
		
		if (piece.actions != null && piece.actions.length > 0) {
			piece.actions.forEach(function(act) {
				if (act.detail.type === "clicked" && act.userName != controller.getSessionInfo().userName) {
					renderer.drawBox(controller.actualToRelative(piece), "red", act.userName);
				}
			});
		}
		
	});
	
	if (grid == true)
		renderer.drawGrid();
	
	if (selected)
		drawSelected();
	
	renderer.drawUserDetails();

}