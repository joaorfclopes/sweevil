import { config } from 'dotenv';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const port = process.env.FRONTEND_PORT || '3000';
const backendPort = process.env.BACKEND_PORT || '4040';
const child = spawn('npm', ['start'], {
  cwd: resolve(__dirname, '../frontend'),
  stdio: 'inherit',
  env: { ...process.env, PORT: port, BACKEND_PORT: backendPort },
});

child.on('exit', (code) => process.exit(code));
