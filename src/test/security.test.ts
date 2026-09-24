import { describe, expect, it } from "vitest";
import { PayloadTooLargeError, readJsonWithinLimit } from "@/lib/security";

describe("bounded vote requests", () => {
  it("accepts a normal JSON request", async () => {
    const request = new Request("http://localhost/api/vote", {
      method: "PUT",
      body: JSON.stringify({ name: "Taylor" }),
    });

    await expect(readJsonWithinLimit(request, 1024)).resolves.toEqual({ name: "Taylor" });
  });

  it("rejects a streamed body even without Content-Length", async () => {
    const request = new Request("http://localhost/api/vote", {
      method: "PUT",
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(2048));
          controller.close();
        },
      }),
      // Node requires duplex for streamed request bodies.
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    await expect(readJsonWithinLimit(request, 1024)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });
});
