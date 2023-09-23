process.env.CHROME_HOST = "127.0.0.1"
// we use the local litemode for examples until user switches to external api endpoint
import { appReady } from "@a11ywatch/a11ywatch";
import { crawlWebsite } from "@a11ywatch/a11ywatch/client"

// wait till app is ready to auth
appReady()
  .then(async () => {
     await crawlWebsite(
        {
          url: "https://jeffmendez.com",
        },
        (audit) => {
            console.log(audit)
        }
      );
  })
  .catch((e) => {
    console.error(e);
  });
