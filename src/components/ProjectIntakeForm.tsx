"use client";

import { useState, useEffect } from "react";
import { 
  ProjectFormData, 
  FormErrors, 
  Feature, 
  ContactInfo, 
  AVAILABLE_ADDONS, 
  COMMON_FEATURES 
} from "@/types/intake";
import FileUpload from "./FileUpload";
import FeatureSelector from "./FeatureSelector";
import BudgetSelector from "./BudgetSelector";
import ProgressBar from "./ProgressBar";

const STORAGE_KEY = "project-intake-form";

export default function ProjectIntakeForm() {
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    goal: "",
    deadline: "",
    isDeadlineFlexible: false,
    features: [],
    otherRequirements: "",
    budgetMin: 1000,
    budgetMax: 5000,
    contact: {
      name: "",
      email: "",
      phone: "",
      preferredContact: "email"
    },
    additionalNotes: "",
    files: [],
    addOns: [],
    consentGiven: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(prevData => ({ ...prevData, ...parsedData }));
      } catch (error) {
        console.error("Failed to load saved form data:", error);
      }
    }
  }, []);

  // Save form data on changes
  useEffect(() => {
    const saveData: Partial<ProjectFormData> = { ...formData };
    // Don't save files to localStorage (too large)
    delete (saveData as { files?: File[] }).files;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, [formData]);

  const steps = [
    { id: "goal", title: "Project Goal", description: "What are you trying to achieve?" },
    { id: "timeline", title: "Timeline", description: "When do you need this completed?" },
    { id: "scope", title: "Scope & Features", description: "What pages and features do you need?" },
    { id: "budget", title: "Budget Range", description: "What's your investment range?" },
    { id: "contact", title: "Contact Info", description: "How can we reach you?" },
    { id: "details", title: "Additional Details", description: "Files, notes, and add-ons" },
    { id: "review", title: "Review & Submit", description: "Confirm your details" }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0: // Goal
        if (!formData.goal.trim()) {
          newErrors.goal = "Please describe your project goal";
        }
        break;
      case 1: // Timeline
        if (!formData.deadline) {
          newErrors.deadline = "Please select a deadline";
        } else if (new Date(formData.deadline) < new Date()) {
          newErrors.deadline = "Deadline cannot be in the past";
        }
        break;
      case 3: // Budget
        if (formData.budgetMin >= formData.budgetMax) {
          newErrors.budgetRange = "Maximum budget must be greater than minimum";
        }
        break;
      case 4: // Contact
        if (!formData.contact.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
          newErrors.email = "Please enter a valid email";
        }
        break;
      case 6: // Review
        if (!formData.consentGiven) {
          newErrors.consent = "Please agree to receive follow-up communication";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleFeatureAdd = (feature: Feature) => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, feature]
    }));
  };

  const handleFeatureRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== id)
    }));
  };

  const handleBudgetChange = (min: number, max: number, tier?: string) => {
    setFormData(prev => ({
      ...prev,
      budgetMin: min,
      budgetMax: max,
      budgetTier: tier
    }));
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleAddOnToggle = (addOn: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOn)
        ? prev.addOns.filter(item => item !== addOn)
        : [...prev.addOns, addOn]
    }));
  };

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const handleFileRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    setErrors({});

    const submitData = new FormData();
    
    // Add form fields
    submitData.append("goal", formData.goal);
    submitData.append("deadline", formData.deadline);
    submitData.append("isDeadlineFlexible", formData.isDeadlineFlexible.toString());
    submitData.append("features", JSON.stringify(formData.features.map(f => f.text)));
    submitData.append("otherRequirements", formData.otherRequirements);
    submitData.append("budgetMin", formData.budgetMin.toString());
    submitData.append("budgetMax", formData.budgetMax.toString());
    submitData.append("budgetTier", formData.budgetTier || "");
    submitData.append("contactName", formData.contact.name);
    submitData.append("contactEmail", formData.contact.email);
    submitData.append("contactPhone", formData.contact.phone || "");
    submitData.append("preferredContact", formData.contact.preferredContact);
    submitData.append("additionalNotes", formData.additionalNotes);
    submitData.append("addOns", JSON.stringify(formData.addOns));
    submitData.append("source", typeof window !== "undefined" ? document.referrer : "");

    // Add files
    formData.files.forEach(file => {
      submitData.append("files", file);
    });

    try {
      const response = await fetch("/api/project-intake", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Submission failed");
      }

      setSuccess(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ 
        general: error instanceof Error ? error.message : "Submission failed. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Goal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="e.g., Build a booking site for handyman services that allows customers to schedule appointments and make payments online"
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isDeadlineFlexible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDeadlineFlexible: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">My deadline is flexible</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <FeatureSelector
              features={formData.features}
              onAdd={handleFeatureAdd}
              onRemove={handleFeatureRemove}
              suggestions={COMMON_FEATURES}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Requirements
              </label>
              <textarea
                value={formData.otherRequirements}
                onChange={(e) => setFormData(prev => ({ ...prev, otherRequirements: e.target.value }))}
                placeholder="Any specific technical requirements, integrations, or special considerations..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <BudgetSelector
            min={formData.budgetMin}
            max={formData.budgetMax}
            tier={formData.budgetTier}
            onChange={handleBudgetChange}
            error={errors.budgetRange}
          />
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.contact.name}
                  onChange={(e) => handleContactChange("name", e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method
              </label>
              <div className="space-y-2">
                {[
                  { value: "email", label: "Email" },
                  { value: "phone", label: "Phone" },
                  { value: "either", label: "Either is fine" }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="preferredContact"
                      value={option.value}
                      checked={formData.contact.preferredContact === option.value}
                      onChange={(e) => handleContactChange("preferredContact", e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Anything else we should know about your project?"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <FileUpload
              files={formData.files}
              onUpload={handleFileUpload}
              onRemove={handleFileRemove}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Optional Add-ons
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AVAILABLE_ADDONS.map(addOn => (
                  <label key={addOn} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.addOns.includes(addOn)}
                      onChange={() => handleAddOnToggle(addOn)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{addOn}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Review Your Submission</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Goal:</strong> {formData.goal}</p>
                <p><strong>Deadline:</strong> {formData.deadline} {formData.isDeadlineFlexible && "(flexible)"}</p>
                <p><strong>Features:</strong> {formData.features.map(f => f.text).join(", ") || "None specified"}</p>
                <p><strong>Budget:</strong> ${formData.budgetMin.toLocaleString()} - ${formData.budgetMax.toLocaleString()}</p>
                <p><strong>Contact:</strong> {formData.contact.email}</p>
                <p><strong>Files:</strong> {formData.files.length} attached</p>
                <p><strong>Add-ons:</strong> {formData.addOns.join(", ") || "None selected"}</p>
              </div>
            </div>

            <div>
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData(prev => ({ ...prev, consentGiven: e.target.checked }))}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to receive follow-up communication about my project request. 
                  We respect your privacy and will only use your information to provide 
                  project proposals and updates.
                </span>
              </label>
              {errors.consent && <p className="text-red-500 text-sm mt-1">{errors.consent}</p>}
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your project request. We&apos;ll review your requirements and 
            get back to you within 1 business day with tailored options.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We&apos;ll analyze your requirements and budget</li>
              <li>• Our team will prepare 2-3 tailored proposals</li>
              <li>• You&apos;ll receive detailed options via email</li>
              <li>• We can schedule a call to discuss any questions</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">Thanks for your web/app request!</h1>
        <p className="text-blue-100">
          Tell us your goal, deadline, pages/features, and budget. We&apos;ll follow up with tailored options.
        </p>
      </div>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} steps={steps} />

      {/* Form Content */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 text-sm">{steps[currentStep].description}</p>
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>

          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{submitting ? "Submitting..." : "Submit Request"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
