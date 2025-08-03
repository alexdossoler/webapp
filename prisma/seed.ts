import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Create regular user
  const userPassword = await hash('user123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: 'user',
    },
  });

  // Create sample leads
  const sampleLeads = [
    {
      projectGoal: 'E-commerce Website',
      projectDescription: 'Need a modern e-commerce platform for selling handmade jewelry',
      companyName: 'Artisan Jewelry Co.',
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah@artisanjewelry.com',
      contactPhone: '+1-555-0123',
      projectTimeline: 'Within 3 months',
      estimatedBudget: 15000,
      projectScope: JSON.stringify(['web-development', 'e-commerce', 'payment-integration', 'mobile-responsive']),
      status: 'new' as const,
      leadScore: 85,
      notes: 'Initial contact - very interested, budget confirmed',
      submissionId: 'sub_' + Date.now() + '_1',
    },
    {
      projectGoal: 'Mobile App Development',
      projectDescription: 'Fitness tracking app with social features',
      companyName: 'FitTrack Solutions',
      contactName: 'Mike Chen',
      contactEmail: 'mike@fittrack.com',
      contactPhone: '+1-555-0124',
      projectTimeline: 'Within 6 months',
      estimatedBudget: 50000,
      projectScope: JSON.stringify(['mobile-app', 'ios', 'android', 'backend-api', 'user-authentication']),
      status: 'qualified' as const,
      leadScore: 92,
      notes: 'Had discovery call - strong technical requirements, good budget',
      assignedToId: user.id,
      submissionId: 'sub_' + Date.now() + '_2',
    },
    {
      projectGoal: 'Website Redesign',
      projectDescription: 'Modernize existing corporate website',
      companyName: 'Global Tech Corp',
      contactName: 'Jennifer Davis',
      contactEmail: 'j.davis@globaltech.com',
      projectTimeline: 'Within 2 months',
      estimatedBudget: 8000,
      projectScope: JSON.stringify(['web-development', 'ui-ux-design', 'content-management']),
      status: 'contacted' as const,
      leadScore: 70,
      notes: 'Waiting for response after initial proposal',
      submissionId: 'sub_' + Date.now() + '_3',
    },
    {
      projectGoal: 'Custom CRM System',
      projectDescription: 'Need a tailored CRM for real estate business',
      companyName: 'Prime Realty',
      contactName: 'Robert Wilson',
      contactEmail: 'rwilson@primerealty.com',
      contactPhone: '+1-555-0125',
      projectTimeline: 'Within 4 months',
      estimatedBudget: 25000,
      projectScope: JSON.stringify(['web-development', 'database-design', 'user-management', 'reporting']),
      status: 'proposal_sent' as const,
      leadScore: 88,
      notes: 'Proposal sent last week, following up this week',
      assignedToId: admin.id,
      submissionId: 'sub_' + Date.now() + '_4',
    },
    {
      projectGoal: 'Portfolio Website',
      projectDescription: 'Personal portfolio for freelance photographer',
      companyName: 'Lisa Photography',
      contactName: 'Lisa Anderson',
      contactEmail: 'lisa@lisaphotography.com',
      projectTimeline: 'Within 1 month',
      estimatedBudget: 3000,
      projectScope: JSON.stringify(['web-development', 'portfolio-gallery', 'contact-form']),
      status: 'won' as const,
      leadScore: 65,
      notes: 'Project completed successfully, client very satisfied',
      submissionId: 'sub_' + Date.now() + '_5',
    },
    {
      projectGoal: 'Enterprise Software',
      projectDescription: 'Complex inventory management system',
      companyName: 'MegaCorp Industries',
      contactName: 'David Brown',
      contactEmail: 'dbrown@megacorp.com',
      projectTimeline: 'Within 12 months',
      estimatedBudget: 150000,
      projectScope: JSON.stringify(['web-development', 'database-design', 'api-development', 'reporting']),
      status: 'lost' as const,
      leadScore: 95,
      notes: 'Lost to competitor due to timeline constraints',
      submissionId: 'sub_' + Date.now() + '_6',
    },
  ];

  // Create leads and their status history
  for (const leadData of sampleLeads) {
    const lead = await prisma.lead.create({
      data: leadData,
    });

    // Create initial status history
    await prisma.statusHistory.create({
      data: {
        leadId: lead.id,
        from: 'new',
        to: leadData.status,
        note: leadData.status === 'new' ? 'Initial lead creation' : `Status updated to ${leadData.status}`,
        changedById: admin.id,
      },
    });

    // Add additional status history for non-new leads
    if (leadData.status !== 'new') {
      const statusFlow = {
        'contacted': ['new', 'contacted'],
        'qualified': ['new', 'contacted', 'qualified'],
        'proposal_sent': ['new', 'contacted', 'qualified', 'proposal_sent'],
        'won': ['new', 'contacted', 'qualified', 'proposal_sent', 'won'],
        'lost': ['new', 'contacted', 'lost'],
      };

      const flow = statusFlow[leadData.status as keyof typeof statusFlow];
      if (flow) {
        for (let i = 1; i < flow.length; i++) {
          await prisma.statusHistory.create({
            data: {
              leadId: lead.id,
              from: flow[i - 1] as any,
              to: flow[i] as any,
              note: `Progressed to ${flow[i]}`,
              changedById: Math.random() > 0.5 ? admin.id : user.id,
              createdAt: new Date(Date.now() - (flow.length - i) * 24 * 60 * 60 * 1000), // Spread over days
            },
          });
        }
      }
    }
  }

  console.log('Seed data created successfully!');
  console.log(`Admin user: admin@example.com / admin123`);
  console.log(`Regular user: user@example.com / user123`);
  console.log(`Created ${sampleLeads.length} sample leads`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
