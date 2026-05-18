// Run a promise with a hard timeout. Throws if not settled in time.
// We don't cancel the underlying request — fetch in newer Node supports AbortSignal,
// and both providers below pass it. This helper is the belt to that suspenders.
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// Parse a JSON verdict from raw model output. Models sometimes wrap in ```json fences
// or include preamble despite the prompt; strip and try harder before giving up.
export function parseVerdict(raw: string): {
  is_correct: boolean;
  confidence: number;
  reasoning: string;
} {
  const cleaned = raw
    .replace(/```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // If there's preamble, find the first { and last } and try that.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const jsonStr =
    firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

  const parsed = JSON.parse(jsonStr) as {
    is_correct?: unknown;
    confidence?: unknown;
    reasoning?: unknown;
  };

  if (typeof parsed.is_correct !== "boolean") {
    throw new Error("grader response: is_correct missing or not boolean");
  }
  const confidence =
    typeof parsed.confidence === "number" &&
    parsed.confidence >= 0 &&
    parsed.confidence <= 1
      ? parsed.confidence
      : 0.5; // tolerant fallback
  const reasoning =
    typeof parsed.reasoning === "string" ? parsed.reasoning : "";

  return {
    is_correct: parsed.is_correct,
    confidence,
    reasoning,
  };
}
