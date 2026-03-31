export async function GET(): Promise<Response> {
  return Response.json({
    ok: true,
    smoke: true,
    service: "web",
    scope: "phase-0-bootstrap"
  });
}
