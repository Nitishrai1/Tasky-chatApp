import type React from "react"
import styles from "./chatmessage.module.css"

interface ChatMessageProps {
  sender: string
  message: string
  isSelf: boolean
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, message, isSelf }) => {
  const senderName = sender && typeof sender === "string" && sender.trim() !== "" ? sender : "Anonymous"
  const avatarInitial = senderName[0]?.toUpperCase() || "A"

  return (
    <div className={`${styles.messageContainer} ${isSelf ? styles.self : ""}`}>
      <div className={styles.avatar}>{avatarInitial}</div>
      <div className={styles.message}>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default ChatMessage

