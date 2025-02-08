"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SetUsernameProps {
  onSetUsername: (username: string) => void
}

const SetUsername: React.FC<SetUsernameProps> = ({ onSetUsername }) => {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSetUsername(username.trim())
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Enter your name</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Join Chat
          </Button>
        </form>
      </div>
    </div>
  )
}

export default SetUsername

