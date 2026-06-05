import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Key, Users, CheckCircle2, Clock } from "lucide-react";

async function generateCode(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const label = formData.get("label") as string;
  const code  = "FRNCH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  await admin.from("access_codes").insert({ code, label });
  revalidatePath("/admin");
}

async function deleteCode(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  await admin.from("access_codes").delete().eq("id", id);
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const admin = createAdminClient();

  const [{ data: codes }, { data: profiles }, { data: users }] = await Promise.all([
    admin.from("access_codes").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("id, full_name, role, created_at"),
    admin.auth.admin.listUsers(),
  ]);

  const unused = (codes ?? []).filter((c) => !c.used).length;
  const used   = (codes ?? []).filter((c) => c.used).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Franchisli Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Manage access codes and customers</p>
          </div>
          <a href="/dashboard" className="text-sm text-brand-600 font-semibold hover:text-brand-700">
            ← Dashboard
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users",    value: users?.users?.length ?? 0, icon: Users,        color: "bg-blue-50 text-blue-600" },
            { label: "Unused Codes",   value: unused,                    icon: Key,           color: "bg-green-50 text-green-600" },
            { label: "Used Codes",     value: used,                      icon: CheckCircle2,  color: "bg-gray-50 text-gray-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Generate code */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Generate Access Code</h2>
          <form action={generateCode} className="flex gap-3">
            <input
              name="label" type="text" required
              placeholder="Label e.g. Jane Smith — Golden Corral demo Jun 5"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />
            <button type="submit" className="bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors whitespace-nowrap">
              Generate Code
            </button>
          </form>
        </div>

        {/* Codes table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Access Codes</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                <th className="text-left px-6 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Label</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="text-right px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(codes ?? []).map((code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono font-bold text-brand-600">{code.code}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{code.label ?? "—"}</td>
                  <td className="px-4 py-3">
                    {code.used
                      ? <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Used</span>
                      : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Available</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(code.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    {!code.used && (
                      <form action={deleteCode} className="inline">
                        <input type="hidden" name="id" value={code.id} />
                        <button type="submit" className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {(codes ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">No codes yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Users */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Users</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Confirmed</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(users?.users ?? []).map((u) => {
                const profile = (profiles ?? []).find((p) => p.id === u.id);
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{profile?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile?.role === "owner" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600"}`}>
                        {profile?.role ?? "no profile"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.email_confirmed_at
                        ? <CheckCircle2 size={15} className="text-green-500" />
                        : <Clock size={15} className="text-gray-300" />}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
