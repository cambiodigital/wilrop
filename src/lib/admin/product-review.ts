import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';

export type ProductType = 'package' | 'hotel' | 'excursion' | 'cruise' | 'transport' | 'destination';

const MODEL_MAP: Record<ProductType, { model: any; nameKey: string }> = {
  package: { model: db.travelPackage, nameKey: 'title' },
  hotel: { model: db.hotel, nameKey: 'name' },
  excursion: { model: db.excursion, nameKey: 'name' },
  cruise: { model: db.cruise, nameKey: 'name' },
  transport: { model: db.transportService, nameKey: 'name' },
  destination: { model: db.destination, nameKey: 'name' },
};

export const VALID_PRODUCT_TYPES = Object.keys(MODEL_MAP) as ProductType[];

export async function verifyAdminSession(request: NextRequest) {
  const cookieName = getPanelSessionCookieName('admin');
  const sessionToken = request.cookies.get(cookieName)?.value;
  const session = verifyPanelSessionToken(sessionToken, 'admin');
  return session ?? null;
}

export async function getPendingProducts() {
  const results: Array<{
    type: ProductType;
    product: Record<string, unknown>;
    reseller: { id: string; companyName: string; contactName: string; email: string } | null;
  }> = [];

  for (const [type, { model }] of Object.entries(MODEL_MAP) as [ProductType, { model: any; nameKey: string }][]) {
    const items = await model.findMany({
      where: { publishStatus: 'pending_review', resellerId: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: { reseller: { select: { id: true, companyName: true, contactName: true, email: true } } },
    });

    for (const item of items) {
      const { reseller, ...product } = item;
      results.push({ type, product, reseller });
    }
  }

  return results;
}

export async function reviewProduct(type: ProductType, id: string, action: 'approve' | 'reject', reviewNotes?: string) {
  const { model, nameKey } = MODEL_MAP[type];

  const product = await model.findUnique({ where: { id } });
  if (!product) return { error: 'Producto no encontrado', status: 404 };

  if (action === 'approve') {
    await model.update({
      where: { id },
      data: { publishStatus: 'approved' },
    });
  } else {
    await model.update({
      where: { id },
      data: { publishStatus: 'rejected' },
    });
  }

  return {
    success: true,
    message: `Producto "${product[nameKey]}" ${action === 'approve' ? 'aprobado' : 'rechazado'}`,
    reviewNotes,
  };
}
