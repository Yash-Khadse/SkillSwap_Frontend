"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";

export function MessageList() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/messages`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Map backend data to UI format
        // Assuming data is an array of conversations with fields: _id, contact, lastMessage, unreadCount, updatedAt
        setConversations(
          data.map((conv: any) => ({
            id: conv._id || conv.match, // use _id or matchId as unique id
            name: conv.contact?.name || "Unknown",
            image: conv.contact?.image,
            lastMessage: conv.lastMessage?.content || "",
            timestamp: conv.lastMessage
              ? new Date(conv.lastMessage.timestamp).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })
              : "",
            status: conv.contact?.status || "offline",
            unread: conv.unreadCount || 0,
          }))
        );
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);
  
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card className="p-0 border-0 shadow-none">
            <div className="divide-y">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <ConversationSkeleton key={i} />)
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-4 p-4 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/messages/${conversation.id}`)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.image} />
                        <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                      </Avatar>
                      {conversation.status === "online" && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    
                    {conversation.unread > 0 && (
                      <Badge className="ml-auto bg-blue-600">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          <Card className="p-0 border-0 shadow-none">
            <div className="divide-y">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => <ConversationSkeleton key={i} />)
              ) : filteredConversations.filter(c => c.unread > 0).length > 0 ? (
                filteredConversations
                  .filter(c => c.unread > 0)
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-4 p-4 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/messages/${conversation.id}`)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conversation.image} />
                          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.status === "online" && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{conversation.name}</h3>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      
                      <Badge className="ml-auto bg-blue-600">
                        {conversation.unread}
                      </Badge>
                    </div>
                  ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No unread messages</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived" className="mt-4">
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No archived conversations</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/5" />
        </div>
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}