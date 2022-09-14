# bun

Bun integration example

## Getting Started

Make sure to have bun installed, you can get it via curl `curl https://bun.sh/install | bash`.

Theres an issue with bun not installing chromium to the right location. Work around is to run
`npm i puppeteer` first.

1. `bun install`
1. `bun run build`
1. `bun run start`

### Auth example

1. `npm run start:auth`

## Usage

In order to have it ready at runtime `import "@a11ywatch/a11ywatch"` at the top location of your application.

## Todo

The track list for running bun need the following:

1. `dns` polyfill
2. `tls` polyfill
