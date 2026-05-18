// Load .env BEFORE any class decorator evaluates env vars (e.g. @Cron(process.env.REMINDER_CRON)).
// ConfigModule.forRoot loads .env too, but it runs after class-loading, which is too late
// for decorator arguments. dotenv here is harmless if it's loaded twice.
import "dotenv/config";

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsOrigin =
    config.get<string>("CORS_ORIGIN") ?? "http://localhost:5173";
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown props
      forbidNonWhitelisted: true, // 400 on unknown props
      transform: true, // turn payloads into DTO instances
      transformOptions: { enableImplicitConversion: false },
    })
  );

  const port = config.get<number>("PORT") ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}/api`);
}

bootstrap();
