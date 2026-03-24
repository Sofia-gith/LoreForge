# LoreForge

> An AI-powered assistant for fiction writers — build worlds, stay consistent, write better.

---

## What is LoreForge?

LoreForge is a creative writing assistant designed for fiction authors. It combines two powerful tools in one place:

- **Worldbuilder** — a conversational AI that helps you create and expand fictional worlds: cultures, history, geography, magic systems, politics, and more. Everything you build is saved in a structured "grimoire" that grows with your story.

- **Writing Coach** — an AI reviewer that reads your text and checks it against your world's rules. Did a character use technology that doesn't exist in your world? Are your sentences too long? Is the dialogue feeling stiff? LoreForge will tell you.

---

## Who is it for?

Writers who want a creative partner that actually *knows their world* — not a generic AI that forgets everything between sessions.

---

## 🔧  Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go |
| AI | Gemini API |
| Frontend | Next.js |
| Storage | JSON (world grimoire) |
| Deploy | Railway (API) + Vercel (frontend) |

---

## Test

- testing my skills to do automation and AI

---

## Getting Started

### Prerequisites

- [Go 1.25+](https://golang.org/dl/)
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- A [Gemini API key](https://aistudio.google.com/)

### Backend

```bash
# Clone the repository
git clone https://github.com/Sofia-gith/LoreForge.git
cd LoreForge/Backend

# Install dependencies
go mod tidy

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run the server
go run cmd/server/main.go
```

The API will be available at `http://localhost:8080`.

### Backend with Docker

```bash
cd LoreForge/Backend
docker build -t loreforge .
docker run -p 8080:8080 --env-file .env loreforge
```

### Frontend

```bash
cd LoreForge/frontend

# Install dependencies
pnpm install

# Run the dev server
pnpm dev
```

The app will be available at `http://localhost:3000`.

---

## Status

 In development — built for [Hack Trek 2026](https://hack-trek.devpost.com/)

---

## Author

Made with ☕ and Go by Sofia.