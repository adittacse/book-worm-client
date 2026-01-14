import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "Enter Email"
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Enter Password"
                },
            },

            async authorize(credentials) {
                try {
                    const email = credentials?.email;
                    const password = credentials?.password;

                    if (!email || !password) return null;

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await res.json();

                    if (!res.ok || !data?.ok || !data?.token) {
                        return null;
                    }

                    // NextAuth user object (jwt callback এ যাবে)
                    return {
                        email: data.user?.email,
                        name: data.user?.name,
                        image: data.user?.photo,
                        role: data.user?.role || "user",
                        accessToken: data.token,
                    };
                } catch (err) {
                    return null;
                }
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),

        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            try {
                if (account?.provider === "google" || account?.provider === "github") {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth-sync`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-api-key": process.env.OAUTH_SYNC_KEY || "",
                        },
                        body: JSON.stringify({
                            name: user?.name || "",
                            email: user?.email || "",
                            photo: user?.image || "",
                            provider: account?.provider,
                            providerId: account?.providerAccountId || "",
                        }),
                    });

                    const data = await res.json().catch(() => ({}));

                    if (data?.ok && data?.token) {
                        user.accessToken = data.token;
                        user.role = data.user?.role || "user";
                    }
                }

                return true;
            } catch (e) {
                return true;
            }
        },

        async jwt({ token, user }) {
            if (user?.accessToken) {
                token.accessToken = user.accessToken;
            }
            if (user?.role) {
                console.log("user role", user?.role);
                token.role = user.role;
            }
            if (user?.email) {
                token.email = user.email;
            }

            // default role
            if (!token.role) {
                token.role = "user";
            }

            return token;
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken || "";
            session.role = token.role || "user";
            session.user.role = token.role || "user";
            return session;
        },
    },

    pages: {
        signIn: "/login",
    },
};
