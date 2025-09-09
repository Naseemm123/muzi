import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@workspace/db/generated/client";
import { createAuthMiddleware } from "better-auth/api";
import { checkPremium } from "@/utils/utils";

const prisma = new PrismaClient();


export const auth = betterAuth({
  logger: {
    level: "debug", 
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        required: false,
      }
    }
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      scope: ["user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "streaming"
      ],
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {

      const context = ctx.context;

      
      const { internalAdapter, newSession} = context;


      if(!ctx.path.startsWith('/get-session')) {
        console.log('path is', ctx.path);
        console.log('context is', context);
      }

      if (newSession && ctx.path.startsWith("/callback")) {

        try {

          const accounts = await internalAdapter.findAccountByUserId(newSession.user.id);

          const accessToken = accounts.find(account => account.providerId === "spotify")?.accessToken;

          if(!accessToken) {
            console.error("No access token found for Spotify.");
            return;
          }

          const isPremium = await checkPremium(accessToken);

          console.log("User premium status:", isPremium);

          console.log("Updating user plan in session to:", isPremium ? "premium" : "free");
          await internalAdapter.updateUser(newSession.user.id, {
            plan: isPremium ? "premium" : "free"
          });
        
          
        } catch (error) {
          console.error("there has been an error:", error);
        }

        
        
      }
    }),
  },
});




