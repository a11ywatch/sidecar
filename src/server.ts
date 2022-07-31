import { scanWebsite } from "@a11ywatch/core/core/actions/crawl/scan";
import { crawlMultiSiteWithEvent as scanMulti } from "@a11ywatch/core/core/utils"; // rename core double mapping
import { client, initDbConnection } from "@a11ywatch/core/database/client";
import { isReady } from "@a11ywatch/core/app";
import { wsChromeEndpointurl } from "@a11ywatch/pagemind/config/chrome";

let startedApp = false;
const production = process.env.NODE_ENV === "production";

// detect if the suite is ready across all services.
// @returns Promise<boolean>
const appReady = async () => {
  await isReady();
  return new Promise((resolve) => {
    if (wsChromeEndpointurl) {
      resolve(true);
    } else {
      const checkChrome = setInterval(() => {
        // wait till value exists
        if (wsChromeEndpointurl) {
          clearInterval(checkChrome);
          resolve(true);
        }
      }, 10);
    }
  });
};

// prevent re-starting the application on re-imports
const initApplication = async () => {
  if (!startedApp) {
    !production && console.log("starting a11ywatch...");
    await import("@a11ywatch/elastic-cdn");
    await import("@a11ywatch/mav");
    await import("@a11ywatch/pagemind");
    await import("@a11ywatch/crawler");
    await import("@a11ywatch/core");

    // if mongodb not connected use memory client
    setTimeout(async () => {
      if (!client?.isConnected()) {
        !production && console.log("creating MongoDb memory server...");
        let dbUrl = "mongodb://mongodb:27017/";

        try {
          const { MongoMemoryServer } = await import("mongodb-memory-server");
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
          await initDbConnection(dbUrl);
          !production && console.log("connected to memory mongodb.");
        } catch (e) {
          console.error(e);
          console.log(`Please check your node version or add the following before startup on node v18.4.0 and up
            import { TextEncoder, TextDecoder } from "util";

            global.TextEncoder = TextEncoder;
            global.TextDecoder = TextDecoder;
          `);
        }
      }
    }, 250);

    startedApp = true;
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
    // wait till scan is ready
    await appReady();

    return await scanWebsite({ noStore: true, ...props }); // a lot of props to fill so ignoring ts
  } catch (e) {
    console.error(e);
  }
}

// single page website scan
async function multiPageScan(props) {
  try {
    // wait till scan is ready
    await appReady();

    return await scanMulti({ scan: false, ...props }); // a lot of props to fill so ignoring ts
  } catch (e) {
    console.error(e);
  }
}

export { scan, multiPageScan, initApplication, appReady };
