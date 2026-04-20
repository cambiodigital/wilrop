import AdminDetailRoutePlaceholder from '@/components/admin/AdminDetailRoutePlaceholder';

export default async function AdminPackageDetailPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;

  return <AdminDetailRoutePlaceholder entityLabel="paquetes" id={packageId} backHref="/admin/paquetes" />;
}
