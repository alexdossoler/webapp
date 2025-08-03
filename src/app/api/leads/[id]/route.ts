import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";

async function handleGET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

async function handlePATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, note, assignedToId } = body;

    const lead = await prisma.lead.findUnique({
      where: { id: params.id }
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Get user from auth middleware
    const user = (req as any).user;

    const updates: any = {};
    
    // Update status if provided
    if (status && status !== lead.status) {
      const validStatuses = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // Update assignment if provided
    if (assignedToId !== undefined) {
      if (assignedToId && assignedToId !== lead.assignedToId) {
        // Verify user exists
        const assignee = await prisma.user.findUnique({
          where: { id: assignedToId }
        });
        if (!assignee) {
          return NextResponse.json(
            { error: "Assigned user not found" },
            { status: 400 }
          );
        }
      }
      updates.assignedToId = assignedToId || null;
    }

    // Add notes if provided
    if (note) {
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${user.name || user.email}: ${note}`;
      updates.notes = lead.notes ? `${lead.notes}\n${newNote}` : newNote;
    }

    // Perform update in transaction
    const updatedLead = await prisma.$transaction(async (tx) => {
      // Record status history if status changed
      if (updates.status && updates.status !== lead.status) {
        await tx.statusHistory.create({
          data: {
            leadId: lead.id,
            from: lead.status,
            to: updates.status,
            note: note || null,
            changedById: user.id,
          },
        });
      }

      // Update the lead
      return tx.lead.update({
        where: { id: lead.id },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              changedBy: {
                select: { name: true, email: true }
              }
            }
          }
        },
      });
    });

    return NextResponse.json({ data: updatedLead });

  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  return withAuth(handleGET, "admin")(req, context);
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  return withAuth(handlePATCH)(req, context);
}
