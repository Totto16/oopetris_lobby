FROM alpine:3.20 AS cpp-buildenv

WORKDIR /tmp

RUN apk update --no-cache && \
    apk add --no-cache ca-certificates \
    samurai git openssl-dev openssl pkgconf cmake \
    clang18 clang18-extra-tools

ENV CC=clang-18
ENV CXX=clang++-18
ENV LD=clang-18

COPY obpf/simulator/ simulator/

WORKDIR /tmp/simulator/

RUN cmake -B build -G "Ninja" \
    -DCMAKE_BUILD_TYPE=Release \
    -Dobpf_build_tests=OFF \
    -Dobpf_simulator_enable_undefined_behavior_sanitizer=OFF \
    -Dobpf_simulator_enable_address_sanitizer=OFF \
    -Dobpf_simulator_warnings_as_errors=ON \
    -Dobpf_simulator_build_shared_libs=OFF && \
    cmake --build build


FROM node:20.18.0-alpine AS build-env

WORKDIR /tmp

# install node development dependencies

COPY .npmrc package.json pnpm-lock.yaml nest-cli.json tsconfig.json tsconfig.build.json /tmp/

RUN corepack enable && \
    corepack install -g pnpm@9.12.2 && \
    pnpm install --frozen-lockfile

# compile

ENV NODE_ENV=production

COPY prisma/ /tmp/prisma/
COPY src/ /tmp/src/

ARG OOPETRIS_LOBBY_COMMIT_HASH=""

RUN pnpm run generate:types && \
    sed -i "s/XXX_HASH_XXX/${OOPETRIS_LOBBY_COMMIT_HASH:-<Unknown Commit Hash>}/" src/generated/commit.ts && \
    pnpm run build:prod


# final image starts here

FROM node:20.18.0-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build-env /tmp/dist/ /app/

COPY --chmod=755 entry.sh /app/
COPY prisma/ /app/prisma/

COPY --from=cpp-buildenv /tmp/simulator/build/bin/server/server /app/gameserver/

RUN corepack enable && \
    corepack install -g pnpm@9.12.2 && \ 
    pnpm install -P --no-lockfile && \
    rm -rf /tmp/* && \
    corepack cache clean && \
    rm -rf /root/.cache/ && \
    npm uninstall -g yarn pnpm && \
    rm -rf /root/.npm && \
    rm -rf /root/.local


ENV PORT=3000
ENV CONFIG_PATH=/app/config.json
ENV OBPF_GAMESERVER_EXECUTABLE="/app/gameserver/server"
ENV OBPF_GAMSERVER_CWD="/app/gameserver/"

EXPOSE ${PORT}


HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl http://localhost:${PORT}/api/healthcheck

ENTRYPOINT ["./entry.sh"]
