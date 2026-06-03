import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersRepository } from "./users.repository";

// On boot, if BOOTSTRAP_ADMIN_EMAIL is set AND a user with that email exists,
// promote them to admin (idempotent - does nothing if they're already admin).
// If the user doesn't exist yet, we just log and skip; the next boot after they
// register will pick them up.
//
// This is intentionally one-way (only promotes, never demotes). Demoting a
// bootstrap admin is a separate flow - done from the admin users page by another admin.
@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly log = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly users: UsersRepository,
    private readonly config: ConfigService
  ) {}

  async onModuleInit(): Promise<void> {
    const email = (
      this.config.get<string>("BOOTSTRAP_ADMIN_EMAIL") ?? ""
    ).trim();
    if (!email) return; // not configured; do nothing

    try {
      const user = await this.users.findByEmail(email);
      if (!user) {
        this.log.log(
          `BOOTSTRAP_ADMIN_EMAIL is set to "${email}" but no user with that email exists yet. They will be promoted automatically once they sign in for the first time and the server restarts (or you can promote them from the admin users page).`
        );
        return;
      }
      if (user.is_admin) {
        this.log.log(`bootstrap admin "${email}" already has admin rights`);
        return;
      }
      await this.users.setAdmin(user.id, true);
      this.log.log(`promoted "${email}" to admin via BOOTSTRAP_ADMIN_EMAIL`);
    } catch (e) {
      this.log.error(
        `failed to apply BOOTSTRAP_ADMIN_EMAIL: ${(e as Error).message}`
      );
      // Don't crash startup - admin can be set manually via SQL as fallback.
    }
  }
}
