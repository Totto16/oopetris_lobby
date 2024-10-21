FROM debian:bookworm AS cpp-buildenv

WORKDIR /tmp

RUN apt-get update && \
    apt-get install --no-install-recommends wget ca-certificates \
    lsb-release software-properties-common gnupg ninja-build \
    git libssl-dev openssl pkg-config -y && \
    wget https://apt.llvm.org/llvm.sh && \
    chmod +x llvm.sh && \
    ./llvm.sh 19 && \
    echo "deb http://deb.debian.org/debian bookworm-backports main" > /etc/apt/sources.list.d/new.list && \
    apt-get update && \
    apt-get install --no-install-recommends cmake=3.30.5-1~bpo12+1 cmake-data=3.30.5-1~bpo12+1 clang-tools-19 -y && \
    rm -rf /var/lib/apt/lists/* 

ENV CC=clang-19
ENV CXX=clang++-19
ENV LD=clang-19

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


FROM node:20.18.0 AS build-env

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

FROM node:20.18.0

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
