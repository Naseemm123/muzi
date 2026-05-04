import { createAuthClient } from "better-auth/react"
export const { signIn, signUp, signOut, getSession, useSession, linkSocial, getAccessToken } = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL
})