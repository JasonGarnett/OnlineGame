package com.garnett.main;


import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.garnett.utilities.GameProperties;

@Component
public class SocketHandler extends TextWebSocketHandler {

	final static Logger LOG = Logger.getLogger(Controller.class);
	private GameProperties props = GameProperties.getInstance();
    WebSocketSession session;

    // This will send only to one client(most recently connected)
    public void counterIncrementedCallback(int counter) {
        LOG.info("Trying to send:" + counter);
        if (session != null && session.isOpen()) {
            try {
                LOG.info("Now sending:" + counter);
                session.sendMessage(new TextMessage("{\"value\": \"" + counter + "\"}"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Don't have open session to send:" + counter);
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        LOG.info("Connection established " + session.getId());
        this.session = session;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message)
            throws Exception {
        if ("CLOSE".equalsIgnoreCase(message.getPayload())) {
            session.close();
        } else {
            LOG.info(session.getId() + " sent :" + message.getPayload());
            session.sendMessage(new TextMessage("hello to you too"));
        }
    }
}