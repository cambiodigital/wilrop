import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');
const standaloneNodeModulesDir = path.join(standaloneDir, 'node_modules');

if (!existsSync(standaloneDir)) {
  console.log('Standalone output not found; skipping asset copy.');
  process.exit(0);
}

await mkdir(path.join(standaloneDir, '.next'), { recursive: true });

await cp(
  path.join(root, '.next', 'static'),
  path.join(standaloneDir, '.next', 'static'),
  { recursive: true, force: true }
);

await cp(path.join(root, 'public'), path.join(standaloneDir, 'public'), {
  recursive: true,
  force: true,
});

if (existsSync(standaloneNodeModulesDir)) {
  const prismaClientDir = path.join(root, 'node_modules', '.prisma');
  const prismaPackageDir = path.join(root, 'node_modules', '@prisma');

  if (existsSync(prismaClientDir)) {
    await cp(prismaClientDir, path.join(standaloneNodeModulesDir, '.prisma'), {
      recursive: true,
      force: true,
    });
  }

  if (existsSync(prismaPackageDir)) {
    await cp(prismaPackageDir, path.join(standaloneNodeModulesDir, '@prisma'), {
      recursive: true,
      force: true,
    });
  }
}

if (existsSync(path.join(root, 'prisma'))) {
  await cp(path.join(root, 'prisma'), path.join(standaloneDir, 'prisma'), {
    recursive: true,
    force: true,
  });
}

console.log('Standalone assets copied.');
