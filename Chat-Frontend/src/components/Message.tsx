"use client"

import { useState, useEffect, useRef } from "react"
import ChatMessage from "./ChatMessage"
import styles from "./page.module.css"


interface Message {
  sender: string
  message: string
}

export default function Messages() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [sender,setSender] = useState("nitish")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newSocket = new WebSocket("wss://tasky-chatapp.onrender.com")

    newSocket.onopen = () => {
      console.log("Connected to WebSocket")
      setSocket(newSocket)
    }

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "history") {
        setMessages(data.data)
        
      } else {
        setMessages((prevMessages) => [...prevMessages, data]);
        setSender(data.sender);
      }
    }

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSending = () => {
    if (inputMessage.trim() && socket) {
      const newMessage = { sender: sender, message: inputMessage.trim() }
      socket.send(JSON.stringify(newMessage))
      setInputMessage("")
    }
  }

  if (!socket) {
    return <div className={styles.loading}>Connecting to chat server...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.messageArea}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} sender={msg.sender} message={msg.message} isSelf={msg.sender === sender} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSending()}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button onClick={handleSending} className={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  )
}

