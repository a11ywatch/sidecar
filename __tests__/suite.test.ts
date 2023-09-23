// import { TextEncoder, TextDecoder } from "util";
// // jest setup for node v14.18.3
// global.TextEncoder = TextEncoder;
// // @ts-ignore
// global.TextDecoder = TextDecoder;

import { scan, appReady, multiPageScan, crawlList } from "../src/server";
import { crawlWebsiteStream } from "../src/client";

jest.setTimeout(300000);

describe("suite", () => {
  // can scan a single website using enhanced scan
  test("starts the server properly and run single page scan", () => {
    scan({ url: "https://a11ywatch.com" }).then((results) => {
      expect(results.data).toBeTruthy();
    });
  });

  // can run authenticated multi page crawl by user id
  test("can multi page crawl by user", () => {
    appReady().then(() => {
      multiPageScan(
        {
          url: "https://a11ywatch.com",
          userId: 1,
        },
        ({ data }) => {
          const issuesCount = data.issues.filter(
            (issue) => issue.type === "error"
          ).length;
          expect(issuesCount).toBeLessThan(30);
        }
      );
    });
  });

  test("can multi page crawl a list of urls", () => {
    appReady().then(() => {
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

      crawlList({
        pages: pageList,
        userId: 0,
      }).then((pages) => {
        expect(pages.length).toBe(pageList.length);
      });
    });
  });

  test("can multi page crawl with the client", () => {
    appReady().then(async () => {
      const data = await crawlWebsiteStream(
        {
          url: "https://jeffmendez.com",
        }
      );

      const issuesCount = data.issues.filter(
        (issue) => issue.type === "error"
      ).length;
      
      expect(issuesCount).toBeLessThan(30);
    });
  });
});
