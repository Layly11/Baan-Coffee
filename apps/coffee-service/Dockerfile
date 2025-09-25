FROM node:22.17.1-alpine AS builder
WORKDIR /app
RUN npm install -g npm@latest
RUN npm i -g turbo
COPY turbo.json turbo.json
COPY package*.json .
COPY packages packages
COPY apps/coffee-service apps/coffee-service
RUN turbo prune --scope=coffee-service --docker


FROM node:22.17.1-alpine AS installer
WORKDIR /app
RUN apk update \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install -g npm@latest
RUN npm install
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo run build --filter=coffee-service...
RUN npm install mysql2

FROM node:22.17.1-alpine AS runner
WORKDIR /app
RUN apk update \
    && apk upgrade --no-cache \
    && apk add --no-cache --upgrade libc6-compat curl libcrypto3 libssl3 \
    && rm -rf /var/cache/apk/*
COPY --from=installer /app .
RUN find /app -name ".env" -type f -delete
WORKDIR /app/apps/coffee-service
RUN npm install -g npm@latest

CMD ["npm", "start"]