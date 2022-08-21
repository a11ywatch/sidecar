import { scanWebsite } from "@a11ywatch/core/core/actions/crawl/scan";
import { crawlMultiSiteWithEvent } from "@a11ywatch/core/core/utils";
import { connected, initDbConnection } from "@a11ywatch/core/database/client";
import { isReady } from "@a11ywatch/core/app";
import { wsChromeEndpointurl } from "@a11ywatch/pagemind/config/chrome";

const production = process.env.NODE_ENV === "production";
let startedApp = false; // app ready to go!

// detect if the suite is ready across all services.
// @returns Promise<boolean>
const appReady = async () => {
  await isReady();
  return new Promise((resolve) => {
    if (wsChromeEndpointurl && startedApp) {
      resolve(true);
    } else {
      // TODO: bind to event emit
      const checkChrome = setInterval(() => {
        // wait till value exists
        if (wsChromeEndpointurl && startedApp) {
          clearInterval(checkChrome);
          resolve(true);
        }
      }, 4);
    }
  });
};

// prevent re-starting the application on re-imports
const initApplication = async () => {
  if (!startedApp) {
    !production && console.log("starting a11ywatch...");

    // cdn
    try {
      await import("@a11ywatch/elastic-cdn");
    } catch (e) {
      console.error(e);
    }

    // ai
    try {
      await import("@a11ywatch/mav");
    } catch (e) {
      console.error(e);
    }

    // a11y
    try {
      await import("@a11ywatch/pagemind");
    } catch (e) {
      console.error(e);
    }

    // crawler
    try {
      await import("@a11ywatch/crawler");
    } catch (e) {
      console.error(e);
    }

    // core
    try {
      await import("@a11ywatch/core");
    } catch (e) {
      console.error(e);
    }

    // mongodb already connected
    if (connected) {
      startedApp = true;
    } else {
      // if mongodb not connected use memory client
      setTimeout(async () => {
        if (!connected) {
          !production && console.log("creating MongoDb memory server...");
          let dbUrl = "mongodb://mongodb:27017/";

          try {
            const { MongoMemoryServer } = await import("mongodb-memory-server");
            const mongod = await MongoMemoryServer.create({
              instance: {
                port: 27017,
                ip: "127.0.0.1",
                dbName: "a11ywatch",
              },
            });
            if (mongod) {
              dbUrl = mongod?.getUri();
            }
            await initDbConnection(dbUrl);
            !production && console.log("connected to memory mongodb.");
          } catch (e) {
            console.error(`MongoDBMemory Error: Please check your node version or add the following before startup on node v18.4.0 and up
              import { TextEncoder, TextDecoder } from "util";
  
              global.TextEncoder = TextEncoder;
              global.TextDecoder = TextDecoder;
            `);
          }

          startedApp = true;
        }
      }, 45);
    }
  }
};

// auto init the suite.
if (process.env.A11YWATCH_AUTO_START != "false") {
  initApplication();
}

/*
 * A11yWatch Sidecar
 * export nice utility functions upfront.
 */

// single page website scan
async function scan(params: Parameters<typeof scanWebsite>[0]) {
  try {
    await appReady();
    return await scanWebsite({ noStore: true, ...params });
  } catch (e) {
    console.error(e);
  }
}

// multi page website scan
async function multiPageScan(
  params: Parameters<typeof crawlMultiSiteWithEvent>[0]
) {
  try {
    await appReady();
    return await crawlMultiSiteWithEvent(params);
  } catch (e) {
    console.error(e);
  }
}

export { scan, multiPageScan, initApplication, appReady };
