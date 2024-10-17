FROM node:20.18.0 AS build-env

WORKDIR /tmp

# install node development dependencies

COPY .npmrc package.json pnpm-lock.yaml nest-cli.json tsconfig.json tsconfig.build.json /tmp/

RUN corepack enable && \
    corepack install -g pnpm@9.12.1 && \
    pnpm install --frozen-lockfile

# compile

ENV NODE_ENV=production

COPY prisma/ /tmp/prisma/
COPY src/ /tmp/src/

RUN pnpm run generate:types && \
    pnpm run build:prod


# final image starts here

FROM node:20.18.0

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build-env /tmp/dist/ /app/
COPY entry.sh /app/

RUN corepack enable && \
    corepack install -g pnpm@9.12.1 && \ 
    pnpm install -P --no-lockfile && \
    rm -rf .corepack

ENV PORT=3000
ENV CONFIG_PATH=/app/config.json
EXPOSE ${PORT}


HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl http://localhost:${PORT}/api/healthcheck

ENTRYPOINT ["./entry.sh"]
