"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, XIcon, MessagesSquareIcon } from "lucide-react";

export function MatchesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/matching`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Separate pending and accepted matches
        setPendingMatches(data.filter((m: any) => m.status === "pending"));
        setAcceptedMatches(data.filter((m: any) => m.status === "accepted"));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleAcceptMatch = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/matching/${id}/accept`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (res.ok) {
      const match = pendingMatches.find((m) => m._id === id);
      setPendingMatches(pendingMatches.filter((m) => m._id !== id));
      setAcceptedMatches([...acceptedMatches, { ...match, status: "accepted" }]);
      toast({
        title: "Match accepted",
        description: `You've connected with ${match?.user2?.name || "this user"}`,
      });
    }
  };

  const handleRejectMatch = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/matching/${id}/reject`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (res.ok) {
      const match = pendingMatches.find((m) => m._id === id);
      setPendingMatches(pendingMatches.filter((m) => m._id !== id));
      toast({
        title: "Match declined",
        description: `You declined to connect with ${match?.user2?.name || "this user"}`,
      });
    }
  };

  const startChat = (id: string) => {
    router.push(`/dashboard/messages/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
        <p className="text-muted-foreground">
          Connect with people who have complementary skills
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pending">Pending Matches</TabsTrigger>
          <TabsTrigger value="accepted">Accepted Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <MatchCardSkeleton />
                <MatchCardSkeleton />
                <MatchCardSkeleton />
              </>
            ) : pendingMatches.length > 0 ? (
              pendingMatches.map((match) => {
                // Determine the other user (assuming user1 is current user)
                const otherUser = match.user1 && match.user2
                  ? (match.user1IsCurrentUser ? match.user2 : match.user1)
                  : match.user2 || match.user1;
                return (
                  <Card key={match._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser?.image} />
                            <AvatarFallback>{otherUser?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{otherUser?.name}</CardTitle>
                            <CardDescription>
                              <Badge variant="outline">{match.matchScore || "--"}% match</Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Can teach you:</h4>
                          <div className="flex flex-wrap gap-1">
                            {(otherUser?.teachSkills || []).map((skill: string) => (
                              <Badge key={skill} variant="default" className="bg-blue-600">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Wants to learn:</h4>
                          <div className="flex flex-wrap gap-1">
                            {(otherUser?.learnSkills || []).map((skill: string) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <Button
                            className="flex-1"
                            variant="outline"
                            onClick={() => handleRejectMatch(match._id)}
                          >
                            <XIcon className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleAcceptMatch(match._id)}
                          >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No pending matches</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="accepted">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <MatchCardSkeleton />
                <MatchCardSkeleton />
              </>
            ) : acceptedMatches.length > 0 ? (
              acceptedMatches.map((match) => {
                const otherUser = match.user1 && match.user2
                  ? (match.user1IsCurrentUser ? match.user2 : match.user1)
                  : match.user2 || match.user1;
                return (
                  <Card key={match._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser?.image} />
                            <AvatarFallback>{otherUser?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{otherUser?.name}</CardTitle>
                            <CardDescription>
                              Last active: {otherUser?.lastActive || "--"}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{match.matchScore || "--"}% match</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Can teach you:</h4>
                          <div className="flex flex-wrap gap-1">
                            {(otherUser?.teachSkills || []).map((skill: string) => (
                              <Badge key={skill} variant="default" className="bg-blue-600">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Wants to learn:</h4>
                          <div className="flex flex-wrap gap-1">
                            {(otherUser?.learnSkills || []).map((skill: string) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          className="w-full mt-2"
                          onClick={() => startChat(match._id)}
                        >
                          <MessagesSquareIcon className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No accepted matches yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatchCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 flex-1 rounded" />
            <Skeleton className="h-10 flex-1 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}