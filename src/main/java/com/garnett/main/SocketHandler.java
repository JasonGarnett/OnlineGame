package com.garnett.main;


import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.garnett.main.dao.GameBoardManager;
import com.garnett.utilities.GameProperties;



@Component
public class SocketHandler extends TextWebSocketHandler {

	final static Logger LOG = Logger.getLogger(SocketHandler.class);
	private GameProperties props = GameProperties.getInstance();
    private Map<String,WebSocketSession> sessions;
    
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

    public void sendToSession(String sessionId, String messageToSend) {
    	WebSocketSession session = sessions.get(sessionId);
    	if (session != null && session.isOpen()) {
    		try {
    			LOG.info("Sending message to " + sessionId);
				session.sendMessage(new TextMessage(messageToSend));
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
        } else {
            LOG.info(session.getId() + " sent :" + message.getPayload());
            session.sendMessage(new TextMessage("hello to you too"));
        }
    }
    
    private void timeoutSession(String sessionId) throws IOException {
    	LOG.info("Session " + sessionId + " is closed, removing from sessions list.");
    	if (sessions.get(sessionId) != null) {
    		WebSocketSession session = sessions.get(sessionId);
    		if (session.isOpen())
        		session.close();
    		 sessions.remove(session.getId());
    	}
    }
}