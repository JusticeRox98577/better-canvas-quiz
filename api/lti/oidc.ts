import type { IncomingMessage, ServerResponse } from "http";
import { handleOidcInit } from "../_lib/handlers.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleOidcInit(req, res);
}
