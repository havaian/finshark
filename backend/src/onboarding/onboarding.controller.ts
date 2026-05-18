import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/auth.service';
import { OnboardingService } from './onboarding.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  // Used by the frontend route guard to decide whether to redirect the user
  // to the wizard. Returns the user's current onboarding values too so the
  // wizard could pre-fill them on re-visits (not exposed in UI yet).
  @Get('status')
  status(@CurrentUser() current: AccessTokenPayload) {
    return this.onboarding.getStatus(current.sub);
  }

  // Submits onboarding answers. Empty body = "skip" path (just stamps
  // onboarded_at without changing any preferences). Returns the updated
  // PublicUser so the frontend can update its auth store directly.
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() current: AccessTokenPayload, @Body() dto: CompleteOnboardingDto) {
    return this.onboarding.complete(current.sub, dto);
  }
}
