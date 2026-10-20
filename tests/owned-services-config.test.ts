import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isLegacyHarborUrl } from "../src/lib/config/owned-services";
import { resolveServiceBase } from "../src/lib/config/service-url";

describe("owned service URL configuration", () => {
  it("preserves valid custom HTTP(S) origins and paths", () => {
    assert.equal(
      resolveServiceBase(" https://api.example.test/v2/ ", "https://owned.test"),
      "https://api.example.test/v2",
    );
    assert.equal(resolveServiceBase("http://localhost:8080/", "https://owned.test"), "http://localhost:8080");
  });

  it("rejects unsafe or malformed custom endpoint values", () => {
    for (const value of [
      "javascript:alert(1)",
      "//api.example.test",
      "https://user:pass@api.example.test",
      "https://api.example.test/?token=x",
      "not a URL",
    ]) {
      assert.equal(resolveServiceBase(value, "https://owned.test"), "https://owned.test");
    }
  });

  it("replaces former Harbor-owned host overrides with the owned base", () => {
    for (const value of ["https://harbor.site", "https://sync.harbor.site/api"]) {
      assert.equal(resolveServiceBase(value, "https://owned.test"), "https://owned.test");
    }
    assert.equal(
      resolveServiceBase("https://customharbor.site.evil/api", "https://owned.test"),
      "https://customharbor.site.evil/api",
    );
  });

  it("recognizes only the former Harbor domain and its actual subdomains", () => {
    assert.equal(isLegacyHarborUrl("https://harbor.site/path"), true);
    assert.equal(isLegacyHarborUrl("https://sync.harbor.site/path"), true);
    assert.equal(isLegacyHarborUrl("https://customharbor.site.evil/path"), false);
    assert.equal(isLegacyHarborUrl("https://harbor.site.example/path"), false);
    assert.equal(isLegacyHarborUrl("not a URL"), false);
  });
});
