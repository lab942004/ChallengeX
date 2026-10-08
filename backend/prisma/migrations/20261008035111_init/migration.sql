-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "TrialMode" AS ENUM ('STRESS_TEST', 'BRUTAL_MODE', 'X100_MODE', 'COMPETITOR_MODE', 'FAILURE_MODE');

-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('BUILD', 'PIVOT', 'VALIDATE', 'KILL');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'PLANNED', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRIAL_COMPLETED', 'VERDICT_GENERATED', 'ROADMAP_COMPLETED', 'EXPERIMENT_CREATED', 'SAVED_IDEA', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IdeaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "mode" "TrialMode" NOT NULL,
    "status" "TrialStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentQuestion" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER,
    "verdict" "Verdict",
    "analysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Trial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialQuestion" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT,

    CONSTRAINT "TrialQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialAnswer" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assumption" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "validationMethod" TEXT NOT NULL,

    CONSTRAINT "Assumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "evidence" TEXT NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "successMetric" TEXT NOT NULL,
    "estimatedCost" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapStep" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "objective" TEXT,
    "tasks" JSONB,
    "deliverables" JSONB,
    "estimatedEffort" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedIdea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeQuestion" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "threshold" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "objective" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "deliverables" JSONB NOT NULL,
    "estimatedEffort" TEXT NOT NULL DEFAULT '1 week',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Idea_userId_idx" ON "Idea"("userId");

-- CreateIndex
CREATE INDEX "Idea_status_idx" ON "Idea"("status");

-- CreateIndex
CREATE INDEX "Idea_createdAt_idx" ON "Idea"("createdAt");

-- CreateIndex
CREATE INDEX "Trial_userId_idx" ON "Trial"("userId");

-- CreateIndex
CREATE INDEX "Trial_ideaId_idx" ON "Trial"("ideaId");

-- CreateIndex
CREATE INDEX "Trial_status_idx" ON "Trial"("status");

-- CreateIndex
CREATE INDEX "Trial_verdict_idx" ON "Trial"("verdict");

-- CreateIndex
CREATE INDEX "Trial_createdAt_idx" ON "Trial"("createdAt");

-- CreateIndex
CREATE INDEX "TrialQuestion_trialId_idx" ON "TrialQuestion"("trialId");

-- CreateIndex
CREATE UNIQUE INDEX "TrialQuestion_trialId_order_key" ON "TrialQuestion"("trialId", "order");

-- CreateIndex
CREATE INDEX "TrialAnswer_trialId_idx" ON "TrialAnswer"("trialId");

-- CreateIndex
CREATE UNIQUE INDEX "TrialAnswer_trialId_questionId_key" ON "TrialAnswer"("trialId", "questionId");

-- CreateIndex
CREATE INDEX "Assumption_trialId_idx" ON "Assumption"("trialId");

-- CreateIndex
CREATE INDEX "Risk_trialId_idx" ON "Risk"("trialId");

-- CreateIndex
CREATE INDEX "Recommendation_trialId_idx" ON "Recommendation"("trialId");

-- CreateIndex
CREATE INDEX "Experiment_trialId_idx" ON "Experiment"("trialId");

-- CreateIndex
CREATE INDEX "Experiment_status_idx" ON "Experiment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_trialId_key" ON "Roadmap"("trialId");

-- CreateIndex
CREATE INDEX "Roadmap_status_idx" ON "Roadmap"("status");

-- CreateIndex
CREATE INDEX "RoadmapStep_roadmapId_idx" ON "RoadmapStep"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapStep_roadmapId_order_key" ON "RoadmapStep"("roadmapId", "order");

-- CreateIndex
CREATE INDEX "SavedIdea_userId_idx" ON "SavedIdea"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedIdea_userId_ideaId_key" ON "SavedIdea"("userId", "ideaId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeCategory_name_key" ON "ChallengeCategory"("name");

-- CreateIndex
CREATE INDEX "ChallengeQuestion_categoryId_active_idx" ON "ChallengeQuestion"("categoryId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "RiskRule_name_key" ON "RiskRule"("name");

-- CreateIndex
CREATE INDEX "RoadmapTemplate_order_idx" ON "RoadmapTemplate"("order");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trial" ADD CONSTRAINT "Trial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trial" ADD CONSTRAINT "Trial_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialQuestion" ADD CONSTRAINT "TrialQuestion_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialAnswer" ADD CONSTRAINT "TrialAnswer_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialAnswer" ADD CONSTRAINT "TrialAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TrialQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assumption" ADD CONSTRAINT "Assumption_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapStep" ADD CONSTRAINT "RoadmapStep_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeQuestion" ADD CONSTRAINT "ChallengeQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChallengeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
