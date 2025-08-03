import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma, calculateLeadScore } from "@/lib/prisma";

// Types for the incoming form data
interface IntakeFormData {
  projectGoal: string;
  projectDescription?: string;
  projectTimeline: string;
  estimatedBudget?: string;
  projectScope: string[];
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName?: string;
  additionalNotes?: string;
  attachedFiles?: string[]; // Array of secure filenames from presigned uploads
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract form fields
    const projectGoal = formData.get("goal") as string;
    const deadline = formData.get("deadline") as string;
    const isDeadlineFlexible = formData.get("isDeadlineFlexible") === "true";
    const featuresStr = formData.get("features") as string;
    const projectScope = featuresStr ? JSON.parse(featuresStr) : [];
    const otherRequirements = formData.get("otherRequirements") as string;
    const budgetMin = parseInt(formData.get("budgetMin") as string) || 0;
    const budgetMax = parseInt(formData.get("budgetMax") as string) || 0;
    const budgetTier = formData.get("budgetTier") as string;
    const contactName = formData.get("contactName") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const preferredContact = formData.get("preferredContact") as string;
    const additionalNotes = formData.get("additionalNotes") as string;
    const addOnsStr = formData.get("addOns") as string;
    const addOns = addOnsStr ? JSON.parse(addOnsStr) : [];
    const source = formData.get("source") as string;

    // Basic validation
    if (!projectGoal || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields: goal, contactName, contactEmail" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Calculate lead score
    const leadData = {
      budgetMax,
      deadline: new Date(deadline),
      features: projectScope,
      addOns,
      additionalNotes,
      attachments: [], // Files will be handled separately
    };

    const score = calculateLeadScore(leadData);

    // Process uploaded files
    const files = formData.getAll("files") as File[];
    const attachments: string[] = [];
    
    for (const file of files) {
      if (file.size > 0) {
        // For now, just store the filename - in a real app you'd process and store the file
        attachments.push(file.name);
      }
    }

    // Create unique submission ID
    const submissionId = `sub_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // Get client info
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    // Store in database
    const lead = await prisma.lead.create({
      data: {
        submissionId,
        projectGoal,
        projectDescription: otherRequirements || null,
        projectTimeline: deadline,
        estimatedBudget: budgetMax || null,
        projectScope: JSON.stringify(projectScope),
        attachments: JSON.stringify(attachments),
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        companyName: null, // Not collected in current form
        notes: additionalNotes || null,
        leadScore: score,
        status: 'new',
        source: source || 'website',
        ipAddress: clientIP,
        userAgent: userAgent,
      },
    });

    // Create initial status history
    await prisma.statusHistory.create({
      data: {
        leadId: lead.id,
        from: 'new',
        to: 'new',
        note: 'Initial lead submission from website',
      },
    });

    return NextResponse.json({
      success: true,
      submissionId,
      leadId: lead.id,
      score,
      message: "Thank you for your submission! We'll be in touch soon.",
    });

  } catch (error) {
    console.error("Project intake submission error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to process submission. Please try again later.",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
