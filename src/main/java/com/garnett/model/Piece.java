package com.garnett.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.garnett.model.userActions.Conquer;
import com.garnett.model.userActions.GameAction;

public class Piece {

	public int item;
	public List<GameAction> actions;
	public int x;
	public int y;
	
	public Piece(){}
	
	public Piece(int item, int x, int y) {
		this.item = item;
		this.x = x;
		this.y = y;
		this.actions = Collections.synchronizedList(new ArrayList<>());
	}
	
	public void setOwner(String user, String color) {
		GameAction act = new GameAction();
		act.detail = new Conquer();
		((Conquer)act.detail).percentConquered = 100;
		act.userColor = color;
		act.userName = user;
		act.x = x;
		act.y = y;
		
		actions.add(act);
	}
	
	public void setOwner(String owner) {
		
	}
	
	public String getOwner() {

		for (GameAction act: actions) {
			if (act.detail instanceof Conquer)
				return act.userName;
		}
		
		return null;
	}
}
