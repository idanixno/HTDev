import { Queue, Worker, type ConnectionOptions } from "bullmq";
import { createServer } from "node:http";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const healthPort = Number(process.env.WORKER_HEALTH_PORT ?? 4001);

function redisConnection(): ConnectionOptions {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    maxRetriesPerRequest: null,
  };
}

const connection = redisConnection();
const queueName = "zharfa-jobs";

export const jobsQueue = new Queue(queueName, { connection });

const worker = new Worker(
  queueName,
  async (job) => {
    // Foundation stub: real payment verification / SpotPlayer provisioning land in later phases.
    // Never invent success for payments or SpotPlayer licenses here.
    if (job.name === "health-ping") {
      return { ok: true, at: new Date().toISOString() };
    }
    throw new Error(`Unhandled job: ${job.name}`);
  },
  { connection },
);

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message);
});

const server = createServer((req, res) => {
  if (req.url === "/health" || req.url === "/health/") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        service: "worker",
        status: "ok",
        queue: queueName,
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }
  res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(healthPort, () => {
  console.log(`@zharfa/worker health on :${healthPort}; queue=${queueName}`);
});

async function shutdown() {
  await worker.close();
  await jobsQueue.close();
  server.close();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
