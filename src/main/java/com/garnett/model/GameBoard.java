package com.garnett.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.garnett.utilities.GameProperties;

public class GameBoard extends ClientMessage{

	public String name;
	public int height;
	public int width;
	public int mapHeight;
	public int mapWidth;
	public List<Piece> pieces = new ArrayList<>();
	public Date update;
	public GameUser user;
	public int topLeftX;
	public int topLeftY;
	public String[] baseTiles;
	public Map<String,String> improvements;
	private GameProperties props = GameProperties.getInstance();
	
	public GameBoard(String name) {
		this.messageType = "GAMEBOARD";
		this.name = name;
		this.baseTiles = new String[Integer.parseInt(props.getProperty("board.numBaseTiles"))];
		this.improvements = new HashMap<>();
		
		for (int i=0; i<= baseTiles.length-1; i++) {
			baseTiles[i] = props.getProperty("board.baseTile." + i);
		}
		
		String[] impTypes = {"castle", "mill", "mine", "farm"};
		
		for (String impType: impTypes) {
			for (int i = 1; i<=3; i++) {
				improvements.put(impType + "." + i, props.getProperty("improvement." + impType + "." + i + ".img"));
			}
		}
	}
	
	public GameBoard(String name, int height, int width){

		this(name);
		this.height = height;
		this.width = width;
		this.mapHeight = height;
		this.mapWidth = width;
	}
	
	public GameBoard(String name, String[][] tiles) {
		this(name, tiles[0].length, tiles.length);
				
		for (int x=0; x<=tiles.length-1; x++) {
			for (int y=0; y<=tiles[x].length-1; y++) {
				this.pieces.add(new Piece(Integer.parseInt(tiles[x][y]), x, y));
			}
		}
		
	}
	
	public Piece getPiece(int x, int y) {
		for (Piece piece: pieces) {
			if (piece.x == x && piece.y == y)
				return piece;
		}
		
		return null;
	}
	
	public GameBoard getSubBoard(int topLeftX, int topLeftY, int height, int width, GameUser user) {
		
		GameBoard gb = new GameBoard(this.name, height, width);
		
		gb.pieces = new ArrayList<>();
		
		for (int x=topLeftX; x<=(topLeftX+width)-1; x++) {
			for (int y=topLeftY; y<=(topLeftY + height)-1; y++) {
				gb.pieces.add(this.getPiece(x, y));
			}
		}
		
		gb.update = new Date();
		gb.user = user;
		gb.topLeftX = topLeftX;
		gb.topLeftY = topLeftY;
		gb.mapHeight = this.mapHeight;
		gb.mapWidth = this.mapWidth;
		return gb;
	}
	
	public boolean isFree(int x, int y) {
		Piece p = getPiece(x, y);
		
		// Possibly only return true if is not owned and maybe not a mountain or something?
		return p.getOwner() == null;
	}
}
