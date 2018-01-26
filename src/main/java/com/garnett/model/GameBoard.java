package com.garnett.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

public class GameBoard {

	public String name;
	public int height;
	public int width;
	public List<Piece> pieces = Collections.synchronizedList(new ArrayList<>());
	public Date update;
	public GameUser user;
	
	public GameBoard(String name, int height, int width){
		this.name = name;
		this.height = height;
		this.width = width;
	}
	
	public Piece getPiece(int x, int y) {
		for (Piece piece: pieces) {
			if (piece.x == x && piece.y == y)
				return piece;
		}
		
		return null;
	}
	
}
