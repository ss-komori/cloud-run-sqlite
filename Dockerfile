FROM node:20-alpine as builder

RUN apk add --no-cache libc6-compat
RUN apk add sqlite-dev
ADD https://github.com/benbjohnson/litestream/releases/download/v0.3.8/litestream-v0.3.8-linux-amd64-static.tar.gz /tmp/litestream.tar.gz
RUN tar -C /usr/local/bin -xzf /tmp/litestream.tar.gz
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1
COPY . .
RUN npm install
RUN npm run build

FROM node:20-alpine as runner

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/next.config.ts next.config.ts
COPY --from=builder /app/tsconfig.json tsconfig.json
COPY --from=builder /app/next-env.d.ts next-env.d.ts
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/tailwind.config.ts tailwind.config.ts
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/prisma prisma
COPY --from=builder /app/litestream.yml /etc/litestream.yml
COPY --from=builder /usr/local/bin/litestream /usr/local/bin/litestream
COPY --from=builder /app/run.sh /run.sh
ENV DATABASE_URL="file:./dev.db"
CMD ["sh", "run.sh"]
