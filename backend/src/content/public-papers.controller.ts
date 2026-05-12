import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentService } from './content.service';

// Read-only public listing of papers — used by the lesson start UI as a paper picker.
// LOs and questions stay admin-only; users only need to know which papers exist.
@Controller('papers')
@UseGuards(JwtAuthGuard)
export class PublicPapersController {
  constructor(private readonly content: ContentService) {}

  @Get()
  list() {
    return this.content.listPapers();
  }
}
