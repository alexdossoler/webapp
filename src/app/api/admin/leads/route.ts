import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";

async function handler(req: NextRequest) {
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "20"));
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const assignedTo = searchParams.get("assignedTo");

  const skip = (Math.max(1, page) - 1) * pageSize;

  // Build where clause
  const where: any = {};
  
  if (status && status !== "all") {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { goal: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (assignedTo && assignedTo !== "all") {
    where.assignedToId = assignedTo;
  }

  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { 
            select: { id: true, name: true, email: true } 
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              changedBy: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: [
          { status: "asc" }, // New leads first
          { leadScore: "desc" }, // High score first
          { createdAt: "desc" } // Recent first
        ],
        skip,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    // Get lead statistics
    const stats = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: leads,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        statusCounts,
      },
    });

  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, "admin");
