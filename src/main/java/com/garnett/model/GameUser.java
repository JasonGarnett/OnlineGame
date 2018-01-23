package com.garnett.model;

import org.springframework.web.socket.WebSocketSession;

public class GameUser {

	public String userName;
	public String whichBoard;
	int topLeftX;
	int topLeftY;
	int height;
	int width;
	public WebSocketSession wsSession;
	
}
