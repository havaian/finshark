import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres, { Sql } from 'postgres';

// Injection token for the postgres.js Sql client.
// Import this where you need raw SQL access:
//   constructor(@Inject(PG) private readonly sql: Sql) {}
export const PG = Symbol('PG');

@Global()
@Module({
  providers: [
    {
      provide: PG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Sql => {
        const url = config.get<string>('DATABASE_URL');
        if (!url) {
          throw new Error('DATABASE_URL is not set');
        }
        return postgres(url, {
          // Keep defaults sensible; tune later under load.
          max: 10,
          idle_timeout: 30,
        });
      },
    },
  ],
  exports: [PG],
})
export class DbModule {}
