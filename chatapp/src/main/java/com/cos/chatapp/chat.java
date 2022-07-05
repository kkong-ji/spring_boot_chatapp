package com.cos.chatapp;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "chat")
public class chat {
	@Id
	private String id;
	private String msg;
	private String sender;		// 보내는 사람
	private String receiver;	// 받는 사람
	
	private LocalDateTime createdAt;
}
