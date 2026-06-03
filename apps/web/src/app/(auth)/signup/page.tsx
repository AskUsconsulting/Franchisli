import Link from "next/link";
import { Building2, Users } from "lucide-react";

export default function SignupRolePage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
          <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
        </Link>
        <p className="mt-3 text-gray-500 text-sm">Who are you signing up as?</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 space-y-4">
        {/* Owner */}
        <Link
          href="/signup/owner"
          className="flex items-start gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
            <Building2 size={22} className="text-brand-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">Franchise Owner / Operator</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Manage your entire franchise network — locations, audits, compliance, and team communications.
            </p>
            <p className="text-xs text-brand-500 font-semibold mt-2">Requires an access code from Franchisli →</p>
          </div>
        </Link>

        {/* Employee */}
        <Link
          href="/signup/employee"
          className="flex items-start gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
            <Users size={22} className="text-brand-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[15px]">Employee / Location Staff</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Access your location&apos;s checklists, training, and communications from your franchise owner.
            </p>
            <p className="text-xs text-brand-500 font-semibold mt-2">Requires an invite from your owner →</p>
          </div>
        </Link>

        <p className="text-center text-sm text-gray-500 pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-500 font-semibold hover:text-brand-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
