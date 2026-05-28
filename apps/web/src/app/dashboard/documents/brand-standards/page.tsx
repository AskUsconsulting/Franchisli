import { Shield, ExternalLink, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

// ── Demo data ──────────────────────────────────────────────────────────────────

const BRAND_DOCS = [
  {
    id: "bs1",
    title: "Brand Identity & Logo Usage",
    description: "Official logo files, usage rules, prohibited modifications, and brand color palette.",
    version: "4.0",
    updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    icon: "🎨",
    highlights: ["Primary / secondary logo files", "Color palette & hex codes", "Typography guidelines", "Prohibited logo uses"],
  },
  {
    id: "bs2",
    title: "Uniform & Appearance Standards",
    description: "Staff uniform requirements, grooming standards, and approved accessories.",
    version: "2.1",
    updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    icon: "👕",
    highlights: ["Required uniform items", "Approved name tag format", "Grooming & hygiene standards", "Manager vs. crew differences"],
  },
  {
    id: "bs3",
    title: "Store Design & Signage Standards",
    description: "Interior layout requirements, approved signage specifications, and décor guidelines.",
    version: "3.5",
    updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    icon: "🏬",
    highlights: ["Floor plan requirements", "Counter & POS layout", "Exterior signage specs", "Interior décor approved items"],
  },
  {
    id: "bs4",
    title: "Social Media & Marketing Guidelines",
    description: "Approved messaging, hashtags, posting schedule, and content rules for franchise-owned accounts.",
    version: "1.4",
    updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    icon: "📱",
    highlights: ["Approved hashtags & handles", "Post frequency guidelines", "Content approval process", "Crisis communication rules"],
  },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function BrandStandardsPage() {
  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-start gap-3">
        <Shield size={20} className="text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-brand-800 text-sm">Brand Standards Library</p>
          <p className="text-sm text-brand-600 mt-0.5">
            These documents define the Franchisli brand experience. All franchise locations are required to follow these standards. Contact HQ before making any brand modifications.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BRAND_DOCS.map((doc) => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand-200 transition-all group">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl shrink-0">
                {doc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{doc.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{doc.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">v{doc.version}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={9} /> {formatDate(doc.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <ul className="space-y-1 mb-4">
              {doc.highlights.map((h) => (
                <li key={h} className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-400 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Link
                href={`/dashboard/documents/${doc.id}`}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                View doc <ArrowRight size={11} />
              </Link>
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ExternalLink size={11} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        Need to update a brand standard document? Contact <span className="text-brand-500">HQ operations@franchisli.com</span>
      </p>
    </div>
  );
}
