import {
  createConfiguration,
  ServerConfiguration,
  ReportsApi,
  CollectionApi,
  UserApi,
  WebsiteInput,
  WebsitesApi,
} from "@a11ywatch/client";

import type { Report } from "@a11ywatch/client";

let A11YWATCH_URL = "http://localhost:3280/api";
// the token to use for request.
let jwt =
  typeof process !== "undefined" && process.env.A11YWATCH_TOKEN
    ? process.env.A11YWATCH_TOKEN
    : "";

// create a new OPENAPI server config
export const createAPIConfiguration = () => {
  return createConfiguration({
    baseServer: new ServerConfiguration(A11YWATCH_URL, {}),
    authMethods: {
      bearerAuth: {
        tokenProvider: {
          getToken: () => {
            return jwt;
          },
        },
      },
    },
  })
}

// config base api
export const configuration = createAPIConfiguration();

// setup all api clients
const audit = new ReportsApi(configuration);
const user = new UserApi(configuration);
const website = new WebsitesApi(configuration);
const collections = new CollectionApi(configuration);

export const api = {
  audit,
  user,
  website,
  collections
};

const rebindAPI = () => {
  const conf = createAPIConfiguration();
  api.audit = new ReportsApi(conf);
  api.user = new UserApi(conf);
  api.website = new WebsitesApi(conf);
  api.collections = new CollectionApi(conf);
}

// set the api request
export const setAPIToken = (token: string) => {
  jwt = token;
  rebindAPI();
};

// set to the remote API endpoint
export const setA11yWatchURL = (url: string) => {
  A11YWATCH_URL = url;
  rebindAPI();
};

// HELPERS for OPENAPI cross platform nodejs and browser

// crawl a website to be streamed. If onStream is passed a streaming array of results are chunked until completion.
export const crawlWebsite = async (
  input: Partial<WebsiteInput>,
  onStream?: (
    audit: { data?: Report; success?: boolean; code?: number }[] | "[" | "]",
  ) => Promise<any> | void,
) => {
  const res = await fetch(A11YWATCH_URL + "/crawl", {
    body: JSON.stringify(input),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  });

  // return all at once or stream the body
  if (!onStream) {
    return await res.json();
  }

  const stream = res.body;
  const textStream = stream?.pipeThrough(new TextDecoderStream());

  if (textStream) {
    // @ts-ignore
    for await (const chunk of textStream) {
      await onStream(chunk);
    }
  }
};

// scan a single page website
export const scanWebsite = async (input: Partial<Exclude<WebsiteInput, "subdomains" | "tld">>) => {
  return await api.audit.scanWebsite(input);
};

// re-export client
export * from "@a11ywatch/client";
