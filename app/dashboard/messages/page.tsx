import { DashboardLayout } from "@/components/dashboard/layout";
import { MessageList } from "@/components/dashboard/messages/message-list";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }
  
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your skill swap partners
          </p>
        </div>
        
        <div className="mt-6">
          <MessageList />
        </div>
      </div>
    </DashboardLayout>
  );
}