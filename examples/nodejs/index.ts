import { scan, multiPageScan } from "@a11ywatch/a11ywatch";

// single page
scan({ url: "https://jeffmendez.com" })
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.error(e);
  });

// scan multiple pages
multiPageScan({ url: "https://jeffmendez.com" })
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.error(e);
  });
