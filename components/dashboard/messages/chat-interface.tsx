"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, SendIcon, MoreHorizontalIcon, PhoneCallIcon, VideoIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

interface ChatInterfaceProps {
  conversationId: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contact, setContact] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch messages and contact info from backend
  useEffect(() => {
    setIsLoading(true);
    // Fetch messages for this conversation
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/${conversationId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // data should include messages and contact info
        setMessages(
          data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
        setContact(data.contact);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [conversationId]);

  // Socket.IO for real-time updates
  useEffect(() => {
    if (!conversationId) return;
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.emit("joinMatch", conversationId);

    socket.on("newMessage", (msg: any) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, timestamp: new Date(msg.timestamp) },
      ]);
    });

    return () => {
      socket.emit("leaveMatch", conversationId);
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Send message to backend
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/${conversationId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newMessage }),
      }
    );
    if (res.ok) {
      setNewMessage("");
      // The new message will be added via Socket.IO "newMessage" event
    }
  };
  
  const goBack = () => {
    router.push("/dashboard/messages");
  };
  
  const formatMessageDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    const dateKey = formatMessageDate(message.timestamp);
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(message);
  });
  
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] -mt-6 -mx-6 md:-mx-8">
      {/* Chat header */}
      <header className="border-b p-4 flex items-center sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={goBack} className="md:hidden">
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        
        {isLoading ? (
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Avatar>
                <AvatarImage src={contact?.image} />
                <AvatarFallback>{contact?.name[0]}</AvatarFallback>
              </Avatar>
              {contact?.status === "online" && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            
            <div>
              <h2 className="font-medium">{contact?.name}</h2>
              <p className="text-xs text-muted-foreground">
                {contact?.status === "online" 
                  ? "Online" 
                  : `Last active ${formatDistanceToNow(contact?.lastActive, { addSuffix: true })}`
                }
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <PhoneCallIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <VideoIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <MessageSkeleton isSender={false} />
            <MessageSkeleton isSender={true} />
            <MessageSkeleton isSender={false} />
          </div>
        ) : (
          // Display messages grouped by date
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                  {date}
                </Badge>
              </div>
              
              {dateMessages.map((message) => {
                const isSender = message.sender === session?.user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[60%] rounded-lg px-4 py-2 ${
                        isSender
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex justify-end ${
                          isSender ? "text-blue-200" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isLoading}>
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageSkeleton({ isSender }: { isSender: boolean }) {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
      <div className="space-y-2">
        <Skeleton className={`h-20 w-48 rounded-lg ${isSender ? "rounded-br-none" : "rounded-bl-none"}`} />
        <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
  withCredentials: true,
});

useEffect(() => {
  socket.emit("joinMatch", matchId);

  socket.on("newMessage", (message) => {
    // handle incoming message
  });

  return () => {
    socket.emit("leaveMatch", matchId);
    socket.off("newMessage");
  };
}, [matchId]);