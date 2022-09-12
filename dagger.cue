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

    _local: {
		"Local FS": {
			dest: "/usr/src/app/"
			contents: client.filesystem.".".read.contents
		}
		docker: {
            dest: "/var/run/docker.sock"
            contents: client.network."unix:///var/run/docker.sock".connect
        }
    }

	_build: docker.#Dockerfile & {
		source: client.filesystem.".".read.contents
		dockerfile: path: "Dockerfile"
	}
		
	_pull: docker.#Pull & {
		source: "node:18.9-bullseye-slim"
	}

	_copy: docker.#Copy & {
		input: _build.output
		contents: client.filesystem.".".read.contents
		include: ["__tests__", "package*.json"]
		exclude: ["src"]
	}

	actions: {
        // build directly and check deps against debian
		deps: {
			checkout: core.#Source & {
				path: "."
			}
			pull: _pull
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
        build: _build

		// test against the image
		test: {

			integration: {
				docker.#Run & {
					input: _copy.output
					mounts: _local
					command: {
						name: "/bin/bash"
						args: ["-c", "npm ci && npm run test:ci"]
					}
				}
			}
			unit: {
				docker.#Run & {
					input: _copy.output
					mounts: _local
					command: {
						name: "/bin/bash"
						args: ["-c", "npm ci && A11YWATCH_MEMORY_ONLY=true npm run test:unit"]
					}
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