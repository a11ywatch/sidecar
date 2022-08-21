import { scanWebsite } from "@a11ywatch/core/core/actions/crawl/scan";
import {
  crawlMultiSiteWithEvent,
  domainName,
  getHostName,
} from "@a11ywatch/core/core/utils";
import { crawlEmitter } from "@a11ywatch/core/event";
import { connected, initDbConnection } from "@a11ywatch/core/database/client";
import { isReady } from "@a11ywatch/core/app";
import { wsChromeEndpointurl } from "@a11ywatch/pagemind/config/chrome";
import type { Results } from "./results";

const production = process.env.NODE_ENV === "production";
let startedApp = false; // app ready to go!

// detect if the suite is ready across all services.
// waits until the app is ready
// @returns Promise<true>
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
      }, 3);
    }
  });
};

const logger = (
  value: string,
  fn: keyof Console = "log",
  optional: any[] = []
) => {
  // disable logging in production
  if (!production && typeof console[fn] === "function") {
    console[fn + ""](value, ...optional);
  }
};

// prevent re-starting the application on re-imports
const initApplication = async () => {
  if (!startedApp) {
    logger("starting a11ywatch...");
    try {
      await import("@a11ywatch/elastic-cdn"); // cdn
    } catch (e) {
      logger(e, "error");
    }
    try {
      await import("@a11ywatch/mav"); // ai
    } catch (e) {
      logger(e, "error");
    }
    try {
      await import("@a11ywatch/pagemind"); // a11y
    } catch (e) {
      logger(e, "error");
    }
    try {
      await import("@a11ywatch/crawler"); // crawler
    } catch (e) {
      logger(e, "error");
    }
    try {
      await import("@a11ywatch/core"); // core
    } catch (e) {
      logger(e, "error");
    }

    // app ready
    if (connected) {
      startedApp = true;
    } else {
      logger("creating MongoDB memory server...");
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            ip: "127.0.0.1",
            dbName: "a11ywatch",
          },
        });
        await initDbConnection(mongod?.getUri() || "mongodb://mongodb:27017");
        logger("connected to memory MongoDB.");
      } catch (e) {
        logger(e, "error");
      }
      startedApp = true;
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
  await appReady();

  return await scanWebsite({ noStore: true, ...params });
}

/*
 * Multi page website scan
 * @param Object - params for the website crawl
 * @param Function - callback function to perform an action on each page scan
 *
 * @return Promise<void>
 */
async function multiPageScan(
  params: Parameters<typeof crawlMultiSiteWithEvent>[0],
  cb?: (res: { data: Results }) => void
) {
  await appReady();

  if (typeof cb === "function") {
    crawlEmitter.on(
      `crawl-${domainName(getHostName(params.url))}-${params?.userId || 0}`,
      cb
    );
  }

  return await crawlMultiSiteWithEvent(params);
}

export { scan, multiPageScan, initApplication, appReady };
