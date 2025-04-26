import { DashboardLayout } from "@/components/dashboard/layout";
import { MatchesPage } from "@/components/dashboard/matches/matches-page";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Matches() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }
  
  return (
    <DashboardLayout>
      <MatchesPage />
    </DashboardLayout>
  );
}