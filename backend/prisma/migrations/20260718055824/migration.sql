-- CreateEnum
CREATE TYPE "SubmissonStatus" AS ENUM ('Processing', 'Success', 'Failed');

-- CreateTable
CREATE TABLE "Submissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "SubmissonStatus" NOT NULL,
    "output" TEXT,

    CONSTRAINT "Submissions_pkey" PRIMARY KEY ("id")
);
