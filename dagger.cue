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

    _local: "Local FS": {
        dest: "/usr/src/app/"
        contents: client.filesystem.".".read.contents
    }

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
        // build docker image
        build: docker.#Dockerfile & {
            source: client.filesystem.".".read.contents
            dockerfile: path: "Dockerfile"
        }
		// test against the image
		test: {
			integration: {
				docker.#Run & {
					input: build.output
					command: {
						name: "/bin/bash"
						args: ["-c", "npm i && npm run test:ci"]
					}
					mounts: _local
				}
			}
			unit: {
				docker.#Run & {
					input: build.output
					command: {
						name: "/bin/bash"
						args: ["-c", "npm i && npm run test:unit"]
					}
					mounts: _local
				}
			}
		}
        // push container to localhost registry
        push: {
            _op: docker.#Push & {
                image: build.output
                dest:  "localhost:2222/a11ywatch"
            }
            digest: _op.result
            path: _op.image.config.env.PATH
        }
		// deploy services - not exposed on macos
        deploy: {
			local: docker.#Run & {
				input: build.output
				ports: docker: {
					frontend: client.network."unix:///var/run/docker.sock".connect
					backend: {
						protocol: "tcp"
						address:  "3280"
					}
				}
			}
        }
	}
}