import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db, { schema } from "@workspace/orm-drizzle";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirectUri: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
            // scope: ["https://www.googleapis.com/auth/youtube.readonly"],
            scope: ["openid", "email", "profile", "https://www.googleapis.com/auth/youtube.readonly"],
            prompt: "consent",
        },
    }
});
