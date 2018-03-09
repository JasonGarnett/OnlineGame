package com.garnett.model;

import java.awt.Color;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.garnett.utilities.GameProperties;

@JsonIgnoreProperties(value = { "wsSession" })
public class GameUser {

	public String userName;
	public String color;
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
	public List<Piece> ownedPieces;
	public WebSocketSession wsSession;
	private GameProperties props = GameProperties.getInstance();
	private Random rand = new Random();
	
	public GameUser() { }
	
	public GameUser(String userName, int height, int width, String board, int topLeftX, int topLeftY) {
		this.userName = userName;
		this.wsLocation = props.getProperty("ws");
		this.height = height;
		this.width = width;
		this.gold = 100;
		this.wood = 100;
		this.stone = 100;
		this.color = "#" + Integer.toHexString((new Color(rand.nextFloat(), rand.nextFloat(), rand.nextFloat()).getRGB())).substring(2);
		this.ownedPieces = new ArrayList<>();
		this.topLeftX = topLeftX;
		this.topLeftY = topLeftY;
		this.whichBoard = board;
	}
}
