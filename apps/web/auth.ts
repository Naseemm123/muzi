import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

const nextAuthResult = NextAuth({
  providers: [
    GitHub,
    Google,
    Spotify
  ],
  pages: {
    error: "/error"
  },
  callbacks: {
    // give the user the access token provided by the OAuth provider
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // add the access token to the session object
    async session({ session, token }) {
      if (token) {
        session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
      }
      return session;
    }
  },
});

export const handlers = nextAuthResult.handlers;
export const signIn: typeof nextAuthResult.signIn = nextAuthResult.signIn;
export const signOut: typeof nextAuthResult.signOut = nextAuthResult.signOut;
export const auth: typeof nextAuthResult.auth = nextAuthResult.auth;
