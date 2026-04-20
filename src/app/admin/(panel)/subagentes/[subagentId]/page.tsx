import AdminDetailRoutePlaceholder from '@/components/admin/AdminDetailRoutePlaceholder';

export default async function AdminSubagentDetailPage({
  params,
}: {
  params: Promise<{ subagentId: string }>;
}) {
  const { subagentId } = await params;

  return (
    <AdminDetailRoutePlaceholder
      entityLabel="subagentes"
      id={subagentId}
      backHref="/admin/subagentes"
    />
  );
}
