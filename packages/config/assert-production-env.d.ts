export type ProductionRole = "api" | "worker" | "web";

export function assertProductionEnv(
  role: ProductionRole,
  env?: NodeJS.ProcessEnv,
): void;
