/**
 * Textract provider shim.
 * Keeps document-analysis flows operational in dev when AWS wiring is not configured.
 */
export async function extractDataFromDocument(_blob: Blob): Promise<{ Blocks: Array<Record<string, unknown>> }> {
  // Return an empty Textract-like payload until AWS integration is enabled.
  return { Blocks: [] };
}
