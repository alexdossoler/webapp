// Example n8n Webhook Integration
// This file shows how to extend the intake form to work with n8n automation

export interface N8nWebhookPayload {
  submissionId: string;
  timestamp: string;
  projectData: {
    goal: string;
    deadline: string;
    isUrgent: boolean;
    features: string[];
    budgetRange: {
      min: number;
      max: number;
      tier?: string;
    };
    contact: {
      name: string;
      email: string;
      phone?: string;
      preferredContact: string;
    };
    addOns: string[];
    attachmentCount: number;
  };
  leadScore: number;
  source: string;
}

/**
 * Calculate lead score based on submission data
 */
export function calculateLeadScore(submission: any): number {
  let score = 0;

  // Budget scoring (40% of total score)
  const budgetScore = Math.min((submission.budgetMax / 50000) * 40, 40);
  score += budgetScore;

  // Urgency scoring (20% of total score)
  const deadline = new Date(submission.deadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const urgencyScore = daysUntilDeadline <= 30 ? 20 : daysUntilDeadline <= 60 ? 15 : 10;
  score += urgencyScore;

  // Complexity scoring (25% of total score)
  const featureCount = submission.features?.length || 0;
  const addOnCount = submission.addOns?.length || 0;
  const complexityScore = Math.min((featureCount + addOnCount) * 2, 25);
  score += complexityScore;

  // Completeness scoring (15% of total score)
  let completenessScore = 0;
  if (submission.contactName) completenessScore += 3;
  if (submission.contactPhone) completenessScore += 3;
  if (submission.additionalNotes) completenessScore += 3;
  if (submission.attachments?.length > 0) completenessScore += 6;
  score += completenessScore;

  return Math.round(score);
}

/**
 * Send submission to n8n webhook
 */
export async function sendToN8nWebhook(submission: any): Promise<boolean> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("N8N_WEBHOOK_URL not configured, skipping webhook");
    return false;
  }

  const leadScore = calculateLeadScore(submission);
  
  // Determine urgency based on deadline
  const deadline = new Date(submission.deadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDeadline <= 30;

  const payload: N8nWebhookPayload = {
    submissionId: submission.id,
    timestamp: new Date().toISOString(),
    projectData: {
      goal: submission.goal,
      deadline: submission.deadline,
      isUrgent,
      features: submission.features,
      budgetRange: {
        min: submission.budgetMin,
        max: submission.budgetMax,
        tier: submission.budgetTier
      },
      contact: {
        name: submission.contactName,
        email: submission.contactEmail,
        phone: submission.contactPhone,
        preferredContact: submission.preferredContact
      },
      addOns: submission.addOns,
      attachmentCount: submission.attachments?.length || 0
    },
    leadScore,
    source: submission.source || "direct"
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ProjectIntake/1.0"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Successfully sent submission to n8n webhook");
    return true;
  } catch (error) {
    console.error("Failed to send to n8n webhook:", error);
    return false;
  }
}

/**
 * Example n8n workflow that could process this webhook:
 * 
 * 1. Webhook Trigger
 *    - Receives the payload above
 * 
 * 2. Lead Scoring Node
 *    - Route based on leadScore (>= 70 = hot, >= 40 = warm, < 40 = cold)
 * 
 * 3. CRM Integration Node
 *    - Create contact in HubSpot/Salesforce
 *    - Add tags based on budget tier and urgency
 * 
 * 4. Email Notification Node
 *    - Send acknowledgment to client
 *    - Internal notification to sales team for hot leads
 * 
 * 5. Calendar Booking Node (for hot leads)
 *    - Auto-generate Calendly link
 *    - Send booking email
 * 
 * 6. Slack/Discord Notification
 *    - Post to team channel with lead details
 *    - Different channels based on lead score
 * 
 * 7. File Processing Node
 *    - Move uploaded files to cloud storage
 *    - Extract metadata from PDFs/images
 * 
 * 8. Follow-up Automation
 *    - Schedule email sequences based on lead temperature
 *    - Set reminders for manual follow-up
 */

// Usage in your API route:
// 
// import { sendToN8nWebhook } from './n8n-integration';
// 
// export async function POST(request: NextRequest) {
//   // ... existing form processing ...
//   
//   // Send to n8n for automation
//   await sendToN8nWebhook(submission);
//   
//   // ... return response ...
// }
