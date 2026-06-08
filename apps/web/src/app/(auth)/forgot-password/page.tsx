import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";
import { CheckCircle2, Mail } from "lucide-react";

interface Props {
  searchParams: Promise<{ sent?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { sent } = await searchParams;

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
            <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            If that email has an account, we&apos;ve sent a password reset link. Check your inbox and spam folder.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-brand-500 font-semibold hover:text-brand-600">
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
          <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
        </Link>
        <p className="mt-3 text-gray-500 text-sm">Reset your password</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Mail size={20} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Forgot your password?</p>
            <p className="text-xs text-gray-500 mt-0.5">Enter your email and we&apos;ll send a reset link</p>
          </div>
        </div>

        <form action={forgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
            <input name="email" type="email" required autoComplete="email"
              placeholder="you@yourfranchise.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
          <button type="submit" className="w-full font-bold text-sm px-7 py-3.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm">
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember it?{" "}
          <Link href="/login" className="text-brand-500 font-semibold hover:text-brand-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
