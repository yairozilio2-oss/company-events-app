-- CreateTable
CREATE TABLE "Accommodation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "capacity" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "amenities" TEXT NOT NULL
);
