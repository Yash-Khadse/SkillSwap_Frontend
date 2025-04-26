"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusIcon, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().max(500, {
    message: "Bio cannot be longer than 500 characters.",
  }),
  teachSkills: z.array(z.string()).max(5, {
    message: "You can only add up to 5 skills.",
  }),
  learnSkills: z.array(z.string()).max(5, {
    message: "You can only add up to 5 skills.",
  }),
  availability: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // In a real app, these would come from the database
  const skillSuggestions = [
    "JavaScript", "Python", "React", "Node.js", "Machine Learning",
    "UI Design", "UX Research", "Data Science", "SQL", "DevOps",
    "Flutter", "Swift", "Kotlin", "TypeScript", "GraphQL",
    "AWS", "Docker", "Firebase", "MongoDB", "PostgreSQL"
  ];

  const [defaultValues, setDefaultValues] = useState<ProfileFormValues>({
    name: session?.user?.name || "",
    bio: "",
    teachSkills: [],
    learnSkills: [],
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
    ],
  });

  useEffect(() => {
    if (!session) return; // Don't fetch if not logged in
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setDefaultValues({
          name: data.name || "",
          bio: data.bio || "",
          teachSkills: Array.isArray(data.teachSkills) ? data.teachSkills : [],
          learnSkills: Array.isArray(data.learnSkills) ? data.learnSkills : [],
          availability: Array.isArray(data.availability) && data.availability.length > 0
            ? data.availability
            : [{ day: "Monday", startTime: "09:00", endTime: "17:00" }],
        });
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [session?.user?.name, session]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    values: defaultValues, // react-hook-form v7+ supports this for dynamic defaults
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);

    try {
      console.log("Submitting profile data:", data); // Add this line
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText); // Add this line
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      await update({
        ...session,
        user: {
          ...session?.user,
          profileCompleted: true,
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function addTeachSkill() {
    if (!newTeachSkill.trim()) return;
    
    const currentSkills = form.getValues("teachSkills");
    if (currentSkills.includes(newTeachSkill)) {
      toast({
        title: "Skill already added",
        description: "This skill is already in your list.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentSkills.length >= 5) {
      toast({
        title: "Maximum skills reached",
        description: "You can only add up to 5 skills.",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("teachSkills", [...currentSkills, newTeachSkill]);
    setNewTeachSkill("");
  }

  function removeTeachSkill(skill: string) {
    const currentSkills = form.getValues("teachSkills");
    form.setValue(
      "teachSkills",
      currentSkills.filter((s) => s !== skill)
    );
  }

  function addLearnSkill() {
    if (!newLearnSkill.trim()) return;
    
    const currentSkills = form.getValues("learnSkills");
    if (currentSkills.includes(newLearnSkill)) {
      toast({
        title: "Skill already added",
        description: "This skill is already in your list.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentSkills.length >= 5) {
      toast({
        title: "Maximum skills reached",
        description: "You can only add up to 5 skills.",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("learnSkills", [...currentSkills, newLearnSkill]);
    setNewLearnSkill("");
  }

  function removeLearnSkill(skill: string) {
    const currentSkills = form.getValues("learnSkills");
    form.setValue(
      "learnSkills",
      currentSkills.filter((s) => s !== skill)
    );
  }

  function addAvailability() {
    const currentAvailability = form.getValues("availability");
    form.setValue("availability", [
      ...currentAvailability,
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
    ]);
  }

  function removeAvailability(index: number) {
    const currentAvailability = form.getValues("availability");
    form.setValue(
      "availability",
      currentAvailability.filter((_, i) => i !== index)
    );
  }

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid grid-cols-3 w-full mb-6">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
      </TabsList>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell others about yourself"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <FormMessage />
                        <span>{field.value.length}/500</span>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add skills you can teach and want to learn (max 5 each)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Skills You Can Teach</h3>
                  
                  <div className="flex flex-wrap gap-2 min-h-12">
                    <FormField
                      control={form.control}
                      name="teachSkills"
                      render={({ field }) => (
                        <>
                          {field.value.map((skill) => (
                            <Badge key={skill} variant="default" className="bg-blue-600">
                              {skill}
                              <button
                                type="button"
                                className="ml-1"
                                onClick={() => removeTeachSkill(skill)}
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {field.value.length === 0 && (
                            <span className="text-sm text-muted-foreground">
                              No skills added yet
                            </span>
                          )}
                        </>
                      )}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={newTeachSkill}
                      onValueChange={setNewTeachSkill}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillSuggestions.map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" onClick={addTeachSkill}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage>{form.formState.errors.teachSkills?.message}</FormMessage>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Skills You Want to Learn</h3>
                  
                  <div className="flex flex-wrap gap-2 min-h-12">
                    <FormField
                      control={form.control}
                      name="learnSkills"
                      render={({ field }) => (
                        <>
                          {field.value.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                              <button
                                type="button"
                                className="ml-1"
                                onClick={() => removeLearnSkill(skill)}
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {field.value.length === 0 && (
                            <span className="text-sm text-muted-foreground">
                              No skills added yet
                            </span>
                          )}
                        </>
                      )}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={newLearnSkill}
                      onValueChange={setNewLearnSkill}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillSuggestions.map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" onClick={addLearnSkill}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage>{form.formState.errors.learnSkills?.message}</FormMessage>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>
                  Set when you're available for skill exchange sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <div className="space-y-4">
                      {field.value.map((slot, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-4 rounded-lg border p-4">
                          <div className="flex-1">
                            <FormLabel className="text-xs text-muted-foreground">Day</FormLabel>
                            <Select
                              value={slot.day}
                              onValueChange={(value) => {
                                const newAvailability = [...field.value];
                                newAvailability[index].day = value;
                                form.setValue("availability", newAvailability);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a day" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                                <SelectItem value="Saturday">Saturday</SelectItem>
                                <SelectItem value="Sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex-1">
                            <FormLabel className="text-xs text-muted-foreground">Start Time</FormLabel>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => {
                                const newAvailability = [...field.value];
                                newAvailability[index].startTime = e.target.value;
                                form.setValue("availability", newAvailability);
                              }}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <FormLabel className="text-xs text-muted-foreground">End Time</FormLabel>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => {
                                const newAvailability = [...field.value];
                                newAvailability[index].endTime = e.target.value;
                                form.setValue("availability", newAvailability);
                              }}
                            />
                          </div>
                          
                          <div className="flex items-end justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAvailability(index)}
                              disabled={field.value.length <= 1}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAvailability}
                        className="mt-2"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add More Availability
                      </Button>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  );
}