// TODO: configure envs proper via docker
process.env.GRPC_HOST_PAGEMIND = "127.0.0.1:50052";
process.env.GRPC_HOST_MAV = "127.0.0.1:50053";
process.env.GRPC_HOST_CRAWLER = "127.0.0.1:50055";
process.env.GRPC_HOST_CDN = "127.0.0.1:50054";

import "@a11ywatch/elastic-cdn";
import "@a11ywatch/mav";
import "@a11ywatch/pagemind";
import "@a11ywatch/crawler";
import "@a11ywatch/core";
import { crawlWebsite } from "@a11ywatch/pagemind/core/controllers";
import { crawlMultiSiteWithEvent } from "@a11ywatch/core/core/utils"; // rename core double mapping

console.log("starting a11ywatch please wait...");

/*
 * A11yWatch SideCar
 * export nice utility functions upfront.
 * This sidecar starts the A11yWatch suite on the machine and exports varius commands.
 * All commands from the packages can be imported and used directly or handled,
 * via the methods gRPC, RESt, or graphQl.
 */

// single page website scan
async function scan(props) {
  try {
    return await crawlWebsite({ noStore: true, ...props }); // a lot of props to fill so ignoring ts
  } catch (e) {
    console.error(e);
  }
}

// multi page website scan. [Does not work without mongodb enabled at the moment].
async function multiPageScan(props) {
  try {
    return await crawlMultiSiteWithEvent({ scan: false, ...props });
  } catch (e) {
    console.error(e);
  }
}

export { scan, multiPageScan };
