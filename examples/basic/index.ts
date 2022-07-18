import { scan } from "@a11ywatch/a11ywatch";

// wait about 3 seconds or import "@a11ywatch/a11ywatch" early in the life-cycle
setTimeout(() => {
  scan({ url: "https://jeffmendez.com" }).then((data) => {
    console.log(data);
  }); // single page website scan.
}, 3000);
