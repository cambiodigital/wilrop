import AdminDetailRoutePlaceholder from '@/components/admin/AdminDetailRoutePlaceholder';

export default async function AdminExcursionDetailPage({
  params,
}: {
  params: Promise<{ excursionId: string }>;
}) {
  const { excursionId } = await params;

  return (
    <AdminDetailRoutePlaceholder
      entityLabel="excursiones"
      id={excursionId}
      backHref="/admin/excursiones"
    />
  );
}
