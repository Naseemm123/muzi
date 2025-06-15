"use client";

import { io, Socket } from "socket.io-client";
import { Button } from "@workspace/ui/components/button";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function Space() {
  const params = useParams();
  const spaceId = params.spaceId as string;
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");

  console.log(`space ID: ${spaceId}`);

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.emit("join", { spaceId });

    socket.on("connect", () => {
      console.log(`Connected to socket server with ID: ${socket.id}`);
      socketRef.current = socket;
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("chat-message", (message: string) => {
      console.log(`received: ${message}`);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("connect_error", (error: any) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [spaceId]);

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (message) {
      if (room) {
        socketRef.current?.emit("join", { message, room });
        return;
      }
      socketRef.current?.emit("chat-message", message);

      setMessages((prevMessages) => [...prevMessages, message]);
    }
    if (!message) {
      alert("Please enter a message");
      return;
    }
    setMessage("");
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center">
        This is the space page for {spaceId}
      </h1>
      <br />
      <hr />
      <br />
      <form>
        <input
          type="text"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          type="text"
          name="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <Button onClick={handleSend}>send</Button>
      </form>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold">Messages</h2>
        {/* render the messages in white color  */}
        <ul className="list-disc">
          {messages.map((message, index) => (
            <li key={index} className="text-white">
              {message}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
