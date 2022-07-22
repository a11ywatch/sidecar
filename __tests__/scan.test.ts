import { TextEncoder, TextDecoder } from "util";

// jest setup for node v14.18.3
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

jest.setTimeout(30000);

describe("suite", () => {
  beforeAll(() => {
    process.env.SUPER_MODE = "true";
  });

  test("starts the server properly", async (done) => {
    const { scan } = await import("../src/server");

    const data = await scan({ url: "https://jeffmendez.com" });

    await expect(data).toBeTruthy();

    done();
  });
});
