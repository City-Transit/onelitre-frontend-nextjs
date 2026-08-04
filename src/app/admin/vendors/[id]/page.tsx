import { notFound } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type {
  Badge,
  Paginated,
  Vendor,
  VendorDocument,
  VendorIncident,
  VendorOrderGroup,
  VendorWalkthrough,
} from '@/lib/types';
import { VendorDetailPanel } from './vendor-detail-panel';

export default async function AdminVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vendorRes, documentsRes, ordersRes, walkthroughsRes, incidentsRes, badgesRes] =
    await Promise.all([
      serverApiFetch(`/admin/vendors/${id}`),
      serverApiFetch(`/admin/vendors/${id}/documents`),
      serverApiFetch(`/admin/vendors/${id}/orders?limit=100`),
      serverApiFetch(`/admin/vendors/${id}/walkthroughs`),
      serverApiFetch(`/admin/vendors/${id}/incidents`),
      serverApiFetch('/admin/badges'),
    ]);
  if (vendorRes.status === 404) notFound();
  if (!vendorRes.ok) notFound();

  const vendor: Vendor = await vendorRes.json();
  const documents: VendorDocument[] = documentsRes.ok ? await documentsRes.json() : [];
  const orders: Paginated<VendorOrderGroup> = ordersRes.ok
    ? await ordersRes.json()
    : { items: [], total: 0, page: 1, limit: 100 };
  const walkthroughs: VendorWalkthrough[] = walkthroughsRes.ok ? await walkthroughsRes.json() : [];
  const incidents: VendorIncident[] = incidentsRes.ok ? await incidentsRes.json() : [];
  const allBadges: Badge[] = badgesRes.ok ? await badgesRes.json() : [];

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">{vendor.name}</h2>
      <VendorDetailPanel
        vendor={vendor}
        initialDocuments={documents}
        orderGroups={orders.items}
        initialWalkthroughs={walkthroughs}
        initialIncidents={incidents}
        allBadges={allBadges}
      />
    </div>
  );
}
