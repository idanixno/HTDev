import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { createRequire } from "node:module";
import { AppModule } from "./app.module";
import { securityHeadersMiddleware } from "./security/security-headers.middleware";

const requireConfig = createRequire(__filename);
const { assertProductionEnv } = requireConfig(
  "@zharfa/config/assert-production-env",
) as {
  assertProductionEnv: (role: "api" | "worker" | "web") => void;
};

async function bootstrap() {
  assertProductionEnv("api");
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(securityHeadersMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  });
  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`@zharfa/api listening on :${port}`);
}

void bootstrap();
