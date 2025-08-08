-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "about" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "public"."project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company" TEXT,
    "link" TEXT,
    "collaborators" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "location" TEXT,
    "url" TEXT,
    "description" TEXT,
    "classmates" TEXT,
    "fieldOfStudy" TEXT,
    "gpa" TEXT,
    "activities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_experience" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT,
    "location" TEXT,
    "description" TEXT,
    "skills" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "work_experience_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education" ADD CONSTRAINT "education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_experience" ADD CONSTRAINT "work_experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
