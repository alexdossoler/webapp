<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Project Intake Form - Custom Copilot Instructions

This is a Next.js TypeScript project for a sophisticated project intake form application.

## Project Context
- Built with Next.js 14+ App Router, TypeScript, and Tailwind CSS
- Features a progressive, multi-step intake form for web/app project requests
- Includes file upload capabilities, form validation, and progress saving
- Uses modern React patterns with hooks and functional components
- API routes handle form submissions and file processing

## Code Style Preferences
- Use TypeScript with strict type checking
- Prefer functional components with React hooks
- Use Tailwind CSS for styling with responsive design principles
- Follow Next.js App Router conventions
- Use `const` for components and prefer arrow functions
- Include proper error handling and loading states
- Implement accessibility best practices (ARIA labels, keyboard navigation)
- Use semantic HTML elements

## Project Features
- Progressive intake form with steps: Goal, Deadline, Scope, Budget, Contact, Files, Add-ons
- Real-time form validation with user-friendly error messages
- Local storage for progress saving
- File upload with drag-and-drop support
- Dynamic feature tagging system
- Budget range slider with preset tiers
- Success/error state management
- Mobile-responsive design
- Clean, modern UI inspired by n8n's design principles

## API Design
- RESTful API routes using Next.js App Router
- Multipart form data handling for file uploads
- Proper HTTP status codes and error responses
- Input validation and sanitization
- File storage and management

## Development Practices
- Write clean, maintainable, and well-documented code
- Include TypeScript interfaces for all data structures
- Use environment variables for configuration
- Implement proper error boundaries and fallbacks
- Follow React best practices for performance and re-renders
