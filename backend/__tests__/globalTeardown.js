import { unlinkSync } from 'fs';

export default async function globalTeardown() {
  if (global.__MONGOSERVER__) {
    await global.__MONGOSERVER__.stop();
  }
  try {
    unlinkSync('/tmp/jest-mongo-config.json');
  } catch {}
}
