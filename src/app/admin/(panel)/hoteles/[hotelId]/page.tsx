import AdminDetailRoutePlaceholder from '@/components/admin/AdminDetailRoutePlaceholder';

export default async function AdminHotelDetailPage({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  const { hotelId } = await params;

  return <AdminDetailRoutePlaceholder entityLabel="hoteles" id={hotelId} backHref="/admin/hoteles" />;
}
