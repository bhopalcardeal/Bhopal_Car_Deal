import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const admin = await prisma.adminUser.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!admin || !admin.passwordHash) {
            return null;
          }

          const isValid = await bcrypt.compare(password, admin.passwordHash);
          if (!isValid) {
            return null;
          }

          // Record last login timestamp
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() },
          });

          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          };
        } catch (error) {
          console.error("[Auth] Authorize exception:", error);
          return null;
        }
      },
    }),
  ],
});
