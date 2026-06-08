import Link from "next/link";
import { claimGoogleOwnerCode } from "@/app/actions/auth";
import { KeyRound } from "lucide-react";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function GoogleOwnerPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
          <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
        </Link>
        <p className="mt-3 text-gray-500 text-sm">One last step</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <KeyRound size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Enter your access code</p>
            <p className="text-xs text-gray-500 mt-0.5">You received this after your demo with Franchisli</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={claimGoogleOwnerCode} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Access Code <span className="text-red-500">*</span>
            </label>
            <input name="access_code" type="text" required
              placeholder="FRNCH-XXXXXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-mono tracking-widest uppercase" />
          </div>
          <button type="submit" className="w-full font-bold text-sm px-7 py-3.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm">
            Activate Account
          </button>
        </form>
      </div>
    </div>
  );
}
