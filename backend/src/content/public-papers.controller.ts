import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ContentService } from "./content.service";
import { Lang } from "./lang.decorator";
import { toLocalizedPaper, type Lang as LangType } from "./content.types";

// Read-only public listing of papers - used by the lesson start UI as a paper picker.
// LOs and questions stay admin-only; users only need to know which papers exist.
//
// Localized: returns single-string fields based on the resolved request language.
@Controller("papers")
@UseGuards(JwtAuthGuard)
export class PublicPapersController {
  constructor(private readonly content: ContentService) {}

  @Get()
  async list(@Lang() lang: LangType) {
    const rows = await this.content.listPapers();
    return rows.map((row) => toLocalizedPaper(row, lang));
  }
}
