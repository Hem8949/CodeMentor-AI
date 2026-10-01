# 🧑‍💻 CodeMentor AI — Personal Coding Mentor

> **An AI-powered personal coding mentor that adapts hints, explanations, debugging help, and practice to each learner.**

CodeMentor AI is a personalized AI coding mentor designed to help developers **learn how to think through coding problems instead of simply copying solutions**.

The system remembers the learner's **skill level, preferred programming language, previous attempts, hint usage, and recurring weak concepts**, then uses this context to personalize future guidance.

---

## 🎯 Problem Statement

Learning to code often breaks down in three areas:

1. **Generic AI assistance**  
   Beginners may receive explanations that are too advanced or complete solutions that encourage copying instead of understanding.

2. **Debugging difficulties**  
   When code fails, developers often receive cryptic error messages or AI-generated rewritten code without understanding why the error happened.

3. **Lack of personalized mentorship**  
   Traditional tutorials and static practice resources do not continuously adapt to an individual's skill level, mistakes, and learning progress.

There is a need for a coding assistant that behaves more like a **personal mentor** rather than a simple code generator.

---

# 💡 Our Solution

## CodeMentor AI

CodeMentor AI combines **personalized AI tutoring, guided debugging, code improvement, and coding practice** into one platform.

Instead of immediately giving the answer, the AI mentor encourages the learner to reason about the problem.

### Core learning philosophy

> **Don't just understand code when you see it. Learn how to figure out how to start.**

The mentor progressively increases assistance only when the learner remains stuck.

---

# ✨ Key Features

## 1. 🧠 Personal AI Coding Mentor

The AI adapts its guidance according to the learner's:

- Skill level
- Preferred programming language
- Previous attempts
- Hint usage
- Recurring mistakes
- Weak concepts
- Learning history

The mentor does not automatically reveal the complete solution.

### Mentor modes

- 💡 **Give Hint**
- 🧠 **Explain Concept**
- 🐛 **Help Debug**
- 🔍 **Review My Approach**
- 🔥 **Give Similar Problem**
- ✅ **Show Solution**

The **Show Solution** option is intentionally not the default learning path.

---

## 2. 🐛 Code Doctor — Debug & Improve

CodeMentor AI helps users understand and improve their code.

### Debug Mode

Instead of simply rewriting broken code, the AI:

1. Identifies the problem
2. Explains why the problem occurs
3. Guides the learner toward the fix
4. Helps the learner understand the underlying concept

### Improve Mode

For working code, the AI can help identify ways to make the code:

- Cleaner
- More readable
- Better structured
- More efficient

---

## 3. 💻 Code Playground

The **Code Playground** provides a dedicated environment for coding practice.

### Workflow

```text
Choose Problem
      ↓
Write Code
      ↓
Run Code
      ↓
Get Result
      ↓
Ask AI Mentor
      ↓
Improve
      ↓
Try Again
```

This connects coding practice directly with AI mentorship.

---

## 4. 📊 Personalized Progress Tracking

The system tracks the learner's coding journey.

It can maintain:

- Problems attempted
- Problems solved
- Hint usage
- Previous attempts
- Recurring weak concepts
- Learning progress
- Coding history

This information is used to make future AI interactions more personalized.

---

# 🔄 Personalized AI Learning Loop

```text
                USER
                  │
                  ▼
          Choose / Solve Problem
                  │
                  ▼
             Write Code
                  │
                  ▼
              Run Code
                  │
          ┌───────┴────────┐
          │                │
       Success           Error
          │                │
          ▼                ▼
       Continue       Code Doctor
                           │
                           ▼
                      AI Guidance
                           │
                           ▼
                     Try Again
                           │
                           ▼
                    Save Attempt
                           │
                           ▼
                Update Learning Data
                           │
                           ▼
              Future AI Personalization
```

---

# 🧠 Socratic AI Mentoring

The mentor follows a progressive learning approach.

When appropriate, responses use:

```text
🎯 What do you know?
[Question about the learner's current understanding]

💡 Hint
[Small conceptual hint]

🧠 Your turn
[What the learner should try next]
```

The goal is to reduce dependency on AI-generated solutions and encourage independent problem solving.

If a learner uses an approach that will not work, the mentor can explain:

> **"That approach won't work because..."**

and then guide the learner toward understanding why.

---

# 🏗️ System Architecture

```text
                         USER
                           │
                           ▼
                 React + Vite Frontend
                           │
                           ▼
                    Express Backend
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          PostgreSQL     Gemini AI    Authentication
              │            │            │
              └────────────┼────────────┘
                           ▼
                  Personalized Context
                           │
                           ▼
                    AI Mentor Response
                           │
                           ▼
                         USER
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

## Backend

- Node.js
- Express
- TypeScript

## Database

- PostgreSQL
- Drizzle ORM

## AI

- Google Gemini API

## Authentication & Security

- JWT
- bcrypt
- Zod validation
- Protected API routes
- Per-user data isolation

## Development

- pnpm
- Git
- GitHub
- Replit

---

# 📊 Database

The application stores learning-related information so that AI responses can become increasingly personalized.

### Main data

```text
Users
   │
   ├── Profile
   │     ├── Skill Level
   │     └── Preferred Language
   │
   ├── Coding Problems
   │
   ├── Attempts
   │
   └── Weak Concepts
```

The system tracks:

- User profiles
- Coding problems
- Attempts
- Solved problems
- Weak concepts
- Learning history

User data remains scoped to the authenticated user.

---

# 🔐 Authentication & Security

CodeMentor AI includes:

- Password hashing using bcrypt
- JWT-based authentication
- Protected backend routes
- Per-user data isolation
- Backend-only Gemini API key
- Input validation using Zod
- No plaintext password storage

The Gemini API key is never exposed to the frontend.

---

# 🌐 Supported Languages

The current project is designed around multiple programming languages, including:

- JavaScript
- Python
- Java
- C++
- C
- TypeScript

---

# 📝 Coding Practice

The project includes a collection of coding problems for structured practice.

### Current workflow

```text
Problem
  ↓
Analyze
  ↓
Write Code
  ↓
Run
  ↓
Debug / Review
  ↓
AI Mentor
  ↓
Try Again
  ↓
Track Progress
```

---

# 📄 Application Pages

The application includes:

### 🏠 Landing
Introduction to CodeMentor AI.

### 🔐 Login / Register
User authentication.

### 📊 Dashboard
Shows learning progress, completion information, statistics, and weak areas.

### 💻 Practice Workspace
Coding problem + code editor + execution + AI mentoring.

### 🩺 Code Doctor
Debug and improve code with AI guidance.

### 📚 History
Review previous coding attempts and learning activity.

---

# 🚀 Getting Started

## Prerequisites

- Node.js
- pnpm
- PostgreSQL database
- Google AI Studio / Gemini API key

---

## 1. Clone the Repository

```bash
git clone https://github.com/ashish-jagdale-ai/CodeMentor-AI.git

cd CodeMentor-AI
```

---

## 2. Install Dependencies

```bash
pnpm install
```

---

## 3. Configure Environment Variables

Add the required environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_postgresql_database_url
```

> Never commit secret keys or `.env` files to GitHub.

---

## 4. Run the Application

Start the development environment using the project's configured pnpm workflow.

```bash
pnpm dev
```

---

# 🤖 AI Integration

Google Gemini powers the AI mentoring system.

The AI receives relevant learner context such as:

```text
Skill Level
Preferred Language
Current Problem
Current Code
Previous Attempts
Previous Errors
Hint Usage
Weak Concepts
```

This context allows the mentor to generate responses that are more relevant to the individual learner.

---

# 🎯 Personalization Example

### Learner A

```text
Skill Level: Beginner
Language: Python
Weak Concept: Loops
Previous Mistake: Incorrect loop condition
```

The AI can provide a simpler explanation and focus on the learner's recurring difficulty.

### Learner B

```text
Skill Level: Advanced
Language: C++
Weak Concept: None identified
```

The AI can provide more advanced reasoning and code-quality feedback.

The goal is for the **same problem to produce different guidance depending on the learner's context**.

---

# 🔥 Why CodeMentor AI?

Traditional coding resources generally follow:

```text
Tutorial → Practice → Solution
```

CodeMentor AI focuses on:

```text
Practice
   ↓
Attempt
   ↓
Mistake
   ↓
Personalized Guidance
   ↓
Understand
   ↓
Improve
   ↓
Try Again
```

The goal is not simply to generate code.

The goal is to help learners **develop problem-solving ability**.

---

# 🧪 Testing

Important workflows to test:

- Registration
- Login
- Logout
- Protected routes
- Problem selection
- Code writing
- Code execution
- AI hints
- Concept explanation
- Debugging
- Code review
- Similar problems
- Explicit solution request
- Attempt history
- Progress tracking
- Weak-concept tracking
- User data isolation

---

# 🌐 Links

### GitHub

https://github.com/Hem8949/CodeMentor-AI

### Live Demo

https://code-mentor-ai--pancholihem535.replit.app

### Demo Video

https://drive.google.com/file/d/1EDSsd08m7TB38UqCyJQD-kAoPOljrAVv/view?usp=sharing

---

# 🏆 Hackathon

### BUILD_TO_SHIP HACKATHON 2026

**Theme:** Personalized AI Experiences

CodeMentor AI addresses the theme by using a learner's **skill level, preferred language, previous attempts, mistakes, hint usage, and weak concepts** to adapt the AI mentoring experience.

---

# 👨‍💻 Built By

**ASHISH and Team**

> ASHISH JAGDALE, HEM PANCHOLI, OM SHIGNE.

---

## 📌 Project Vision

> **CodeMentor AI is not just an AI that writes code.  
> It is an AI mentor that helps you learn how to think, debug, and improve.**
