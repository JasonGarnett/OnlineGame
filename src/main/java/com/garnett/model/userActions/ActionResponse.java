package com.garnett.model.userActions;

import com.garnett.model.ClientMessage;

public class ActionResponse extends ClientMessage {
	
	public boolean success;
	public String reason;
	
	public ActionResponse() {
		this.messageType = "RESPONSE";
	}
	
	public ActionResponse(boolean s, String r) {
		this();
		this.success = s;
		this.reason = r;
	}
	
	public ActionResponse(boolean s) {
		this(s, null);
	}


}
