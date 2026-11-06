import {
  getAccessProvisioningQueue,
} from "./provisioning-queue";
import type { AccessProvisioningJobData } from "./spotplayer.types";
import { ACCESS_PROVISIONING_JOB } from "./spotplayer.types";

/** Enqueue with an explicit jobId (used for admin retries after a prior job completed). */
export async function enqueueWithJobId(
  jobId: string,
  data: AccessProvisioningJobData,
): Promise<void> {
  const queue = getAccessProvisioningQueue();
  await queue.add(ACCESS_PROVISIONING_JOB, data, { jobId });
}
