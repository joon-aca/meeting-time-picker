-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invitee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'America/New_York',
    "timeZoneLabel" TEXT NOT NULL DEFAULT 'EDT',
    "email" TEXT,
    "note" TEXT,
    CONSTRAINT "Invitee_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Invitee" ("email", "id", "name", "note", "pollId") SELECT "email", "id", "name", "note", "pollId" FROM "Invitee";
DROP TABLE "Invitee";
ALTER TABLE "new_Invitee" RENAME TO "Invitee";
CREATE UNIQUE INDEX "Invitee_pollId_name_key" ON "Invitee"("pollId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
