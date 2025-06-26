import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/main"; // main.ts ต้อง export createApp เท่านั้น!
import { NestFastifyApplication } from "@nestjs/platform-fastify";

let app: NestFastifyApplication;

beforeAll(async () => {
  app = await createApp();
  await app.init(); // ✅ สำคัญมาก
});

afterAll(async () => {
  await app.close();
});

describe("Root route", () => {
  test("should return welcome message", async () => {
    const res = await request(app.getHttpAdapter().getInstance().server).get(
      "/",
    );
    expect(res.status).toBe(200);
    expect(res.text).toBe("welcome to expressTS");
  });
});
