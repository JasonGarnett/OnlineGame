package com.garnett.main.dao;

import java.util.ArrayList;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.garnett.main.Controller;
import com.garnett.main.SocketHandler;
import com.garnett.model.GameAction;
import com.garnett.model.GameBoard;
import com.garnett.model.Piece;
import com.garnett.utilities.GameProperties;

public class GameBoardManager {

	private static GameBoardManager instance = new GameBoardManager();
	private Map<String,GameBoard> gameBoards;
	final static Logger LOG = Logger.getLogger(Controller.class);
	private GameProperties props = GameProperties.getInstance();
	private SocketHandler socketHandler;
	private UserManager userMgr = UserManager.getInstance();
	private ObjectMapper mapper = new ObjectMapper();
	
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
		userMgr.getUsers().forEach(user -> {
			try {
				String msgToSend = mapper.writeValueAsString(getBoard(user.whichBoard, user.topLeftX, user.topLeftY, user.height, user.width));
				socketHandler.sendToSession(user.wsSession.getId(), msgToSend);
			} catch (Exception e) {
				LOG.error("Error sending update to " + user.userName, e);
			}
		});
	}
	
	public void handleGameAction(GameAction action) {
		LOG.info("Handling action " + action.action);
		gameBoards.get(action.whichBoard).getPiece(action.x, action.y).action = action;
	}
	
	public GameBoard getBoard(String boardName) { return gameBoards.get(boardName); }
	
	public GameBoard getBoard(String boardName, int topLeftX, int topLeftY, int height, int width) { 
		
		GameBoard gb = new GameBoard(boardName,height, width);
		gb.pieces = new ArrayList<>();
		
		for (int x=topLeftX; x<=(topLeftX+width)-1; x++) {
			for (int y=topLeftY; y<=(topLeftY + height)-1; y++) {
				gb.pieces.add(gameBoards.get(boardName).getPiece(x, y));
			}
		}
		
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
