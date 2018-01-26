package com.garnett.main.dao;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;
import org.springframework.web.socket.WebSocketSession;

import com.garnett.main.Controller;
import com.garnett.model.GameUser;

public class UserManager {

	private static UserManager instance = new UserManager();
	private Map<String, GameUser> loggedInUsers;
	final static Logger LOG = Logger.getLogger(UserManager.class);
	
	private UserManager() {
		loggedInUsers = new ConcurrentHashMap<>();
	}
	
	public static UserManager getInstance() { return instance; }
	
	public GameUser getUser(String username, int height, int width) {
		if (loggedInUsers.containsKey(username)) {
		//	LOG.info(username + " is already registered, returning previous session.");
			return loggedInUsers.get(username);
		} else {
			LOG.info(username + " is new, creating new session for them.");
			GameUser user = new GameUser(username, height, width);
			loggedInUsers.put(username, user);
			
			return user;
		}
	}
	
	public Collection<GameUser> getUsers() {
		return loggedInUsers.values();
	}
	
	public Collection<GameUser> getActiveUsers() {
		return loggedInUsers.values().stream().filter(u -> u.isActive).collect(Collectors.toList());
	}
	
	public void markUserInactive(String wsSessionId) {
		loggedInUsers.values().forEach(user -> {
			if (user.wsSession.getId().equals(wsSessionId)) {
				user.wsSession = null;
				user.isActive = false;
			}
		});
	}
	
	public void marryUpSessionAndUser(WebSocketSession session, GameUser userInfo) {
		loggedInUsers.get(userInfo.userName).wsSession = session;
		loggedInUsers.get(userInfo.userName).height = userInfo.height;
		loggedInUsers.get(userInfo.userName).width = userInfo.width;
		loggedInUsers.get(userInfo.userName).isActive = true;
	}

}
