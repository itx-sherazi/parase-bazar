"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineEnvelope, HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed } from "react-icons/hi2";
import AuthLayout from "../components/AuthLayout";
import Captcha from "../components/Captcha";
import { loginUser } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser({ email, password, captchaToken });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Link href="/" className="mb-8 inline-flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="ParasBazar" className="h-9 w-auto" />
      </Link>

      <h1 className="text-2xl font-extrabold text-zinc-900">Welcome back</h1>
      <p className="mt-1 text-sm text-zinc-500">Sign in to your ParasBazar account</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="relative">
          <HiOutlineEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400" />
          <input
            required
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div className="relative">
          <HiOutlineLockClosed className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400" />
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-11 text-sm text-zinc-900 outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400 hover:text-zinc-600"
          >
            {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
          </button>
        </div>

        <div className="text-right">
          <span className="cursor-not-allowed text-xs font-semibold text-zinc-400" title="Coming soon">
            Forgot password?
          </span>
        </div>

        <Captcha onVerify={setCaptchaToken} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
          {!loading && <span aria-hidden>→</span>}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        or continue with
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <button
        type="button"
        title="Coming soon"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        <FcGoogle className="text-lg" /> Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-amber-500 hover:text-amber-600">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
}
