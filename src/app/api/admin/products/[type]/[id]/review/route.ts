import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, reviewProduct, VALID_PRODUCT_TYPES, type ProductType } from '@/lib/admin/product-review';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { type, id } = await params;
    const body = await request.json();
    const { action, reviewNotes } = body;

    if (!VALID_PRODUCT_TYPES.includes(type as ProductType)) {
      return NextResponse.json({ success: false, error: 'Tipo de producto no válido' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    }

    const result = await reviewProduct(type as ProductType, id, action, reviewNotes);

    if ('error' in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reviewing product:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
