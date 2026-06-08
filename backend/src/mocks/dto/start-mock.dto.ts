import { IsString } from "class-validator";

// POST /mocks - start a mock session for a given paper.
//
// A mock is now fully defined by the paper's exam_structure (sections,
// question counts, marks, duration), so the request carries ONLY the paper.
// The old question_count / time_limit_seconds inputs are gone: a real ACCA
// exam has a fixed format, not a user-chosen length. The engine reads the
// structure from the paper and builds the session to match it.
export class StartMockDto {
  @IsString()
  paper_id!: string;
}
