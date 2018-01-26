package com.garnett.main;

import org.apache.log4j.Logger;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.garnett.main.dao.GameBoardManager;
import com.garnett.main.dao.UserManager;
import com.garnett.model.GameBoard;
import com.garnett.model.GameUser;
import com.garnett.utilities.GameProperties;

@RestController
public class Controller {

	
	final static Logger LOG = Logger.getLogger(Controller.class);
	private GameProperties props = GameProperties.getInstance();
	private static GameBoardManager mgr = GameBoardManager.getInstance();
	private static UserManager userMgr = UserManager.getInstance();
	
	@RequestMapping(value="/gameboard/{whichBoard}", method=RequestMethod.GET)
	public GameBoard gameboard(@PathVariable("whichBoard") String whichBoard, @RequestParam int topLeftX, @RequestParam int topLeftY, @RequestParam int height, @RequestParam int width, @AuthenticationPrincipal final UserDetails user) {
		
		LOG.info("Request for " + whichBoard + " GameBoard from " + user.getUsername() + " TOP: " + topLeftX + "," + topLeftY + " SIZE: " + height + "," + width);
		
		GameBoard board = mgr.getBoard(whichBoard, topLeftX, topLeftY, height, width, user.getUsername());
		if (board != null)
			return board;
		else
			return new GameBoard("ERROR", 0,0);
		
	}
	
	@RequestMapping(value="/register", method=RequestMethod.GET)
	public GameUser register(@AuthenticationPrincipal final UserDetails user, @RequestParam int height, @RequestParam int width) {
		
		LOG.info("Registering user: " + user.getUsername() + " Board Size: " + height + "x" + width);
		
		return userMgr.getUser(user.getUsername(), height, width);
	}
}
