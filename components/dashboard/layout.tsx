"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  LaptopIcon,
  LayoutDashboardIcon,
  UserIcon,
  MessageSquareIcon,
  Users2Icon,
  MenuIcon,
  XIcon,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const userInitial = session.user.name?.charAt(0) || "U";

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <UserIcon className="h-5 w-5" />,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquareIcon className="h-5 w-5" />,
    },
    {
      name: "Matches",
      href: "/dashboard/matches",
      icon: <Users2Icon className="h-5 w-5" />,
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <div className="flex items-center gap-2 px-2">
              <LaptopIcon className="h-6 w-6" />
              <span className="text-lg font-bold">SkillSwap</span>
            </div>
            <div className="mt-8 flex flex-col gap-4">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    router.push(item.href);
                    setOpen(false);
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-4 py-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={handleSignOut}
              >
                <LogOutIcon className="h-5 w-5 mr-2" />
                Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <LaptopIcon className="h-6 w-6" />
          <span className="text-lg font-bold">SkillSwap</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          <Avatar>
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
          <div className="flex h-16 items-center gap-2 px-6">
            <LaptopIcon className="h-6 w-6" />
            <span className="text-lg font-bold">SkillSwap</span>
          </div>
          <div className="flex flex-col gap-2 px-2 py-4">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                className="justify-start"
                onClick={() => router.push(item.href)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}
          </div>

          <div className="mt-auto px-2 py-4">
            <Separator className="mb-4" />
            <div className="flex items-center gap-4 px-4 py-2">
              <Avatar>
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{session.user.name}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[130px]">
                  {session.user.email}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between px-4">
              <ModeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}