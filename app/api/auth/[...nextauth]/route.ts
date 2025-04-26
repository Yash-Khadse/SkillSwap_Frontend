import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/user";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { name, email, image } = user;
        
        try {
          await connectDB();
          
          // Check if user exists
          const existingUser = await User.findOne({ email: email });
          
          if (!existingUser) {
            // Create new user
            await User.create({
              email,
              name,
              image,
              googleId: account.providerAccountId,
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email });
          
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.profileCompleted = dbUser.profileCompleted;
          }
        } catch (error) {
          console.error("Error getting session user:", error);
        }
      }
      
      return session;
    },
    async jwt({ token, account, profile }) {
      // Add user info to token
      if (account && profile) {
        token.id = account.providerAccountId;
      }
      
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };