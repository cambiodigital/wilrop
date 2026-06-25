import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getPendingProducts } from '@/lib/admin/product-review';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const data = await getPendingProducts();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar productos pendientes' },
      { status: 500 },
    );
  }
}
