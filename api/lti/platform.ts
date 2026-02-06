import type { IncomingMessage, ServerResponse } from "http";
import { handlePlatformConfig } from "../../src/lti/handlers";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handlePlatformConfig(req, res);
}
