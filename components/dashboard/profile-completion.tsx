"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ProfileCompletionCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Compute completion steps based on fetched profile
  const profileCompletionSteps = [
    { name: "Add your basic information", completed: !!profile?.name && !!profile?.bio },
    { name: "Add skills you can teach", completed: Array.isArray(profile?.teachSkills) && profile.teachSkills.length > 0 },
    { name: "Add skills you want to learn", completed: Array.isArray(profile?.learnSkills) && profile.learnSkills.length > 0 },
    { name: "Set your availability", completed: Array.isArray(profile?.availability) && profile.availability.length > 0 },
  ];

  const completedSteps = profileCompletionSteps.filter(step => step.completed).length;
  const totalSteps = profileCompletionSteps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center">
          <UserIcon className="mr-2 h-5 w-5" />
          Complete Your Profile
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-400">
          {isLoading
            ? "Loading..."
            : `${completedSteps} of ${totalSteps} steps completed`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <Progress value={completionPercentage} className="h-2 mb-4" />
        <div className="space-y-3">
          {profileCompletionSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`h-4 w-4 rounded-full mr-2 flex-shrink-0 ${step.completed ? "bg-blue-600" : "border border-blue-300 dark:border-blue-700"}`} />
              <span className={`text-sm ${step.completed ? "text-blue-800 dark:text-blue-300" : "text-blue-600 dark:text-blue-400"}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
        <Button 
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push("/dashboard/profile")}
        >
          Complete Your Profile
        </Button>
      </CardContent>
    </Card>
  );
}