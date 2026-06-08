import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import postgres, { Sql } from "postgres";

// Injection token for the postgres.js Sql client.
// Import this where you need raw SQL access:
//   constructor(@Inject(PG) private readonly sql: Sql) {}
export const PG = Symbol("PG");

@Global()
@Module({
  providers: [
    {
      provide: PG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Sql => {
        const url = config.get<string>("DATABASE_URL");
        if (!url) {
          throw new Error("DATABASE_URL is not set");
        }
        // Pool sizing is env-tunable so it can be adjusted under real load
        // without a code change / redeploy. Defaults match the previous
        // hard-coded values (max 10 connections, 30s idle timeout), so
        // behaviour is unchanged unless the env vars are set.
        //   PG_POOL_MAX     - max concurrent connections in the pool
        //   PG_IDLE_TIMEOUT - seconds an idle connection is kept before close
        // ConfigService returns env vars as strings, so parse explicitly and
        // fall back to the default on missing/NaN values.
        const parseIntEnv = (key: string, fallback: number): number => {
          const raw = config.get<string>(key);
          const n = raw === undefined ? NaN : parseInt(raw, 10);
          return Number.isFinite(n) && n > 0 ? n : fallback;
        };
        const max = parseIntEnv("PG_POOL_MAX", 10);
        const idle_timeout = parseIntEnv("PG_IDLE_TIMEOUT", 30);
        return postgres(url, {
          max,
          idle_timeout,
        });
      },
    },
  ],
  exports: [PG],
})
export class DbModule {}
