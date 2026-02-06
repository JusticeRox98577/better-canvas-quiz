import type { IncomingMessage, ServerResponse } from "http";
import { handleOidcInit } from "../../src/lti/handlers";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleOidcInit(req, res);
}
