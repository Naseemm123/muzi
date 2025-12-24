import { createAuthClient } from "better-auth/react"
export const { signIn, signUp, signOut, getSession, useSession, linkSocial, getAccessToken } = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    // baseURL: "http://localhost:3000"
    baseURL: process.env.BETTER_AUTH_URL
})