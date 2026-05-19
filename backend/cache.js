import Redis from 'ioredis';

let redis = null;

function getRedis() {
  if (!redis) {
    if (!process.env.REDIS_URL) return null;
    redis = new Redis(process.env.REDIS_URL, { enableOfflineQueue: false });
    redis.on('error', () => {});
  }
  return redis;
}

export async function cacheGet(key) {
  const r = getRedis();
  if (!r) return null;
  try {
    const val = await r.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds) {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // cache failure is non-fatal
  }
}

export async function cacheDel(...keys) {
  const r = getRedis();
  if (!r) return;
  try {
    await r.del(...keys);
  } catch {
    // cache failure is non-fatal
  }
}
