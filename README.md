# a11ywatch_sidecar

The A11yWatch system installed as a sidecar via npm [experimental].

## Getting started

1. `npm install @a11ywatch/a11ywatch`.
1. start `mongodb` on port 27017 locally [if not a memory db of mongodb starts].
1. start `redis` on 6379 locally.
1. import at the top of your app like this `require("@a11ywatch/a11ywatch");`.
1. make direct calls from the imports or make request with one of the [clients](https://github.com/A11yWatch/a11ywatch/tree/main/clients).

Example output.

```sh
gRPC server running at http://127.0.0.1:50051
gRPC server running at http://127.0.0.1:50052
gRPC server running at http://127.0.0.1:50053
gRPC server running at http://127.0.0.1:50054
gRPC server running at http://127.0.0.1:50055
```

You should see the REST server up on http://localhost:8080/.

Example of importing commands directly.

```ts
import { scan, multiPageScan } from "@a11ywatch/a11ywatch";

// wait about 5 seconds for server to start until async handles for isReady exported.
const data = await scan({ url: "https://a11ywatch.com" }); // single page website scan.
console.log(data);
// {
//   webPage: {
//     domain: 'a11ywatch.com',
//     url: 'https://a11ywatch.com',
//     cdnConnected: false,
//     pageLoadTime: { duration: 512, durationFormated: 'Very Fast', color: '#A5D6A7' },
//     insight: undefined,
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
//     lastScanDate: 'Wed, 29 Jun 2022 13:47:09 GMT'
//   },
//   issues: {
//     documentTitle: 'A11yWatch: the all around web accessibility tool.',
//     pageUrl: 'https://a11ywatch.com',
//     issues: [
//       [Object], [Object], [Object], [Object], [Object], [Object],
//       [Object], [Object], [Object], [Object], [Object], [Object],
//       [Object], [Object], [Object], [Object],
//       ... 61 more items
//     ],
//     domain: 'a11ywatch.com'
//   },
//   script: null,
//   userId: 0
// }

// or crawl a website entirely with options to include subdomains and tld. Requires mongodb enabled at the moment.
// all pages
await multiPageScan({ url: "https://a11ywatch.com" });
// all pages and subdomains
await multiPageScan({ url: "https://a11ywatch.com", subdomains: true });
// all pages and tld extensions
await multiPageScan({ url: "https://a11ywatch.com", tld: true });
// all pages, subdomains, and tld extensions
await multiPageScan({
  url: "https://a11ywatch.com",
  subdomains: true,
  tld: true,
});
```

Import the A11ywatch module.

```ts
import { a11ywatch } from "@a11ywatch/a11ywatch";

// follow the repos or docs to get more info on methods to call.
console.log(a11ywatch);
```

## TODO

1. keep track and cleanup processes correctly (mainly add way to cleanup crawler service).

## LICENSE

check the license file in the root of the project.
