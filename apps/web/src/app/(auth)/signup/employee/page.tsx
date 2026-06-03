import Link from "next/link";
import { Mail } from "lucide-react";

export default function EmployeeSignupPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
          <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
        </Link>
        <p className="mt-3 text-gray-500 text-sm">Employee sign up</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-5">
          <Mail size={28} className="text-brand-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3">Check your email</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
          Employee accounts are created by your franchise owner. Ask them to invite you from their Franchisli dashboard — you&apos;ll receive an email with a sign-up link.
        </p>

        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">How it works</p>
          <ol className="space-y-1.5 text-sm text-gray-500 list-decimal list-inside">
            <li>Your owner goes to <strong>Settings → Team</strong> in their dashboard</li>
            <li>They enter your email and click <strong>Invite Employee</strong></li>
            <li>You get an email — click the link to set your password</li>
            <li>You&apos;re in! 🎉</li>
          </ol>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/login"
            className="block w-full font-bold text-sm px-7 py-3.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            Already have an account? Sign in
          </Link>
          <Link href="/signup" className="block text-sm text-brand-500 font-semibold hover:text-brand-600">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
}
