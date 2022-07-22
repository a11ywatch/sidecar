# sidecar

A11yWatch sidecar for web accessibility testing.

## Getting started

Follow the instructions to get started with nodejs or bun.

1. optional: start `mongodb` on port 27017.
1. optional: start `redis` on 6379.
1. optional: add `**/scripts/*` to .gitignore (auto generated fix scripts for the cdn)

Env variables:

```sh
# unlock all features recommended
process.env.SUPER_MODE = "true";
```

### nodejs

node - v12.0 and up

1. `npm install @a11ywatch/a11ywatch`.

### bun

1. `npm i puppeteer` # issue with chrome installing via bun
1. `bun install @a11ywatch/a11ywatch`.

Use the packages exported methods, use a [client](https://github.com/A11yWatch/a11ywatch/tree/main/clients), or your own handling of request like curl/fetch.

Example below:

```ts
import { scan, multiPageScan } from "@a11ywatch/a11ywatch";

const data = await scan({ url: "https://jeffmendez.com" }); // single page website scan.
console.log(data);
// {
//   data: {
//     userId: undefined,
//     url: 'https://a11ywatch.com',
//     domain: 'a11ywatch.com',
//     cdnConnected: false,
//     pageInsights: false,
//     pageHeaders: [],
//     insight: null,
//     pageLoadTime: {
//       duration: '605',
//       durationFormated: 'Very Fast',
//       color: '#A5D6A7'
//     },
//     issuesInfo: {
//       possibleIssuesFixedByCdn: 0,
//       totalIssues: 161,
//       issuesFixedByCdn: 0,
//       errorCount: 0,
//       warningCount: 161,
//       noticeCount: 0,
//       adaScore: 100,
//       issueMeta: [Object]
//     },
//     lastScanDate: 'Wed, 29 Jun 2022 20:29:30 GMT',
//     online: true,
//     ua: '',
//     mobile: false,
//     standard: 'WCAG2AA',
//     actionsEnabled: false,
//     robots: true,
//     subdomains: false,
//     tld: false,
//     timestamp: 1656534570739,
//     script: null,
//     issues: [
//       [Object], [Object], [Object], [Object], [Object], [Object],
//       [Object], [Object], [Object], [Object], [Object], [Object],
//       [Object], [Object], [Object], [Object], [Object], [Object]
//       ... 81 more items
//     ]
//   },
//   success: true,
//   code: 200,
//   message: 'CRAWLER FINISHED SCAN'
// }

// crawl a website entirely with options to include subdomains and tld. Scan prop defined for streams
// all pages
await multiPageScan({ url: "https://a11ywatch.com" });
// all pages and subdomains
await multiPageScan({
  url: "https://a11ywatch.com",
  subdomains: true,
});
// all pages and tld extensions
await multiPageScan({ url: "https://a11ywatch.com", tld: true });
// all pages, subdomains, and tld extensions
await multiPageScan({
  url: "https://a11ywatch.com",
  subdomains: true,
  tld: true,
});
```

You can also drill in to the specific modules like `@a11ywatch/pagemind` (accessibility service) and etc.

```ts
import { detectImage } from "@a11ywatch/mav/ai/detectImage";

// prediect an image from a base64. You can also pass in a url as the url key.
await detectImage({
  imageBase64:
    "data:image/jpeg;base64,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",
  height: 50,
  width: 50,
});
```

### Docker

Example docker compose configuration:

```yml
version: "3.9"
services:
  a11ywatch:
    image: a11ywatch/a11ywatch
    ports:
      - 3280:3280
```

Start the instance via docker:

```sh
docker run -p 3280:3280 a11ywatch/a11ywatch
# run scan on website if CLI installed after container starts
a11ywatch crawl -u https://a11ywatch.com
```

You can get the [CLI](https://github.com/A11yWatch/a11ywatch/tree/main/cli) with `cargo install a11ywatch_cli` or `npm i a11ywatch-cli -g` to run scans in shell.

View the [documentation](https://docs.a11ywatch.com/documentation/services/) for more information on ports and etc.

## Packages exposed

The following packages can be imported to use directly to extend the A11yWatch suite.

1. `@a11ywatch/core`
1. `@a11ywatch/mav`
1. `@a11ywatch/pagemind`
1. `@a11ywatch/crawler`
1. `@a11ywatch/elastic-cdn`

## Examples

View the [basic example](./examples/basic/) or [bun example](./examples/basic/) for a getting started point.

## Help

If the scan fails initially its most likely due to chrome not being installed or the startup not finishing beforehand.
We are working on adding chrome connection detection to prevent this from happening.

## TODO

1. Keep track and cleanup processes correctly (mainly add way to cleanup crawler service).
1. Add examples how to important certain libs from the sidecar.

## LICENSE

check the license file in the root of the project.
