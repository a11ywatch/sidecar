// TODO: configure envs proper via docker
process.env.GRPC_HOST_PAGEMIND =
  process.env.GRPC_HOST_PAGEMIND || "127.0.0.1:50052";
process.env.GRPC_HOST_MAV = process.env.GRPC_HOST_MAV || "127.0.0.1:50053";
process.env.GRPC_HOST_CRAWLER =
  process.env.GRPC_HOST_CRAWLER || "127.0.0.1:50055";
process.env.GRPC_HOST_CDN = process.env.GRPC_HOST_CDN || "127.0.0.1:50054";
process.env.SUPER_MODE = process.env.SUPER_MODE || "true";

import { scanWebsite } from "@a11ywatch/core/core/actions/crawl/scan";
import { crawlMultiSiteWithEvent as multiPageScan } from "@a11ywatch/core/core/utils"; // rename core double mapping
import { client, initDbConnection } from "@a11ywatch/core/database/client";

let startedApp = false;

const initApplication = async () => {
  if (!startedApp) {
    console.log("starting a11ywatch...");
    await import("@a11ywatch/elastic-cdn");
    await import("@a11ywatch/mav");
    await import("@a11ywatch/pagemind");
    await import("@a11ywatch/crawler");
    await import("@a11ywatch/core");

    // if mongodb not connected use memory client
    setTimeout(async () => {
      if (!client?.isConnected()) {
        console.log("creating MongoDb memory server...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        let dbUrl = "mongodb://mongodb:27017/";
        try {
          const mongod = await MongoMemoryServer.create({
            instance: {
              port: 27017, // by default choose any free port
              ip: "127.0.0.1", // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
              dbName: "a11ywatch",
            },
          });
          if (mongod) {
            dbUrl = mongod?.getUri();
          }
        } catch (e) {
          console.error(e);
        }

        // @ts-ignore
        await initDbConnection(dbUrl);
        console.log("connected to memory mongodb.");
      }
    }, 250);
  }
};

// auto init the suite.
if (process.env.A11YWATCH_AUTO_START != "false") {
  initApplication();
}

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
    return await scanWebsite({ noStore: true, ...props }); // a lot of props to fill so ignoring ts
  } catch (e) {
    console.error(e);
  }
}

export { scan, multiPageScan, initApplication };
