package com.garnett.main.dao;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.garnett.main.SocketHandler;
import com.garnett.model.GameAction;
import com.garnett.model.GameBoard;
import com.garnett.model.Piece;
import com.garnett.utilities.GameProperties;

public class GameBoardManager {

	private static GameBoardManager instance = new GameBoardManager();
	private Map<String,GameBoard> gameBoards;
	final static Logger LOG = Logger.getLogger(GameBoardManager.class);
	private GameProperties props = GameProperties.getInstance();
	private SocketHandler socketHandler;
	private UserManager userMgr = UserManager.getInstance();
	private ObjectMapper mapper = new ObjectMapper();
	private static String USER_ACTION_CLICKED = "clicked";
	private static String MAP_PAN = "mappan";
	private Object lock = "";
	
	private GameBoardManager() {
		
		gameBoards = new ConcurrentHashMap<>();
		gameBoards.put("whatever", randStartingPieces("whatever", Integer.parseInt(props.getProperty("boardSize.height")), Integer.parseInt(props.getProperty("boardSize.width"))));
		
		int tickRate = Integer.parseInt(props.getProperty("tickrate"));
		
		Thread gameLoop = new Thread(() -> {
			while (true) {
				try {
					updateAllUsers();
					Thread.sleep(1000/tickRate);
				} catch (InterruptedException e) {
					LOG.error("Error Sleeping", e);
				}
			}
		});
		
		gameLoop.start();
		
	}
	
	public void setSocketHandler(SocketHandler h) {
		this.socketHandler = h;
	}
	
	public static GameBoardManager getInstance() { return instance; }
	
	private void updateAllUsers() {
		// TODO: Kick off threads to update all users at once.
		userMgr.getActiveUsers().forEach(user -> {
			try {
				String msgToSend = mapper.writeValueAsString(getBoard(user.whichBoard, user.topLeftX, user.topLeftY, user.height, user.width, user.userName));
				//LOG.info(msgToSend);
				socketHandler.sendToSession(user.wsSession.getId(), msgToSend);
			} catch (Exception e) {
				LOG.error("Error sending update to " + user.userName, e);
			}
		});
	}
	
	public void handleGameAction(GameAction action) {
		LOG.info("Handling action " + action.action);
		synchronized (lock) {
			if (action.action.equals(USER_ACTION_CLICKED))
				handleClicked(action);
			else if (action.action.equals(MAP_PAN)) {
				handleMove(action);
			} else {
				gameBoards.get(action.whichBoard).getPiece(action.x, action.y).actions.add(action);
			}
		}
	}
	
	public void handleClicked(GameAction action) {
		
		// clear out their last click
		gameBoards.get(action.whichBoard).pieces.forEach(piece -> {
			List<GameAction> actionToRemove = new ArrayList<>();
			piece.actions.forEach(pieceAction -> {
				if (pieceAction.action.equals(USER_ACTION_CLICKED) && pieceAction.userName.equals(action.userName)) {
					actionToRemove.add(pieceAction);
				}
			});
			actionToRemove.forEach(removed -> {
				piece.actions.remove(removed);
			});

		});
		// add their current click
		gameBoards.get(action.whichBoard).getPiece(action.x, action.y).actions.add(action);
	}
	
	public void handleMove(GameAction action) {
		userMgr.moveUser(action.userName, action.x, action.y);
	}
	
	public GameBoard getBoard(String boardName) { return gameBoards.get(boardName); }
	
	public GameBoard getBoard(String boardName, int topLeftX, int topLeftY, int height, int width, String userName) { 
		
		GameBoard gb = new GameBoard(boardName, height, width);
		gb.pieces = new ArrayList<>();
		
		for (int x=topLeftX; x<=(topLeftX+width)-1; x++) {
			for (int y=topLeftY; y<=(topLeftY + height)-1; y++) {
				gb.pieces.add(gameBoards.get(boardName).getPiece(x, y));
			}
		}
		gb.update = new Date();
		gb.user = userMgr.getUser(userName, height, width);
		gb.topLeftX = topLeftX;
		gb.topLeftY = topLeftY;
		return gb;
	}
	
	private GameBoard randStartingPieces(String name, int height, int width) {
		
		GameBoard gb = new GameBoard(name, height, width);
		
		gb.pieces = new ArrayList<>();
		Random r = new Random();
		for (int x=0; x<=width-1; x++) {
			for (int y=0; y<=height-1; y++) {
				gb.pieces.add(new Piece(r.nextInt(15), x, y));
			}
		}
		
		return gb;
	}
	
}
