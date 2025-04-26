import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/auth/sign-in-button";
import { ModeToggle } from "@/components/theme-toggle";
import { LaptopIcon, MessagesSquare, Users2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LaptopIcon className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">SkillSwap</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <SignInButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Learn from peers.
              <span className="block text-blue-600 dark:text-blue-400">Share your skills.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              SkillSwap connects you with people who have the skills you want to learn,
              and who want to learn what you know best.
            </p>
            <div className="pt-4">
              <SignInButton size="lg" />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Users2 className="h-8 w-8 text-blue-600" />}
              title="Smart Matching"
              description="Our algorithm finds the perfect learning partners based on complementary skills."
            />
            <FeatureCard 
              icon={<MessagesSquare className="h-8 w-8 text-yellow-500" />}
              title="Real-time Chat"
              description="Connect instantly with your matches through our built-in messaging system."
            />
            <FeatureCard 
              icon={<LaptopIcon className="h-8 w-8 text-green-500" />}
              title="Skill Tracking"
              description="Define what you know and what you want to learn with our simple tagging system."
            />
            <FeatureCard 
              icon={<Users2 className="h-8 w-8 text-purple-500" />}
              title="Community Learning"
              description="Join a community of passionate learners and knowledge sharers."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}