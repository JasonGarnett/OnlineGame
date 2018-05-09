package com.garnett.main;


import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.garnett.main.dao.GameBoardManager;
import com.garnett.main.dao.UserManager;
import com.garnett.model.GameUser;
import com.garnett.model.userActions.ActionResponse;
import com.garnett.model.userActions.GameAction;
import com.garnett.utilities.GameProperties;



@Component
public class SocketHandler extends TextWebSocketHandler {

	final static Logger LOG = Logger.getLogger(SocketHandler.class);
	private GameProperties props = GameProperties.getInstance();
    private Map<String,WebSocketSession> sessions;
    private UserManager userMgr = UserManager.getInstance();
    private GameBoardManager boardMgr = GameBoardManager.getInstance();
    private ObjectMapper mapper = new ObjectMapper();
    
    public SocketHandler() {
    	sessions = new ConcurrentHashMap<>();
    	GameBoardManager.getInstance().setSocketHandler(this);
    }
    

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        LOG.info("New Connection established " + session.getId());
        this.sessions.put(session.getId(), session);
        LOG.info(sessions.size() + " current sessions.");
    }
    
    public void sendToSession(String sessionId, Object messageToSend) {
    	try {
    		sendToSession(sessionId, mapper.writeValueAsString(messageToSend));
    	} catch (Exception e) {
    		LOG.error("Error sending to session " + sessionId, e);
    	}
    }

    public void sendToSession(String sessionId, String messageToSend) {
    	WebSocketSession session = sessions.get(sessionId);
    	if (session != null && session.isOpen()) {
    		try {
    			LOG.info(messageToSend);
    			TextMessage msg = new TextMessage(messageToSend);
				session.sendMessage(msg);
			} catch (IOException e) {
				LOG.error("Error sending message to " + sessionId, e);
			}
    	} else {
    		try {
    			LOG.warn("No session to send to");
				timeoutSession(sessionId);
			} catch (IOException e) {
				LOG.error("Error closing session", e); 
			}
    	}
    }
    
    public void sendToAllSession(String messageToSend) {
    	sessions.keySet().forEach(sessionId -> sendToSession(sessionId, messageToSend));
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message)
            throws Exception {
        if ("CLOSE".equalsIgnoreCase(message.getPayload())) {
        	timeoutSession(session.getId());
        } else if (message.getPayload().contains("wsLocation")){
            LOG.info(session.getId() + " sent :" + message.getPayload());
            GameUser user = mapper.readValue(message.getPayload(), GameUser.class);
            LOG.info("Marrying up User: " + user.userName + " with WS Session: " + session.getId());
            userMgr.marryUpSessionAndUser(session, user);
        } else {
        	LOG.info(session.getId() + ": Game Action: " + message.getPayload());
        	GameAction action = mapper.readValue(message.getPayload(), GameAction.class);
        	ActionResponse resp = boardMgr.handleGameAction(action);
        	
        	sendToSession(session.getId(), resp);
        }
    }
    
    private void timeoutSession(String sessionId) throws IOException {
    	LOG.info("Session " + sessionId + " is closed, removing from sessions list.");
    	if (sessions.get(sessionId) != null) {
    		WebSocketSession session = sessions.get(sessionId);
    		if (session.isOpen())
        		session.close();
    		 sessions.remove(session.getId());
    		 userMgr.markUserInactive(session.getId());
    	}
    }
}