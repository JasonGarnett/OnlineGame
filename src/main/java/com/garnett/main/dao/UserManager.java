package com.garnett.main.dao;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;

import com.garnett.main.Controller;
import com.garnett.model.GameUser;

public class UserManager {

	private static UserManager instance = new UserManager();
	private Map<String, GameUser> loggedInUsers;
	final static Logger LOG = Logger.getLogger(Controller.class);
	
	private UserManager() {
		loggedInUsers = new ConcurrentHashMap<>();
	}
	
	public static UserManager getInstance() { return instance; }
	
	public GameUser getUser(String username) {
		if (loggedInUsers.containsKey(username)) {
			LOG.info(username + " is already registered, returning previous session.");
			return loggedInUsers.get(username);
		} else {
			LOG.info(username + " is new, creating new session for them.");
			GameUser user = new GameUser(username);
			loggedInUsers.put(username, user);
			
			return user;
		}
	}

}
