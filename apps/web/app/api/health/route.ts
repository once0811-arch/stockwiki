export async function GET(): Promise<Response> {
  return Response.json({
    ok: true,
    phase: 0,
    service: "web",
    adapters: {
      wiki: "fake",
      marketData: "fixture"
    }
  });
}
