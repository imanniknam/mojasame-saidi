import { jsonNoStore } from "@/lib/server/api-response";

export function GET() {
  return jsonNoStore({
    ok: true,
    service: "mojasame-saidi",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
}
