package com.garnett.model;

import java.util.Random;

import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.garnett.utilities.GameProperties;

@JsonIgnoreProperties(value = { "wsSession" })
public class GameUser {

	public String userName;
	public String wsLocation;
	public String whichBoard;
	public int topLeftX;
	public int topLeftY;
	public int height;
	public int width;
	public WebSocketSession wsSession;
	private GameProperties props = GameProperties.getInstance();
	
	public GameUser() { }
	
	public GameUser(String userName) {
		this.userName = userName;
		this.wsLocation = props.getProperty("ws");
		this.whichBoard = findFreeBoard();
		setLocation();
	}

	private String findFreeBoard() {
		// TODO: Find board with fewest active users
		return "whatever";
	}
	
	private void setLocation() {
		// TODO: Find a free location to start with that is not too crowded
		Random rand = new Random();
		this.topLeftX = rand.nextInt(Integer.parseInt(props.getProperty("boardSize.width")));
		this.topLeftY = rand.nextInt(Integer.parseInt(props.getProperty("boardSize.height")));
	}
	
}
