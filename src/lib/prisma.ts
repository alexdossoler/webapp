import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Calculate lead score based on submission data
 */
export function calculateLeadScore(lead: {
  budgetMax: number;
  deadline: Date;
  features: string[];
  addOns: string[];
  additionalNotes?: string | null;
  attachments: string[];
}): number {
  let score = 0;

  // Budget scoring (40% of total score)
  const budgetScore = Math.min((lead.budgetMax / 50000) * 40, 40);
  score += budgetScore;

  // Urgency scoring (20% of total score)
  const daysUntilDeadline = Math.ceil((lead.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const urgencyScore = daysUntilDeadline <= 30 ? 20 : daysUntilDeadline <= 60 ? 15 : 10;
  score += urgencyScore;

  // Complexity scoring (25% of total score)
  const featureCount = lead.features?.length || 0;
  const addOnCount = lead.addOns?.length || 0;
  const complexityScore = Math.min((featureCount + addOnCount) * 2, 25);
  score += complexityScore;

  // Completeness scoring (15% of total score)
  let completenessScore = 0;
  if (lead.additionalNotes) completenessScore += 5;
  if (lead.attachments?.length > 0) completenessScore += 10;
  score += completenessScore;

  return Math.round(score);
}
