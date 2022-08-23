package main

import (
	"dagger.io/dagger"
	"dagger.io/dagger/core"
	"universe.dagger.io/bash"
	"universe.dagger.io/docker"
)

dagger.#Plan & {
    client: filesystem: ".": read: contents: dagger.#FS
    client: network: "unix:///var/run/docker.sock": connect: dagger.#Socket

	actions: {
        // build directly and check deps
		deps: {
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
        // build from the Dockerfile
        build: docker.#Dockerfile & {
            source: client.filesystem.".".read.contents
            dockerfile: path: "Dockerfile"
        }
        // push the docker container to localhost
        push: docker.#Push & {
            image: build.output
            dest:  "localhost:2222/a11ywatch"
        }
        // deploy: {
        //     local: {}
        //     cloud: {}
        //     npm: {}
        //     docker: {}
        // }
	}
}