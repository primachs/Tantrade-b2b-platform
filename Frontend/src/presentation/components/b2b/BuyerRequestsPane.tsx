import { useMemo, useState } from "react";
import { Search, ClipboardList, MapPin } from "lucide-react";
import type { Rfs, TaxonomyResponse, Business } from "./types";

type Props = {
  rfsList: Rfs[];
  taxonomy: TaxonomyResponse | null;
  myBusiness: Business;
  onOpenMatches: () => void;
};

/**
 * Browse buyer demand already available to this business through the existing
 * RFS endpoint. This does not independently verify buyers or expose private leads.
 * Backend RFS visibility rules remain authoritative.
 */
export function BuyerRequestsPane({ rfsList, taxonomy, myBusiness, onOpenMatches }: Props) {
  const [query, setQuery] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [region, setRegion] = useState("");

  const visibleRequests = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rfsList.filter((request) => {
      if (request.buyer_id === myBusiness.id) return false;
      if (serviceTypeId && request.service_type_id !== serviceTypeId) return false;
      if (region && (request.constraint?.region ?? "").toLowerCase().includes(region.toLowerCase()) === false) return false;
      return !term || [request.title, request.description, request.buyer_name]
        .some((value) => (value ?? "").toLowerCase().includes(term));
    });
  }, [rfsList, myBusiness.id, query, serviceTypeId, region]);

  const serviceNames = new Map((taxonomy?.service_types ?? []).map((item) => [item.id, item.name]));

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Buyer purchasing requests</h2>
        <p className="text-sm text-slate-600 mt-1">
          Find demand already shared with your business through TanTrade matchmaking.
          Buyer identities shown here are not independently verified by this screen.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="relative">
          <span className="sr-only">Search purchasing requests</span>
          <Search size={18} className="absolute left-3 top-3 text-slate-500" />
          <input
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm"
            placeholder="Search buyer needs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Filter by service category</span>
          <select className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm" value={serviceTypeId} onChange={(event) => setServiceTypeId(event.target.value)}>
            <option value="">All categories</option>
            {(taxonomy?.service_types ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by region</span>
          <input className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm" placeholder="Region" value={region} onChange={(event) => setRegion(event.target.value)} />
        </label>
      </div>
      <div className="space-y-3" aria-live="polite">
        {visibleRequests.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <ClipboardList className="mx-auto mb-3 text-slate-500" />
            <p className="font-medium">No purchasing requests match your filters.</p>
            <p className="text-sm text-slate-600 mt-1">Try another category or search term.</p>
          </div>
        ) : visibleRequests.map((request) => (
          <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{request.title}</h3>
              <span className="text-xs rounded-full bg-slate-100 px-3 py-1">{request.status}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{request.buyer_name || "Buyer"}</p>
            <p className="mt-2 text-sm">{request.description || "No description provided."}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
              <span>{serviceNames.get(request.service_type_id) || "Uncategorized"}</span>
              {request.constraint?.region && <span className="inline-flex items-center gap-1"><MapPin size={13} />{request.constraint.region}</span>}
              {request.constraint?.deadline && <span>Deadline: {request.constraint.deadline}</span>}
            </div>
            <button type="button" onClick={onOpenMatches} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              View matching & engagement options
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
