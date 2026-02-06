import type { IncomingMessage, ServerResponse } from "http";
import { handleLaunch } from "../_lib/handlers";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleLaunch(req, res);
}
