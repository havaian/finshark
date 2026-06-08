import { Injectable, NotFoundException } from "@nestjs/common";
import { PaymentCardsRepository } from "./payment-cards.repository";
import type { AdminPaymentCard } from "./payment.types";
import { toAdminPaymentCard } from "./payment.types";

// Admin CRUD for receiving cards. Thin wrapper over the repository that maps
// rows to the admin DTO and turns "not found" into a 404.
@Injectable()
export class PaymentCardsAdminService {
  constructor(private readonly cards: PaymentCardsRepository) {}

  async list(): Promise<AdminPaymentCard[]> {
    const rows = await this.cards.findAll();
    return rows.map(toAdminPaymentCard);
  }

  async create(input: {
    card_number: string;
    holder_name: string;
    bank_label: string | null;
    is_active: boolean;
    sort_order: number;
  }): Promise<AdminPaymentCard> {
    const row = await this.cards.create(input);
    return toAdminPaymentCard(row);
  }

  async update(
    id: string,
    patch: {
      card_number?: string;
      holder_name?: string;
      bank_label?: string | null;
      is_active?: boolean;
      sort_order?: number;
    }
  ): Promise<AdminPaymentCard> {
    const row = await this.cards.update(id, patch);
    if (!row) throw new NotFoundException("card not found");
    return toAdminPaymentCard(row);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const ok = await this.cards.remove(id);
    if (!ok) throw new NotFoundException("card not found");
    return { deleted: true };
  }
}
