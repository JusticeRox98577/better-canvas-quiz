import type { IncomingMessage, ServerResponse } from "http";
import { handleToolConfig } from "../_lib/handlers";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleToolConfig(req, res);
}
