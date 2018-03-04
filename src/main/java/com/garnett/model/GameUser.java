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
	public int gold;
	public int wood;
	public int stone;
	public int land;
	public boolean isActive = false;
	public WebSocketSession wsSession;
	private GameProperties props = GameProperties.getInstance();
	
	public GameUser() { }
	
	public GameUser(String userName, int height, int width) {
		this.userName = userName;
		this.wsLocation = props.getProperty("ws");
		this.whichBoard = findFreeBoard();
		this.height = height;
		this.width = width;
		this.gold = 100;
		this.wood = 100;
		this.stone = 100;
		
		setLocation();
	}

	private String findFreeBoard() {
		// TODO: Find board with fewest active users
		return "whatever";
	}
	
	private void setLocation() {
		// TODO: Find a free location to start with that is not too crowded
		Random rand = new Random();
		System.out.println("Generating Rand Width between 0 and " + (Integer.parseInt(props.getProperty("boardSize.width"))-width));
		System.out.println("Generating Rand Width between 0 and " + (Integer.parseInt(props.getProperty("boardSize.height"))-height));
		
		int randHeight = rand.nextInt(Integer.parseInt(props.getProperty("boardSize.height"))-height);
		int randWidth = rand.nextInt(Integer.parseInt(props.getProperty("boardSize.width"))-width);
		
		this.topLeftX = randHeight;
		this.topLeftY = randWidth;
	}
	
}
