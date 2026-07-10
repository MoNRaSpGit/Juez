import { describe, expect, it } from "vitest";
import { FRONTEND_BUILD_INFO } from "../config/build";

describe("frontend-juez smoke", () => {
  it("exposes frontend build info", () => {
    expect(FRONTEND_BUILD_INFO.version).toBeTruthy();
    expect(FRONTEND_BUILD_INFO.releaseSha).toBeTruthy();
  });
});
