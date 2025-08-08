# 🎙️ AI Podcast Clipper - Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.0-61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)

**Modern React frontend for AI-powered podcast clip generation**

</div>

---

## 🚀 Overview

The frontend application for AI Podcast Clipper SaaS - a cutting-edge React/Next.js interface that provides users with an intuitive dashboard to upload podcasts and manage AI-generated clips. Built with modern web technologies and integrated with powerful AI models for seamless content creation.

## 🏗️ Architecture

### **Tech Stack**

- **Framework**: Next.js 15.0 with App Router
- **Language**: TypeScript 5.0 for type safety
- **Styling**: Tailwind CSS + Shadcn UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth) with Google OAuth
- **Payments**: Stripe integration for credit-based billing
- **Background Jobs**: Inngest for queue processing
- **File Storage**: AWS S3 for video/clip storage
- **Deployment**: Vercel-ready configuration

### **Key Features**

- 🔐 **Secure Authentication** - OAuth with session management
- 💳 **Credit System** - Stripe-powered billing with usage tracking
- 📊 **Real-time Dashboard** - Upload management and progress tracking
- 🎬 **Clip Management** - View, download, and organize generated clips
- 📱 **Responsive Design** - Mobile-first UI with dark/light themes
- ⚡ **Background Processing** - Async video processing with status updates

## 🤖 AI Models Integration

The frontend interfaces with several advanced AI models through our backend API:

### **🧠 Language Models**

- **Gemini 2.5 Pro** - Powers viral moment detection and content analysis
  - Identifies engaging segments from podcast transcripts
  - Analyzes conversation flow and audience engagement potential
  - Generates clip titles and descriptions

### **🎙️ Audio Processing**

- **WhisperX** (m-bain/whisperX) - Advanced speech-to-text transcription
  - High-accuracy transcription with speaker diarization
  - Precise timestamp extraction for clip boundaries
  - Multi-language support with enhanced performance

### **👥 Computer Vision**

- **LR-ASD** (Junhua-Liao/LR-ASD) - Active Speaker Detection
  - Identifies who is speaking at any given moment
  - Enables intelligent video cropping and framing
  - Optimizes visual focus for vertical video formats

### **🎬 Video Processing**

- **FFMPEG with GPU acceleration** - Professional video rendering
  - Converts horizontal videos to vertical format (9:16)
  - Adds dynamic subtitles with custom styling
  - Optimizes output for TikTok and YouTube Shorts

## 📁 Project Structure

```
ai-podcast-clipper-frontend/
├── 📱 src/
│   ├── 🎛️ app/                    # Next.js App Router pages
│   │   ├── dashboard/             # Main dashboard interface
│   │   ├── billing/               # Stripe billing pages
│   │   └── auth/                  # Authentication pages
│   ├── 🧩 components/             # Reusable UI components
│   │   ├── ui/                    # Shadcn UI components
│   │   ├── dashboard-client.tsx   # Main dashboard interface
│   │   ├── nav-header.tsx         # Navigation with credits
│   │   └── clip-display.tsx       # Clip management interface
│   ├── ⚡ actions/                # Server actions
│   │   ├── auth.ts                # User authentication logic
│   │   ├── s3.ts                  # File upload handling
│   │   └── generation.ts          # Video processing triggers
│   ├── 🔄 inngest/                # Background job functions
│   │   └── functions.ts           # Video processing queue
│   └── 🗄️ lib/                    # Utilities and configurations
│       ├── auth.ts                # Auth.js configuration
│       ├── db.ts                  # Prisma database client
│       └── stripe.ts              # Stripe payment integration
├── 📊 prisma/                     # Database schema and migrations
├── 🎨 tailwind.config.js          # Tailwind CSS configuration
└── ⚙️ next.config.js              # Next.js configuration
```

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm/yarn
- PostgreSQL database
- AWS S3 bucket for file storage
- Stripe account for payments
- Google OAuth application

### **Environment Variables**

Create a `.env.local` file in the frontend directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/podcast_clipper"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="your-bucket-name"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Backend API
MODAL_ENDPOINT="your-modal-backend-endpoint"
```

### **Installation & Setup**

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

## 🎯 Key Components

### **Dashboard Client (`components/dashboard-client.tsx`)**

- Main interface for file uploads and clip management
- Drag-and-drop file upload with validation
- Real-time processing status updates
- Credit balance monitoring and warnings

### **Authentication (`lib/auth.ts`)**

- Google OAuth integration with Auth.js
- Automatic user creation and session management
- Protected route middleware

### **Background Processing (`inngest/functions.ts`)**

- Handles video processing queue
- Monitors job status and updates database
- Error handling and retry logic

### **Credit System**

- Stripe integration for payment processing
- Usage-based billing with credit deduction
- Upload prevention when credits are zero

## 🔒 Security Features

- **CSRF Protection** - Built-in Next.js security
- **Input Validation** - Server-side validation for all inputs
- **Authentication** - Secure OAuth with session management
- **File Upload Security** - S3 signed URLs with type validation
- **Credit Validation** - Multi-layer credit checking

## 📱 Responsive Design

- **Mobile-First** - Optimized for mobile devices
- **Dark/Light Theme** - User preference support
- **Progressive Web App** - PWA-ready configuration
- **Accessibility** - WCAG 2.1 compliant components

## 🚀 Deployment

### **Vercel Deployment**

```bash
# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
# Set up custom domain and SSL
```

### **Production Considerations**

- Enable database connection pooling
- Configure CDN for static assets
- Set up monitoring and error tracking
- Implement rate limiting for API routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Submit a pull request

## 📚 API Integration

The frontend communicates with the backend through:

- **Server Actions** - Type-safe server-side functions
- **Inngest Events** - Background job triggers
- **Stripe Webhooks** - Payment status updates
- **S3 Direct Upload** - Secure file upload flow

---

<div align="center">

**Built with ❤️ using modern React ecosystem**

Part of the [AI Podcast Clipper SaaS](../README.md) project

</div>
