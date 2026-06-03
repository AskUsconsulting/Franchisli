import Link from "next/link";
import { signUpOwner, signInWithGoogle } from "@/app/actions/auth";
import { KeyRound } from "lucide-react";

interface Props {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function OwnerSignupPage({ searchParams }: Props) {
  const { error, success } = await searchParams;

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
            <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Check your email!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            We sent a confirmation link to your email. Click it to activate your account and you&apos;ll be taken straight to your dashboard.
          </p>
          <p className="text-xs text-gray-400 mt-4">Don&apos;t see it? Check your spam folder.</p>
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
        <p className="mt-3 text-gray-500 text-sm">Create your owner account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
        {/* Access code callout */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <KeyRound size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            You need an <strong>access code</strong> to create an owner account. You receive this after your demo call with the Franchisli team.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={signUpOwner} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input
              name="full_name" type="text" required autoComplete="name"
              placeholder="Jane Smith"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Work Email</label>
            <input
              name="email" type="email" required autoComplete="email"
              placeholder="jane@yourfranchise.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
            <input
              name="password" type="password" required autoComplete="new-password" minLength={8}
              placeholder="At least 8 characters"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Access Code <span className="text-accent-500">*</span>
            </label>
            <input
              name="access_code" type="text" required
              placeholder="e.g. FRNCH-A1B2C3"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all font-mono tracking-widest uppercase"
            />
            <p className="text-xs text-gray-400 mt-1.5">Provided by Franchisli after your demo.</p>
          </div>

          <button type="submit" className="w-full font-bold text-sm px-7 py-3.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm mt-2">
            Create Owner Account
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400 font-medium">or</span></div>
        </div>

        <form action={signInWithGoogle}>
          <button type="submit" className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">You&apos;ll still need your access code on the next step.</p>

        <p className="text-center text-sm text-gray-500 mt-5">
          <Link href="/signup" className="text-brand-500 font-semibold hover:text-brand-600">← Back</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
  );
}
