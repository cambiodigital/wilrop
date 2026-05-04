import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = 'admin@wilrop.com';
const DEFAULT_ADMIN_NAME = 'Administrador WILROP';

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isEnabled(value) {
  return ['1', 'true', 'yes', 'si'].includes(String(value ?? '').trim().toLowerCase());
}

async function main() {
  const email = normalizeEmail(process.env.WILROP_ADMIN_EMAIL) || DEFAULT_ADMIN_EMAIL;
  const password = process.env.WILROP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  const name = process.env.WILROP_ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME;
  const shouldResetPassword = isEnabled(process.env.WILROP_ADMIN_RESET_PASSWORD);

  if (!password) {
    const existingAdmins = await db.admin.count();
    if (existingAdmins === 0) {
      console.log('[admin] No admin exists, but WILROP_ADMIN_PASSWORD is not configured. Skipping admin bootstrap.');
    } else {
      console.log('[admin] Admin bootstrap skipped; WILROP_ADMIN_PASSWORD is not configured.');
    }
    return;
  }

  const existingAdmin = await db.admin.findUnique({ where: { email } });

  if (!existingAdmin) {
    await db.admin.create({
      data: {
        email,
        password,
        name,
        role: 'admin',
      },
    });
    console.log(`[admin] Admin account ensured for ${email}.`);
    return;
  }

  if (shouldResetPassword) {
    await db.admin.update({
      where: { email },
      data: { password, name },
    });
    console.log(`[admin] Admin account password reset for ${email}.`);
    return;
  }

  console.log(`[admin] Admin account already exists for ${email}; password unchanged.`);
}

main()
  .catch((error) => {
    console.error('[admin] Failed to ensure admin account:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
