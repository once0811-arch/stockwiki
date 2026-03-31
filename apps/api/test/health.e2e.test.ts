import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("api health e2e placeholder", () => {
  it("responds from /health", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect(({ body }: { body: { ok: boolean; service: string } }) => {
        expect(body.ok).toBe(true);
        expect(body.service).toBe("api");
      });

    await app.close();
  });
});
