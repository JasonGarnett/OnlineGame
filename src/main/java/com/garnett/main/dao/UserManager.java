package com.garnett.main.dao;

import java.util.HashMap;
import java.util.Map;

import com.garnett.model.GameUser;

public class UserManager {

	private static UserManager instance = new UserManager();
	private Map<String, GameUser> loggedInUsers;
	
	private UserManager() {
		loggedInUsers = new HashMap<>();
	}
	
	public static UserManager getInstance() { return instance; }
	

}
