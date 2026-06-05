"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Building2, MapPin, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const STEPS = ["Welcome", "Your Franchise", "First Location", "Done"];
const LOCATION_COUNTS = ["1", "2–5", "6–10", "11–25", "26+"];

export default function OnboardingPage() {
  const router  = useRouter();
  const [step,  setStep]  = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,  setError]  = useState("");

  const [profile, setProfile] = useState({ full_name: "", business_name: "", location_count: "" });
  const [location, setLocation] = useState({ name: "", address: "", city: "", state: "" });

  function setP(k: string, v: string) { setProfile(p => ({ ...p, [k]: v })); }
  function setL(k: string, v: string) { setLocation(l => ({ ...l, [k]: v })); }

  async function finish() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Update profile
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({
          id:            user.id,
          role:          "owner",
          full_name:     profile.full_name,
          business_name: profile.business_name,
        });
      if (profErr) throw profErr;

      // Create first location if provided
      if (location.name) {
        await supabase.from("locations").insert({
          name:    location.name,
          address: [location.address, location.city, location.state].filter(Boolean).join(", "),
          status:  "active",
        });
      }

      setStep(3);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-black">F</span>
            <span className="font-black text-2xl tracking-tight text-brand-600">Franchisli</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-5">
                <Building2 size={28} className="text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Franchisli!</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Let&apos;s get your franchise network set up. This takes about 2 minutes.
              </p>
              <button onClick={() => setStep(1)} className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1 — Profile + Franchise */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">About you & your franchise</h2>
              <p className="text-sm text-gray-500 mb-6">This personalizes your dashboard</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Full Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={profile.full_name} onChange={e => setP("full_name", e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Franchise / Business Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={profile.business_name} onChange={e => setP("business_name", e.target.value)}
                    placeholder="Smith Franchise Group"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">How many locations do you have?</label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATION_COUNTS.map(c => (
                      <button key={c} type="button" onClick={() => setP("location_count", c)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border-[1.5px] transition-all ${
                          profile.location_count === c ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-600 hover:border-brand-500"
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Back</button>
                <button
                  onClick={() => profile.full_name && profile.business_name ? setStep(2) : setError("Please fill in your name and franchise name")}
                  className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
            </div>
          )}

          {/* Step 2 — First Location */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add your first location</h2>
                  <p className="text-sm text-gray-500">You can add more from the dashboard</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Location Name</label>
                  <input type="text" value={location.name} onChange={e => setL("name", e.target.value)}
                    placeholder="e.g. Downtown Atlanta"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Street Address</label>
                  <input type="text" value={location.address} onChange={e => setL("address", e.target.value)}
                    placeholder="123 Main St"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">City</label>
                    <input type="text" value={location.city} onChange={e => setL("city", e.target.value)}
                      placeholder="Atlanta"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">State</label>
                    <input type="text" value={location.state} onChange={e => setL("state", e.target.value)}
                      placeholder="GA"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setError(""); setStep(1); }} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Back</button>
                <button onClick={finish} disabled={loading}
                  className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Setting up...</> : <>Finish Setup <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
              <p className="text-gray-500 text-sm">Taking you to your dashboard...</p>
              <div className="mt-4 w-8 h-8 mx-auto">
                <Loader2 size={32} className="animate-spin text-brand-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
