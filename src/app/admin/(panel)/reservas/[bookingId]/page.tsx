import AdminDetailRoutePlaceholder from '@/components/admin/AdminDetailRoutePlaceholder';

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return <AdminDetailRoutePlaceholder entityLabel="reservas" id={bookingId} backHref="/admin/reservas" />;
}
