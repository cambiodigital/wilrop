import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const prismaBin = path.join(root, 'node_modules', 'prisma', 'build', 'index.js');
const serverPath = path.join(root, '.next', 'standalone', 'server.js');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function main() {
  if (process.env.DATABASE_URL) {
    console.log('[deploy] Applying Prisma migrations before starting the app...');
    await run(process.execPath, [prismaBin, 'migrate', 'deploy']);
  } else {
    console.log('[deploy] DATABASE_URL is not set; skipping Prisma migrations.');
  }

  const target = existsSync(serverPath) ? serverPath : path.join(root, 'server.js');
  if (!existsSync(target)) {
    throw new Error(
      `Next standalone server was not found at ${serverPath}. Run the production build before starting.`,
    );
  }

  console.log(`[web] Starting Next.js server: ${target}`);

  const child = spawn(process.execPath, [target], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
      PORT: process.env.PORT || '3000',
    },
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error('[deploy] Startup failed:', error);
  process.exit(1);
});
