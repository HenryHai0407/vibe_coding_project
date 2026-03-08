import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const loginLimiter = checkRateLimit({
          key: `login:${email}`,
          windowMs: 60_000,
          maxRequests: 15
        });

        if (loginLimiter.limited) {
          logger.warn("rate_limit.login", { email });
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          logger.warn("auth.login.failed", { email, reason: "invalid_credentials" });
          return null;
        }

        const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValidPassword) {
          logger.warn("auth.login.failed", { email, reason: "invalid_credentials" });
          return null;
        }

        logger.info("auth.login.success", { userId: user.id, email });
        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.email
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
});
