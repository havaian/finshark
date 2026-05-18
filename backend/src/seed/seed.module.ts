import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { SeedService } from "./seed.service";
import { AdminSeedController } from "./admin-seed.controller";

// Wraps the seed service (used at runtime by the admin "drop & reseed" button)
// and its admin controller. AuthModule is imported for the JwtAuthGuard +
// AdminGuard chain; UsersModule for the user repo the AdminGuard reads under
// the hood (matching the pattern in AdminUsersModule).
//
// The CLI `npm run db:seed` runner (src/seed/seed.ts) is INDEPENDENT of this
// module — it spins up its own postgres client and does not boot Nest, so it
// stays fast for CI and one-off runs.
@Module({
  imports: [AuthModule, UsersModule],
  providers: [SeedService],
  controllers: [AdminSeedController],
})
export class SeedModule {}
