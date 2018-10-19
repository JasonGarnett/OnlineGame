// Globals (use sparingly)

var controller;
var renderer;

function register() {
	renderer = new Renderer(document.getElementById("gameBoard"));
	controller = new Controller();
	controller.register();
}

function move(dir) {
	controller.move(dir);
}

function toggleGrid() {
	renderer.toggleGrid();
}

function toggleIsoGrid() {
	renderer.toggleIsoGrid();
}

function conquer(x,y) {
	controller.conquer(x,y);
}

function build(item, x, y) {
	controller.build(x,y, item);
}


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
			mapHeight: 0,
			mapWidth: 0,
			topLeft: {},
			bottomRight: {}
	}
	
	var MAX_ZOOM_IN = 8;
	var MAX_ZOOM_OUT = 30;
	
	function connect(wsAddr) {
		ws = new WebSocket(wsAddr);
		
		ws.onmessage = function (message) {
			var msg = JSON.parse(message.data);

			if (msg.messageType === "RESPONSE") { // Response to message Update
				console.log(msg);
				var actResponse = "Command Success: " + msg.success + " Reason: " + msg.reason;
				console.log(actResponse);
				renderer.showActionResponse(actResponse);
			} else if (msg.messageType === "GAMEBOARD") { // Regular Model Update
				gameModel = msg;
				board.topLeft.x = gameModel.topLeftX;
				board.topLeft.y = gameModel.topLeftY;
				board.mapHeight = gameModel.mapHeight;
				board.mapWidth = gameModel.mapWidth;
				renderer.showGreeting(new Date(gameModel.update));
			}
		}

		ws.onopen = function() {
			send(sessionInfo);
		}
	}
	
	function disconnect() {
	    if (ws != null) {
	        ws.close();
	    }
	    console.log("Disconnected");
	}
	
	function send(msg) {
		if (ws != null) {
			ws.send(JSON.stringify(msg));
		} else {
			console.log("Websocket is closed, cannot send any messages!");
		}
	}
	
	function buildStub(action) {
		
		var msg = {};
		msg.detail = {}
		msg.detail.type = action;
		msg.userName = sessionInfo.userName;
		msg.userColor = sessionInfo.color
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
	
	function loadBoardCharacteristics(topX, topY) {
		
		var cSize = renderer.getCanvasHeightWidth();
		
		board.heightPerPiece = 100;
		board.widthPerPiece = 100;
		board.heightInPieces = cSize.height/board.heightPerPiece;
		board.widthInPieces = cSize.width/board.widthPerPiece;
		
		board.topLeft = {
			x: topX,
			y: topY
		}
		
		board.bottomRight = {
			x: board.topLeft.x + cSize.width,
			y: board.topLeft.y + cSize.height
		}
		
	}
	
	function initialLoadBoard(topLeftX, topLeftY, whichBoard, wsLocation) {
		
		renderer.registerEventHandlers();
		renderer.buildMoveButtons();

		loadBoardCharacteristics(topLeftX, topLeftY);
		sessionInfo.height =board.heightInPieces;
		sessionInfo.width = board.widthInPieces;
		
		$.get("/gameboard/" + whichBoard, {
			topLeftX:board.topLeft.x,
			topLeftY:board.topLeft.y,
			height: board.heightInPieces,
			width: board.widthInPieces
			}, function(data, status) {
				gameModel = data;
				renderer.setCanvasImages(data.baseTiles);
				renderer.setImprovements(data.improvements);
				connect(wsLocation);
				renderer.render();
		});
		
	}
	
	function canMoveRight() {	
		return (board.topLeft.x + board.widthInPieces)  < board.mapWidth;
	}
	
	function canMoveLeft() {
		return board.topLeft.x > 0;
	}
	
	function canMoveUp() {
		return board.topLeft.y > 0;
	}
	
	function canMoveDown() {
		return (board.topLeft.y + board.heightInPieces)  < board.mapHeight;
	}
	
	function canZoomOut() {
		return canMoveRight() && canMoveDown();
	}
	
	return {
		/**
		 * Public Members
		 */
		register: function() {
			var cSize = renderer.getCanvasHeightWidth();
			$.get("/register", {height: cSize.height/100, width: cSize.width/100}, function(data, status) {
				sessionInfo = data;
				initialLoadBoard(data.topLeftX, data.topLeftY, data.whichBoard, data.wsLocation);
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
		move: function(dir) {
			
			if (dir === "up" && canMoveUp()) {
				moveMap(board.topLeft.x, board.topLeft.y - 1);
			} else if (dir === "down" && canMoveDown()) {
				moveMap(board.topLeft.x, board.topLeft.y + 1);
			} else if (dir === "left" && canMoveLeft()) {
				moveMap(board.topLeft.x - 1, board.topLeft.y);
			} else if (dir === "right" && canMoveRight()) {
				moveMap(board.topLeft.x + 1, board.topLeft.y);
			} else {
				console.log("Illegal move");
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
		tileSelected: function(x,y) {
			gameModel.pieces.forEach(function(piece) {
				if (piece.x === x && piece.y === y) {
					var btns = "<b>Land Owned by: " + (piece.owner || "No one") + "<p><p>";
					if (piece.owner === sessionInfo.userName && piece.item === 1) { // Mountain
						btns += "<button name=\"downBtn\" id=\"downBtn\" onClick=\"build('mine'," + x + "," + y + "); \" type=\"button\" class=\"btn\">Build Mine</button>";
					}
					else if (piece.owner === sessionInfo.userName && (piece.item === 2 || piece.item === 3 )) { // Forest
						btns += "<button name=\"downBtn\" id=\"downBtn\" onClick=\"build('mill'," + x + "," + y + "); \" type=\"button\" class=\"btn\">Build Lumber Mill</button>";
					}
					else if (piece.owner === sessionInfo.userName){ // Plains
						btns += "<button name=\"downBtn\" id=\"downBtn\" onClick=\"build('farm'," + x + "," + y + "); \" type=\"button\" class=\"btn\">Build Farm</button>";
						btns += "<button name=\"downBtn\" id=\"downBtn\" onClick=\"build('castle'," + x + "," + y + "); \" type=\"button\" class=\"btn\">Build Castle</button>";
					}
					
					if (piece.owner !== sessionInfo.userName) {
						btns += "<button name=\"conquer\" id=\"conquerButton\" onClick=\"conquer(" + x + "," + y + "); \" type=\"button\" class=\"btn\">Conquer Tile</button>";
					}
					
					if (piece.actions != null && piece.actions.length > 0) {
						piece.actions.forEach(function(act) {
							if (act.detail.type === "conquer") {
								 btns += "<p><p><b>Being Conquered by: " + act.userName + " (" +act.detail.percentConquered + " %)</b><p>";
							}
						});
					}
					
					$("#options").html(btns);
				}
			});
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
		},
		build: function(x, y, whatToBuild) {
			console.log("Building: " + whatToBuild + " at " + x + "," + y);
			
			var msg = buildStub(whatToBuild);
			msg.x = x;
			msg.y = y;
			msg.detail.level = 1;
			msg.detail.percentComplete = 0;
			
			send(msg);
			
		},
		conquer: function(x, y) {
			console.log("Conquering: " + x + "," + y);
		
			var msg = buildStub("conquer");
			msg.x = x;
			msg.y = y;
			
			send(msg);
		},
		zoom: function(where) {
			
			if (((where > 0) && (board.heightInPieces > MAX_ZOOM_IN || board.widthInPieces > MAX_ZOOM_IN)) || 
				((where < 0) && (board.heightInPieces < MAX_ZOOM_OUT || board.widthInPieces < MAX_ZOOM_OUT))) {
				if ((where > 0) || ((where < 0) && canZoomOut())) {
					if (where > 0) {
						console.log("Zooming in");
						board.heightPerPiece = board.heightPerPiece + 1;
						board.widthPerPiece = board.widthPerPiece + 1;
					} else {
						console.log("Zooming out");
						board.heightPerPiece = board.heightPerPiece - 1;
						board.widthPerPiece = board.widthPerPiece - 1;
					}
					var cSize = renderer.getCanvasHeightWidth();
					board.heightInPieces = Math.ceil(cSize.height / board.heightPerPiece);
					board.widthInPieces = Math.ceil(cSize.width / board.widthPerPiece);
					
					console.log("new height: " + board.heightInPieces + "::new width: " + board.widthInPieces)
					
					var msg = buildStub("zoom");
					msg.x = 0;
					msg.y = 0;
					msg.detail.newHeight = board.heightInPieces
					msg.detail.newWidth = board.widthInPieces;
					
					send(msg);
				}
			} else {
				console.log("Max zoom reached");
			}
		}
	}
};

//Renderer Code

var Renderer = function(c) {
	
	/**
	 * Private Members
	 */
	var canvas = c;
	var ctx = canvas.getContext("2d");
	
	var grid = false;
	var isoGrid = false;
	var selected;
	var dragLine = {};
	var hover;
	var isDragging = false;
	var conquerFlag = 0;
	var CONQUER_PERIOD = 60;
	
	var baseTiles = [];
	var improvements = {};
	
	function getMousePos(e) {
		return {
			x: e.clientX - canvas.getBoundingClientRect().left,
			y: e.clientY - canvas.getBoundingClientRect().top
		};
	}

	function onDrag(e) {
		isDragging = true;
		var pos = getMousePos(e);
		if (e.button === 2) {
			console.log("Right Drag : " + pos.x + " " + pos.y);
		} else if (e.button === 0) {
			dragLine.startX = pos.x;
			dragLine.startY = pos.y;
			console.log("Left Drag : " + pos.x + " " + pos.y);
		}
	}
	
	function onDrop(e) {
		isDragging = false;
		if (e.button === 2) {
			console.log("Right Drop : " + e.clientX + " " + e.clientY);
		} else if (e.button === 0) {
			console.log("Left Drop : " + e.clientX + " " + e.clientY);
		}
		dragLine = {};
	}
	
	function onMove(e) {
		if (isDragging) {
			var pos = getMousePos(e);
			dragLine.currentX = pos.x;
			dragLine.currentY = pos.y;
			console.log("Move : " + pos.x + " " + pos.y);
		}
	}
	
	function onMouseOver(e) {
		var pos = getMousePos(e);
		var rel = controller.whichRelativeTile(pos);
		
		hover = rel;
	}
	
	function onMouseWheel(e) {
		controller.zoom(e.wheelDelta/120);
	}
	
	function onClick(e) {
		var pos = getMousePos(e);
		//console.log("click on " + pos.x + "," + pos.y);
		
		var rel = controller.whichRelativeTile(pos);
		//console.log("Relative " + rel.x + "," + rel.y);
		selected = rel;
		
		var act = controller.whichActualTile(pos);
		console.log("Actual " + act.x + "," + act.y);
		controller.tileSelected(act.x, act.y)
		
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
	
	function drawBox(xy, color, text) {
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
		ctx.strokeStyle = "black";
		ctx.strokeText(text, (xy.x*controller.getBoard().widthPerPiece)+5,(xy.y*controller.getBoard().heightPerPiece)+15);
		
	}
	
	function drawOwned(xy, color, text) {
		ctx.beginPath();
		ctx.lineWidth = "1";
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.globalAlpha= 0.3;
		ctx.fillRect(xy.x*controller.getBoard().widthPerPiece,
				 xy.y*controller.getBoard().heightPerPiece,
				 controller.getBoard().widthPerPiece,
				 controller.getBoard().heightPerPiece);
		ctx.stroke();
		ctx.globalAlpha = 1.0;

		ctx.lineWidth = "0.5";
		ctx.font="12px Georgia";
		ctx.strokeStyle = "black";
		ctx.strokeText(text, (xy.x*controller.getBoard().widthPerPiece)+5,(xy.y*controller.getBoard().heightPerPiece)+15);
		
	}
	
	function isDrawConquered() {
		return conquerFlag > CONQUER_PERIOD/2;
	}
	
	function drawBeingConquered(xy, color, text) {
		if (isDrawConquered()) {
			drawOwned(xy, color, text);
		}
	}
	
	function drawBeingImproved(x, y, act) {
		if (isDrawConquered()) {
			drawImprovement(x, y, act);
		}
	}
	
	function drawDragline() {
		ctx.beginPath();
		ctx.lineWidth="4";
		ctx.moveTo(dragLine.startX,dragLine.startY);
		ctx.lineTo(dragLine.currentX,dragLine.currentY);
		ctx.stroke();
	}
	
	function drawPiece(piece) {
		ctx.drawImage(baseTiles[piece.item], controller.xToPixel(piece.x), controller.yToPixel(piece.y), controller.getBoard().widthPerPiece, controller.getBoard().heightPerPiece);
	}
	
	function drawActions(piece) {
		if (piece.actions != null && piece.actions.length > 0) {
			piece.actions.forEach(function(act) {
				if (act.detail.type === "clicked" && act.userName != controller.getSessionInfo().userName) {
					drawBox(controller.actualToRelative(piece), act.userColor, act.userName);
				} else if (act.detail.type === "conquer") {
					if (act.detail.percentConquered == 100) {
						drawOwned(controller.actualToRelative(piece), act.userColor, act.userName);
					} else {				
						drawBeingConquered(controller.actualToRelative(piece), act.userColor, act.userName)
					}
					
				} else if (act.detail.type === "castle" || act.detail.type === "mill" || act.detail.type === "farm" || act.detail.type === "mine") {
					if (act.detail.percentComplete < 100) {
						drawBeingImproved(piece.x, piece.y, act);
					} else {
						drawImprovement(piece.x, piece.y, act);
					}
				}
			});
		}
	}
	
	function drawImprovement(x,y, act) {
		ctx.drawImage(improvements[act.detail.type + "." + act.detail.level], controller.xToPixel(x), controller.yToPixel(y), controller.getBoard().widthPerPiece, controller.getBoard().heightPerPiece);
	}
	
	function drawSelected(action) {
		var act = controller.relativeToActual(selected);
		drawBox(selected, controller.getSessionInfo().color, act.x + "," + act.y);
		
	}
	
	function drawGrid() {

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
	
	function drawIsoGrid() {

		ctx.lineWidth = "1";
		ctx.strokeStyle = "black";
		// Draw Vertical Lines
//		for (var x = 0; x <= canvas.width-1; x = x + controller.getBoard().widthPerPiece) {
//			ctx.beginPath();
//			ctx.moveTo(x, 0);
//			ctx.lineTo(x, canvas.height);
//			ctx.stroke();
//		}
		
		// Draw Hoizontal Lines
		for (var y=0; y<=canvas.height-1; y+=controller.getBoard().heightPerPiece) {
			ctx.beginPath();
			ctx.moveTo(0 , y);
			ctx.lineTo(canvas.width, y+300);
			ctx.stroke();
		}
		// Draw Other Horizontal Lines
		for (var y=0; y<=canvas.height-1; y+=controller.getBoard().heightPerPiece+10) {
			ctx.beginPath();
			ctx.moveTo(0 , y);
			ctx.lineTo(canvas.width, y-300);
			ctx.stroke();
		}
	}
	
	function drawUserDetails() {
		ctx.beginPath();
		//ctx.lineWidth = "0.5";
		ctx.font="18px Arial";
		ctx.fillStyle = controller.getGameModel().user.color;
		var userDetails = controller.getGameModel().user.userName + "  Gold: " +  controller.getGameModel().user.gold + "  Wood: " +  controller.getGameModel().user.wood + 
						  "  Land: " +  controller.getGameModel().user.land + "  Stone: " +  controller.getGameModel().user.stone + " COLOR: " + controller.getSessionInfo().color;
		ctx.strokeText(userDetails, 10, 15);
		
	}
	
	function renderLoop() {
		
		window.requestAnimationFrame(renderLoop);
		
		renderBoard();
	}

	function renderBoard() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#452a01";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		conquerFlag++;
		if (conquerFlag > CONQUER_PERIOD) {
			conquerFlag = 0;
		}
		
		controller.getGameModel().pieces.forEach(function(piece) {
		
			drawPiece(piece);
			
			drawActions(piece);
			
		});
		
		if (grid == true)
			drawGrid();
		if (isoGrid == true)
			drawIsoGrid();
		
		if (selected)
			drawSelected();
		
		if (isDragging) {
			drawDragline();
		}
		
		drawUserDetails();

	}
		
	return {
		/**
		 * Public Members
		 */
		showGreeting: function(date) {
			$("#greetings").html("Last Updated: " + date);
		},
		showActionResponse: function(resp) {
			$("#actionResponse").html(resp);
		},
		toggleGrid: function() {
			grid = !grid;
			
			if (grid == true) {
				$("#gridBtn").text("Hide Grid");
			} else {
				$("#gridBtn").text("Show Grid");
			}
		},
		toggleIsoGrid: function() {
			isoGrid = !isoGrid;
			
			if (grid == true) {
				$("#isoGridBtn").text("Hide ISO Grid");
			} else {
				$("#isoGridBtn").text("Show ISO Grid");
			}
		},
		getCanvasHeightWidth: function() {
			return {
				height: canvas.height,
				width: canvas.width
			};
		},
		render: function() {
			renderLoop();
		},
		setCanvasImages(tiles) {
			
			for (i = 0; i < tiles.length; i++) {
				var tile = new Image();   
				tile.src = tiles[i];
				baseTiles[i] = tile;
			}
		},
		setImprovements(imp) {
		
			for(var key in imp) {
				var i = new Image();
				i.src = imp[key];
				improvements[key] = i;
			}
		},
		registerEventHandlers: function() {
			canvas.addEventListener("click", onClick, false);
			//canvas.addEventListener("mouseover", onMouseOver, false);
			canvas.addEventListener("mousedown", onDrag, false);
			canvas.addEventListener("mouseup", onDrop, false);
			canvas.addEventListener("mousemove", onMove, false);
			canvas.addEventListener("mousewheel", onMouseWheel, false);
			window.addEventListener("keydown", onKeyDown, false);
		},
		buildMoveButtons: function() {
			var btns = "<button name=\"upBtn\" id=\"upBtn\" onClick=\"move('up'); \" type=\"button\" class=\"btn\">Up</button>";
			btns += "<button name=\"downBtn\" id=\"downBtn\" onClick=\"move('down'); \" type=\"button\" class=\"btn\">Down</button>";
			btns += "<button name=\"leftBtn\" id=\"leftBtn\" onClick=\"move('left'); \" type=\"button\" class=\"btn\">Left</button>";
			btns += "<button name=\"rightBtn\" id=\"rightBtn\" onClick=\"move('right'); \" type=\"button\" class=\"btn\">Right</button>";
			
			$("#moveButtons").html(btns);
		}
	}
};
