# bun

Bun integration example

## Getting Started

Make sure to have bun installed, you can get it via curl `curl https://bun.sh/install | bash`.

Theres an issue with bun not installing chromium to the right location. Work around is to run
`npm i puppeteer` first.

1. `bun install`
1. `bun run build`
1. `bun run start`

## Usage

Currently the example uses a setTimeout to run the initial scan.

This is set since the first time the "@a11ywatch/a11ywatch" is imported it will initite the suite.

In order to have it ready at runtime `import "@a11ywatch/a11ywatch"` at the top location of your application.
