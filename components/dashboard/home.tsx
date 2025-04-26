"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon, BrainCircuitIcon, MessageSquareIcon, UserIcon } from "lucide-react";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion";

interface MatchCardProps {
  name: string;
  image?: string;
  matchScore: number;
  canTeach: string[];
  canLearn: string[];
  onClick: () => void;
  isLoading?: boolean;
}

export function DashboardHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [matchSuggestions, setMatchSuggestions] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Fetch matches from your API
        const matchesRes = await fetch("/api/matching", { credentials: "include" });
        const matches = await matchesRes.json();

        // Fetch messages from your API
        const messagesRes = await fetch("/api/messages", { credentials: "include" });
        const messages = await messagesRes.json();

        setMatchSuggestions(matches);
        setActiveChats(messages);
      } catch (error) {
        // Handle error (optional: show toast or error message)
        setMatchSuggestions([]);
        setActiveChats([]);
      }
      setIsLoading(false);
    }

    fetchDashboardData();
  }, [session]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Tabs defaultValue="matches" className="mt-4 sm:mt-0 w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:w-[300px]">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!session?.user?.profileCompleted && <ProfileCompletionCard />}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Match Suggestions</CardTitle>
                <CardDescription>
                  People with complementary skills to yours
                </CardDescription>
              </div>
              {!isLoading && (
                <Button variant="ghost" size="sm">
                  View All <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <MatchCardSkeleton />
                  <MatchCardSkeleton />
                  <MatchCardSkeleton />
                </>
              ) : matchSuggestions.length > 0 ? (
                matchSuggestions.map((match) => (
                  <MatchCard
                    key={match.id}
                    name={match.name}
                    image={match.image}
                    matchScore={match.matchScore}
                    canTeach={match.canTeach}
                    canLearn={match.canLearn}
                    onClick={() => router.push(`/dashboard/matches/${match.id}`)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BrainCircuitIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No matches yet</h3>
                  <p className="text-muted-foreground">
                    Complete your profile to get matched with other users
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Your ongoing conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <ChatSkeleton />
                  <ChatSkeleton />
                </>
              ) : activeChats.length > 0 ? (
                activeChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/messages/${chat.id}`)}
                  >
                    <Avatar>
                      <AvatarImage src={chat.image} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{chat.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {chat.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread > 0 && (
                      <Badge className="ml-auto bg-blue-600">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquareIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No messages yet</h3>
                  <p className="text-muted-foreground">
                    Start a conversation with your matches
                  </p>
                </div>
              )}
            </div>
            {!isLoading && activeChats.length > 0 && (
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => router.push("/dashboard/messages")}
              >
                View All Messages
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MatchCard({
  name,
  image,
  matchScore,
  canTeach,
  canLearn,
  onClick,
  isLoading,
}: MatchCardProps) {
  if (isLoading) {
    return <MatchCardSkeleton />;
  }

  return (
    <div
      className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-accent/50 cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-14 w-14">
        <AvatarImage src={image} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{name}</h3>
          <div className="flex items-center">
            <Badge variant="outline" className="ml-auto">
              {matchScore}% match
            </Badge>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="text-muted-foreground">Can teach:</span>
            {canTeach.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="text-muted-foreground">Wants to learn:</span>
            {canLearn.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/6" />
        </div>
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}