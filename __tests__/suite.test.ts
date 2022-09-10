// import { TextEncoder, TextDecoder } from "util";
// // jest setup for node v14.18.3
// global.TextEncoder = TextEncoder;
// // @ts-ignore
// global.TextDecoder = TextDecoder;

jest.setTimeout(120000);

const noop = () => {};

const _log = (() => {
  if (process.env.DEBUG) {
    return console;
  }
  return { info: noop, log: noop, error: noop, warn: noop };
})();

describe("suite", () => {
  const email = "myemail@gmail.com"; // test auth email
  const password = "mypass"; // test auth password

  // can scan a single website using enhanced scan
  test("starts the server properly and run single page scan", async () => {
    const { scan } = await import("../src/server");

    const results = await scan({ url: "https://a11ywatch.com" });

    expect(results.data).toBeTruthy();
  });

  // can register a user into the app
  test("can register via email", async () => {
    const { appReady } = await import("../src/server");

    const { UsersController } = await import(
      "@a11ywatch/core/core/controllers"
    );

    await appReady();

    const data = await UsersController().createUser({
      email,
      password,
    });

    expect(data.email).toEqual(email);
    expect(data.password).not.toEqual(password); // password is hashed!!
  });

  // can sign on a user into the app
  test("can login via email", async () => {
    const { appReady } = await import("../src/server");

    const { UsersController } = await import(
      "@a11ywatch/core/core/controllers"
    );

    await appReady();

    const data = await UsersController().verifyUser({
      email,
      password,
    });

    expect(data.email).toEqual(email);
    expect(data.password).not.toEqual(password); // password is hashed!!
  });

  // can run authenticated multi page crawl by user id
  test("can multi page crawl by user", async () => {
    const { appReady, multiPageScan, crawlList } = await import(
      "../src/server"
    );

    await appReady();

    const { UsersController } = await import(
      "@a11ywatch/core/core/controllers"
    );

    const data = await UsersController().verifyUser({
      email,
      password,
    });

    await multiPageScan(
      {
        url: "https://a11ywatch.com",
        userId: data.id,
      },
      ({ data }) => {
        const issuesCount = data.issues.filter(
          (issue) => issue.type === "error"
        ).length;
        _log.info(`${data.url}: ${data.issues.length}`);
        expect(issuesCount).toBeLessThan(30);
      }
    );

    const pageList = [
      "https://a11ywatch.com",
      "https://a11ywatch.com/website-accessibility-checker",
      "https://a11ywatch.com/faq",
      "https://a11ywatch.com/contact",
      "https://a11ywatch.com/terms-of-service",
      "https://a11ywatch.com/inactivity-policy",
      "https://a11ywatch.com/register",
      "https://b.com",
    ];

    const pages = await crawlList({
      pages: pageList,
      userId: 0,
    });

    expect(pages.length).toBe(pageList.length);
  });
});
