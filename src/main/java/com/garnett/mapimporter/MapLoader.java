package com.garnett.mapimporter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.apache.log4j.Logger;

import com.garnett.main.Controller;
import com.garnett.model.GameBoard;
import com.garnett.utilities.GameProperties;

public class MapLoader {

	final static Logger LOG = Logger.getLogger(Controller.class);
	private GameProperties props = GameProperties.getInstance();
	
	public MapLoader() { }
	
	public GameBoard getGameBoard(String boardName, String mapLocation) {
		
		try {
			String mapString = readFile(mapLocation);
			
			String[] rows = mapString.split("\n");
			String[] cols = rows[0].split(",");
			String[][] lines = new String[cols.length][rows.length];
			LOG.info("Map file loading, dimensions are: " + cols.length + " columns, " + rows.length + " rows.");
			
			int x = 0;
			int y = 0;
			for (String line: rows) {
				x = 0;
				for (String piece: line.split(",")) {
					lines[x][y] = piece.trim();
					x++;
				}
				y++;
			}
			
			return new GameBoard(boardName, lines);
		} catch (Exception e) {
			LOG.error("Error loading file " +mapLocation + " please try a different file.", e);
		}
		return null;
	}
	
	private String readFile(String mapLocation) throws IOException {
		 return new String(Files.readAllBytes(Paths.get(mapLocation)));
	}
	
}
