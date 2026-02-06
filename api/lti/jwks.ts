import type { IncomingMessage, ServerResponse } from "http";
import { handleToolJwks } from "../_lib/handlers";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleToolJwks(req, res);
}
