import { Queue, type ConnectionOptions } from "bullmq";
import {
  ACCESS_PROVISIONING_JOB,
  ZHARFA_JOBS_QUEUE,
  type AccessProvisioningJobData,
} from "./spotplayer.types";

function redisConnection(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    maxRetriesPerRequest: null,
  };
}

let queueSingleton: Queue<AccessProvisioningJobData> | null = null;

export function getAccessProvisioningQueue(): Queue<AccessProvisioningJobData> {
  if (!queueSingleton) {
    queueSingleton = new Queue<AccessProvisioningJobData>(ZHARFA_JOBS_QUEUE, {
      connection: redisConnection(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }
  return queueSingleton;
}

/**
 * Enqueue with jobId = idempotencyKey so duplicate enqueues coalesce.
 * BullMQ rejects duplicate jobId while a job is active/waiting — treat as ok.
 */
export async function enqueueAccessProvisioning(
  data: AccessProvisioningJobData,
): Promise<{ enqueued: boolean; jobId: string }> {
  const queue = getAccessProvisioningQueue();
  try {
    await queue.add(ACCESS_PROVISIONING_JOB, data, {
      jobId: data.idempotencyKey,
    });
    return { enqueued: true, jobId: data.idempotencyKey };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Duplicate job id while pending is expected for idempotent re-queue.
    if (/already exists|JobId/i.test(msg)) {
      return { enqueued: false, jobId: data.idempotencyKey };
    }
    throw err;
  }
}

export async function closeAccessProvisioningQueue(): Promise<void> {
  if (queueSingleton) {
    await queueSingleton.close();
    queueSingleton = null;
  }
}
