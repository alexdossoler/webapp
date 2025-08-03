// Types for the project intake form

export interface Feature {
  id: string;
  text: string;
}

export interface BudgetTier {
  name: string;
  min: number;
  max: number;
  description: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  preferredContact: 'email' | 'phone' | 'either';
}

export interface ProjectFormData {
  goal: string;
  deadline: string;
  isDeadlineFlexible: boolean;
  features: Feature[];
  otherRequirements: string;
  budgetMin: number;
  budgetMax: number;
  budgetTier?: string;
  contact: ContactInfo;
  additionalNotes: string;
  files: File[];
  addOns: string[];
  consentGiven: boolean;
  source?: string;
  campaign?: string;
}

export interface FormErrors {
  goal?: string;
  deadline?: string;
  email?: string;
  budgetRange?: string;
  consent?: string;
  general?: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: FormErrors;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isValid: boolean;
}

// API request/response types
export interface IntakeSubmission {
  id: string;
  goal: string;
  deadline: string;
  isDeadlineFlexible: boolean;
  features: string[];
  otherRequirements: string;
  budgetMin: number;
  budgetMax: number;
  budgetTier?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  preferredContact: string;
  additionalNotes: string;
  attachments: string[];
  addOns: string[];
  source?: string;
  campaign?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUploadResponse {
  success: boolean;
  filename: string;
  originalName: string;
  size: number;
  url?: string;
  error?: string;
}

// Budget tier presets
export const BUDGET_TIERS: BudgetTier[] = [
  {
    name: "Bootstrap",
    min: 1000,
    max: 3000,
    description: "Perfect for simple landing pages and basic websites"
  },
  {
    name: "Growth",
    min: 3000,
    max: 10000,
    description: "Ideal for business websites with custom features"
  },
  {
    name: "Professional",
    min: 10000,
    max: 25000,
    description: "Advanced web applications with integrations"
  },
  {
    name: "Enterprise",
    min: 25000,
    max: 100000,
    description: "Complex platforms and custom solutions"
  }
];

// Available add-ons
export const AVAILABLE_ADDONS = [
  "Lead capture integration",
  "Subscription billing",
  "Admin dashboard",
  "User authentication",
  "Payment processing",
  "Email automation",
  "Analytics & tracking",
  "SEO optimization",
  "Mobile app",
  "API development",
  "Third-party integrations",
  "Self-hosted deployment",
  "Ongoing maintenance",
  "Content management system"
];

// Common feature suggestions
export const COMMON_FEATURES = [
  "Landing page",
  "Contact form",
  "User registration",
  "User login",
  "Payment checkout",
  "Shopping cart",
  "Blog/News section",
  "Photo gallery",
  "Search functionality",
  "User profiles",
  "Admin panel",
  "Email notifications",
  "Social media integration",
  "Maps integration",
  "Calendar/Booking",
  "File uploads",
  "Live chat",
  "Reviews/Ratings"
];
