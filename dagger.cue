package main

import (
	"dagger.io/dagger"
	"dagger.io/dagger/core"
	"universe.dagger.io/bash"
	"universe.dagger.io/docker"
)

dagger.#Plan & {
	actions: {
		build: {
			checkout: core.#Source & {
				path: "."
			}
			pull: docker.#Pull & {
				source: "node:latest"
			}
			copy: docker.#Copy & {
				input:    pull.output
				contents: checkout.output
			}
			install: bash.#Run & {
				input: copy.output
				script: contents: """
					PUPPETEER_SKIP_DOWNLOAD=true npm ci
					"""
			}
			build: bash.#Run & {
				input: install.output
				script: contents: """
					npm run build
					"""
			}
		}
	}
}