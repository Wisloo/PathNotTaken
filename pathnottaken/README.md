# PathNotTaken 🛤️

A web-based career exploration application that uses AI to recommend **alternative career paths** based on your skills and interests. Rather than focusing only on common or popular careers, the system highlights non-obvious options and explains how your existing skills align with them.

## Features

- **Skill & Interest Assessment** – Input your skills, interests, and background
- **AI-Powered Recommendations** – Get non-obvious career suggestions with match explanations
- **Skill Gap Analysis** – See what skills you need to develop for each path
- **Career Details** – Salary ranges, growth outlook, and day-to-day descriptions
- **Personalized Roadmaps** – Step-by-step plans to transition into recommended careers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI | OpenAI API (GPT) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional – works with built-in recommendations without it)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Add your OpenAI API key if desired
npm run dev
```

Backend runs on **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

## Project Structure

```
PathNotTaken/
├── frontend/           # Next.js application
│   ├── src/app/        # App Router pages
│   ├── src/components/ # React components
│   └── src/lib/        # API utilities
├── backend/            # Express.js API
│   ├── src/routes/     # API endpoints
│   ├── src/services/   # AI & recommendation logic
│   └── src/data/       # Career database
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/careers/recommend` | Get career recommendations based on skills/interests |
| GET | `/api/careers/all` | List all careers in the database |
| GET | `/api/careers/:id` | Get details for a specific career |
| GET | `/api/skills/categories` | Get skill categories for the form |

## License

MIT
