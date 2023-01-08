// top level disable storage set `A11YWATCH_NO_STORE` to false to enable storage - todo: A11YWATCH_MEMORY_ONLY
process.env.A11YWATCH_NO_STORE =
  process.env.A11YWATCH_NO_STORE === "false" ? "false" : "true";

import { scanWebsite } from "@a11ywatch/core/core/actions/crawl/scan";
import { crawlMultiSite } from "@a11ywatch/core/core/actions/accessibility/crawl";

import {
  crawlMultiSiteWithEvent,
  domainName,
  getHostName,
} from "@a11ywatch/core/core/utils";
import { crawlEmitter } from "@a11ywatch/core/event";
import {
  initDbConnection,
  pollTillConnected,
} from "@a11ywatch/core/database/client";
import { isReady } from "@a11ywatch/core/app";
import { wsChromeEndpointurl } from "@a11ywatch/pagemind/config/chrome";

export type Issues = {
  type: "error" | "warning" | "notice";
  code?: string;
  typeCode?: number;
  message?: string;
  context?: string;
  selector?: string;
  runner?: string;
};
// issue stats
export type IssuesInfo = {
  adaScoreAverage: number;
  possibleIssuesFixedByCdn: number;
  totalIssues: number;
  issuesFixedByCdn: number;
  errorCount: number;
  warningCount: number;
  noticeCount: number;
  pageCount: number;
};
export type Results = {
  domain: string;
  url: string;
  issues: Issues[];
  issuesInfo: IssuesInfo;
};

let startedApp = false; // app ready to go!

// await till app is ready.
// @returns Promise<true>
const appReady = async () => {
  await isReady();
  return new Promise((resolve) => {
    if (wsChromeEndpointurl && startedApp) {
      resolve(true);
    } else {
      // todo: bind to event emit
      const checkChrome = setInterval(() => {
        // wait till value exists
        if (wsChromeEndpointurl && startedApp) {
          clearInterval(checkChrome);
          resolve(true);
        }
      }, 2);
    }
  });
};

// sidecar logger - disabled in production
const logger = (
  value: string,
  fn: keyof Console = "log",
  optional: any[] = []
) => {
  // disable logging in production
  if (
    process.env.NODE_ENV !== "production" &&
    typeof console[fn] === "function"
  ) {
    console[fn + ""](value, ...optional);
  }
};

// prevent re-starting the application on re-imports
const initApplication = () => {
    return new Promise(async (resolve) => {
      if (!startedApp) {
        await Promise.all(
          ["elastic-cdn", "mav", "pagemind", "crawler"].map(
            (mname) => import(`@a11ywatch/${mname}`)
          )
        );
          
        try {
          await import("@a11ywatch/core");
        } catch(e) {
          logger(e);
        }

        const extDb =
          process.env.A11YWATCH_MEMORY_ONLY === "true"
            ? false
            : await pollTillConnected();
  
        // app ready
        if (extDb) {
          startedApp = true;
        } else {
          logger("creating MongoDB memory server...");
  
          let mongod = null;
  
          try {
            const { MongoMemoryServer } = await import("mongodb-memory-server");
            
            mongod = await MongoMemoryServer.create({
              instance: {
                port: 27017,
                ip: "127.0.0.1",
                dbName: "a11ywatch",
              },
            });
          } catch (e) {
            logger(e, "error");
          }
  
          try {
            await initDbConnection(mongod?.getUri() || process.env.DB_URL || "mongodb://0.0.0.0:27017");
            logger("connected to memory MongoDB.");
          } catch (e) {
            logger(e, "error");
          }
  
          startedApp = true;
        }
      }

      resolve(true)
    })
};

// auto init the suite.
if (process.env.A11YWATCH_AUTO_START !== "false") {
  initApplication();
}

/*
 * A11yWatch Sidecar
 * export nice utility functions upfront.
 */

// single page website scan
async function scan(params: Parameters<typeof scanWebsite>[0]) {
  await appReady();
  return await scanWebsite(params);
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

/*
 * Crawl a list of urls passed
 * @param { pages: string[], userId: number } - object with pages and userId for the crawl to store and send events
 *
 * @return Promise<Website[]>
 */
async function crawlList(params: Parameters<typeof crawlMultiSite>[0]) {
  await appReady();
  return await crawlMultiSite(params);
}

export { scan, multiPageScan, initApplication, crawlList, appReady };
