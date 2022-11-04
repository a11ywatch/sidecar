FROM node:19.0-bullseye-slim AS dbinstaller 

RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

RUN apt-get update && apt-get install -y apt-utils wget gnupg gnupg2 curl

RUN wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
RUN echo "deb https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
RUN apt-get update && apt-get install -y mongodb-org

RUN sed -i "s,\\(^[[:blank:]]*bindIp:\\) .*,\\1 0.0.0.0," /etc/mongod.conf

FROM --platform=$BUILDPLATFORM node:19.0-bullseye-slim AS installer 

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	pkg-config \
	make \
	gcc \
	curl \
	libssl-dev \
	cmake \
	protobuf-compiler \
	libprotobuf-dev
	
COPY package*.json ./

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium" \
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"  \
 	MONGOMS_SYSTEM_BINARY="/usr/bin/mongod" \
	DISABLE_POSTINSTALL="true"

ENV PATH="/root/.cargo/bin:${PATH}"

RUN npm ci

RUN curl https://sh.rustup.rs -sSf | bash -s -- -y

RUN rustup update
RUN cargo install website_crawler

FROM node:19.0-bullseye-slim AS builder 

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	python3 \
	pkg-config \
	make \
	gcc \
	curl

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium" \
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"  \
 	MONGOMS_SYSTEM_BINARY="/usr/bin/mongod" \
	DISABLE_POSTINSTALL="true"

COPY --from=installer /usr/src/app/node_modules ./node_modules
COPY . .
RUN  npm run build
RUN rm -R ./node_modules
RUN npm install --production

FROM node:19.0-bullseye-slim

WORKDIR /usr/src/app

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium" \
 	MONGOMS_SYSTEM_BINARY="/usr/bin/mongod" \
	MONGO_INITDB_DATABASE="a11ywatch" \
	MONGOMS_VERSION="5.0.9" \
	DB_URL="mongodb://0.0.0.0:27017" \
	REDIS_CLIENT="redis://0.0.0.0:6379" \
    REDIS_HOST="0.0.0.0" \
	SUPER_MODE="true" \
	CHROME_HOST="host.docker.internal"

# required runtime deps
RUN apt-get update && \
    apt-get install -y build-essential \
	chromium \
	curl \
	redis-server
	
COPY --from=dbinstaller /usr/bin/mongod /usr/bin/mongod
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=installer /root/.cargo/bin/website_crawler /usr/bin/website_crawler

# # test
# COPY --from=builder /usr/src/app/__tests__ ./__tests__
# COPY --from=builder /usr/src/app/package*.json ./

EXPOSE 27017
EXPOSE 3280
EXPOSE 50051

RUN mkdir -p /data/db
RUN mkdir ~/log

# set volume
VOLUME "/mongodb" "/data/db"

# wait for fork to finish
CMD mongod --fork --bind_ip 0.0.0.0 --logpath ~/log/mongodb.log && redis-server --daemonize yes && node --no-experimental-fetch ./dist/server.js