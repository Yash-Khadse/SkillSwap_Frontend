import { DashboardLayout } from "@/components/dashboard/layout";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }
  
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and skills
          </p>
        </div>
        
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}