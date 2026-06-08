"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
          <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
        </Link>
        <p className="mt-3 text-gray-500 text-sm">Set a new password</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form action={resetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">New Password</label>
            <div className="relative">
              <input name="password" type={show ? "text" : "password"} required minLength={8}
                placeholder="At least 8 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 pr-10" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
            <input name="confirm" type={show ? "text" : "password"} required minLength={8}
              placeholder="Repeat your password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <button type="submit" className="w-full font-bold text-sm px-7 py-3.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm mt-2">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
