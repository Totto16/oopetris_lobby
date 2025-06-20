-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('User', 'Admin');

-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('Open', 'Closed', 'Running', 'Finished');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'User',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lobby_player" (
    "player_id" TEXT NOT NULL,
    "lobby_id" TEXT NOT NULL,
    "is_ready" BOOLEAN NOT NULL,

    CONSTRAINT "lobby_player_pkey" PRIMARY KEY ("player_id","lobby_id")
);

-- CreateTable
CREATE TABLE "lobby" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "host_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lobby_status" "LobbyStatus" NOT NULL,
    "gameserver_port" INTEGER,

    CONSTRAINT "lobby_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_id_username_idx" ON "user"("id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "lobby_player_player_id_key" ON "lobby_player"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "lobby_host_id_key" ON "lobby"("host_id");

-- CreateIndex
CREATE INDEX "lobby_id_idx" ON "lobby"("id");

-- AddForeignKey
ALTER TABLE "lobby_player" ADD CONSTRAINT "lobby_player_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lobby_player" ADD CONSTRAINT "lobby_player_lobby_id_fkey" FOREIGN KEY ("lobby_id") REFERENCES "lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lobby" ADD CONSTRAINT "lobby_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
