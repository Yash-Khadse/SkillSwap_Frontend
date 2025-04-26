import { DashboardLayout } from "@/components/dashboard/layout";
import { ChatInterface } from "@/components/dashboard/messages/chat-interface";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }
  
  return (
    <DashboardLayout>
      <ChatInterface conversationId={params.id} />
    </DashboardLayout>
  );
}