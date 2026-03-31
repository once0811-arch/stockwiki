import { describe, expect, it } from "vitest";
import { GET as getHealth } from "../app/api/health/route";
import { GET as getSmoke } from "../app/api/smoke/route";

describe("web phase 0 routes", () => {
  it("returns ok health payload", async () => {
    const response = await getHealth();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      service: "web"
    });
  });

  it("returns smoke payload", async () => {
    const response = await getSmoke();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      smoke: true
    });
  });
});
