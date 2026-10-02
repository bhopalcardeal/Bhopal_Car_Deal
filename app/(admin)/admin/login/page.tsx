"use client";

import React, { useState, useTransition, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid admin email or password. Please verify credentials.");
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err) {
        console.error("Sign-in error:", err);
        setError("An unexpected error occurred during login. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12 text-slate-900 relative overflow-hidden">
      {/* Ambient Red Accent Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 opacity-20 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, hsl(350 89% 55% / 0.5) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative h-14 w-[230px] overflow-hidden rounded-2xl bg-black px-3 py-1.5 border border-slate-200 shadow-md flex items-center justify-center">
            <Image
              src="/images/logo-horizontal.jpg"
              alt="Bhopal Car Deal"
              width={220}
              height={56}
              className="h-11 w-auto object-contain"
              priority
            />
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Shield className="size-3.5 text-primary" />
              <span>Restricted Administrative Access</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Admin Portal
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Sign in to manage verified inventory, seller leads, and customer enquiries.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bhopalcardeal.com"
                  className="pl-9 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary focus-visible:border-primary rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary focus-visible:border-primary rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-primary hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-md shadow-primary/25 transition-all hover:scale-101 active:scale-99 gap-2 cursor-pointer mt-2"
            >
              <span>{isPending ? "Authenticating..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400">
          Protected by 256-bit encryption • Bhopal Car Deal (Since 2004)
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
