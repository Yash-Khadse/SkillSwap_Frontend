"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ButtonProps } from "@/components/ui/button";

export function SignInButton({ size = "default", ...props }: ButtonProps & { size?: "default" | "sm" | "lg" }) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = async () => {
    if (session) {
      router.push("/dashboard");
      return;
    }

    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSignIn} 
      disabled={isLoading}
      size={size}
      className="bg-blue-600 hover:bg-blue-700"
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : session ? (
        "Go to Dashboard"
      ) : (
        "Sign in with Google"
      )}
    </Button>
  );
}