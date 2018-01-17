package com.garnett.utilities;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;

import org.apache.log4j.Logger;


public class GameProperties extends Properties {

	private static final long serialVersionUID = 9182527870057778874L;
	private static GameProperties instance = new GameProperties();
	final static Logger LOG = Logger.getLogger(GameProperties.class);
	
	private GameProperties() {
		try {
			this.load(new FileReader("cfg/game.properties"));
		} catch (FileNotFoundException e) {
			LOG.error("Could not find file", e);
		} catch (IOException e) {
			LOG.error("Could not find file", e);
		}
	}
	
	public static GameProperties getInstance() { return instance; }
	
}
