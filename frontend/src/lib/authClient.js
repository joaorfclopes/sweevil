import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000',
  plugins: [passkeyClient()],
});
