import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ContentService } from "./content.service";
import { Lang } from "./lang.decorator";
import {
  toLocalizedPaper,
  type Lang as LangType,
  type PublicPaperListItem,
} from "./content.types";

// Read-only public listing of papers - used by the lesson start UI as a paper picker.
// LOs and questions stay admin-only; users only need to know which papers exist.
//
// Localized: returns single-string fields based on the resolved request language.
@Controller("papers")
@UseGuards(JwtAuthGuard)
export class PublicPapersController {
  constructor(private readonly content: ContentService) {}

  @Get()
  async list(@Lang() lang: LangType): Promise<PublicPaperListItem[]> {
    const [rows, counts] = await Promise.all([
      this.content.listPapers(),
      this.content.activeQuestionCountsByPaper(),
    ]);
    return rows.map((row) => ({
      ...toLocalizedPaper(row, lang),
      active_question_count: counts.get(row.id) ?? 0,
    }));
  }
}
