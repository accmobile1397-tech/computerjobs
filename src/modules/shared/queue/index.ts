import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

export const defaultQueue = new Queue("computerjobs-default", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export function getQueueConnection() {
  return connection;
}
