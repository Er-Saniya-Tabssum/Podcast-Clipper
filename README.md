# 🎙️ AI Podcast Clipper SaaS

<div align="center">

![AI Podcast Clipper](thumbnail.png)

[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen.svg)](https://github.com/devopsdeepaks/ai-podcast-clipper-saas)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.12-yellow)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)](https://fastapi.tiangolo.com)
[![Modal](https://img.shields.io/badge/Modal-GPU%20Processing-purple)](https://modal.com)

**Transform podcasts into viral clips with AI-powered precision**

</div>

---

## 🚀 Overview

A cutting-edge SaaS application that converts full-length podcasts into viral short-form clips optimized for YouTube Shorts and TikTok. This production-ready platform leverages advanced AI models for transcription, viral moment detection, and active speaker recognition to create engaging content automatically.

### 🎯 Perfect for:

- **Content Creators** looking to maximize their podcast reach
- **Marketing Teams** creating social media content
- **Developers** learning modern SaaS architecture
- **Entrepreneurs** building AI-powered businesses

## ✨ Features

### 🎬 **AI-Powered Content Creation**

- 🧠 **LLM-powered viral moment identification** with Gemini 2.5 Pro
- 🎯 **Active speaker detection** for intelligent video cropping (Junhua-Liao/LR-ASD)
- � **Advanced transcription** with m-bain/whisperX
- 🔊 **Automatic subtitle generation** for enhanced accessibility

### 🎞️ **Professional Video Processing**

- ⚡ **GPU-accelerated rendering** with FFMPEGCV on Modal
- 📱 **Vertical format optimization** for TikTok and YouTube Shorts
- 🎨 **Smart cropping** to focus on active speakers
- 🎵 **Audio enhancement** and synchronization

### 💼 **Enterprise-Ready SaaS Features**

- 👤 **Secure user authentication** with Auth.js
- 💳 **Credit-based billing system** with Stripe integration
- � **Credit validation** prevents uploads when balance is zero
- �📊 **Background job processing** with Inngest queues
- 🌐 **Scalable FastAPI backend** with serverless GPU processing
- 📱 **Responsive modern UI** built with Tailwind CSS & Shadcn UI
- 🎛️ **Intuitive dashboard** for upload management and clip viewing

### 🔧 **Technical Excellence**

- ⏱️ **Real-time processing updates** and progress tracking
- 🌐 **S3 integration** for reliable file storage
- 🚀 **Production-ready deployment** on Modal
- 📈 **Scalable architecture** handling concurrent users
- 🔒 **Secure payment processing** with webhook validation

## 🛠️ Tech Stack

<div align="center">

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Modal](https://img.shields.io/badge/Modal-purple?style=for-the-badge)

### AI & Processing

![OpenAI](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![WhisperX](https://img.shields.io/badge/WhisperX-FF6B6B?style=for-the-badge)
![FFMPEG](https://img.shields.io/badge/FFMPEG-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

### Infrastructure

![AWS S3](https://img.shields.io/badge/AWS_S3-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)
![Inngest](https://img.shields.io/badge/Inngest-6366f1?style=for-the-badge)

</div>

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.12+** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone --recurse-submodules https://github.com/Er-Saniya-Tabssum/Podcast-Clipper
cd ai-podcast-clipper-saas
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd ai-podcast-clipper-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate
# OR for macOS/Linux
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Clone LR-ASD model (if not already present)
git clone https://github.com/Junhua-Liao/LR-ASD.git asd

# Setup Modal
modal setup

# Deploy to Modal
modal deploy main.py
```

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend
cd ai-podcast-clipper-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 4️⃣ Queue Processing Setup

```bash
# In a new terminal, navigate to frontend
cd ai-podcast-clipper-frontend

# Start Inngest development server
npm run inngest-dev
```

### 5️⃣ Environment Configuration

Create `.env.local` in the frontend directory with your API keys:

```env
# Database
DATABASE_URL="your_database_url"

# Authentication
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"

# AWS S3
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="your_aws_region"
AWS_BUCKET_NAME="your_bucket_name"

# Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Inngest
INNGEST_EVENT_KEY="your_inngest_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"

# Modal
MODAL_ENDPOINT="your_modal_endpoint"
```

## ☁️ AWS S3 Configuration

### S3 Bucket CORS Policy

```json
[
  {
    "AllowedHeaders": ["Content-Type", "Content-Length", "Authorization"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### IAM User Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::your-bucket-name"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## 🤖 AI Setup

### Gemini API Key

Get your API key from [Google AI Studio](https://ai.google.dev/gemini-api/docs/quickstart?lang=python) and add it to your environment variables.

## 🎬 Demo Content

The following videos were used for testing and demonstration:

- [MI6 Secret Agent Talks About the World's Darkest Secrets](https://www.youtube.com/watch?v=-vMgbJ6WqN4)
- [Janney Sanchez | Therapy saved my life](https://www.youtube.com/watch?v=SOG0GmKts_I)

## 📱 Application Usage

1. **Sign up/Login** to your account
2. **Upload** your podcast or video file
3. **Wait** for AI processing (transcription, moment detection, speaker analysis)
4. **Download** your viral clips optimized for social media
5. **Manage** your credits and billing through the dashboard

## 🏗️ Architecture Overview

```
Frontend (Next.js) → API Routes → Inngest Queue → Modal (GPU Processing) → S3 Storage
                  ↓
            Stripe Payments & User Auth → Database → Real-time Updates
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Developed By

**Saniya Tabssum**

- GitHub: [@devopsdeepaks](https://github.com/Er-Saniya-Tabssum/Podcast-Clipper)

---

<div align="center">

</div>
