type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs?: number;
}): boolean {
  const windowMs = params.windowMs ?? 60_000;
  const now = Date.now();
  const bucket = buckets.get(params.key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= params.limit) {
    buckets.set(params.key, bucket);
    return false;
  }
  bucket.timestamps.push(now);
  buckets.set(params.key, bucket);
  return true;
}
