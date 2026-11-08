

---

TECHNICAL REQUIREMENTS DOCUMENT (TRD)

Project Name: Bidya Guru

Project Type

Desktop-First AI-Powered Web Application

Version

1.0


---

1. Project Overview

Bidya Guru is a software-only, AI-powered, multilingual voice career and communication guidance platform for students.

The student will first create an account and securely log in using email and password.

After login, the student can communicate naturally with Bidya Guru AI through voice.

The system will understand the student's:

- Preferred career field
- Career goal
- Current skills
- Knowledge level

Based on this information, the system will generate a personalized career roadmap.

The application will also provide a Communication Practice feature where students can practice speaking with AI and receive feedback.

The application is designed as a clean, simple, professional, desktop-first web application.


---

2. Final Technology Stack

Frontend

React.js

React will be used for:

- Desktop web application UI
- Authentication pages
- Dashboard
- Voice-to-voice conversation interface
- Career profile
- Career roadmap
- Communication practice
- Progress tracking


---

Backend

Node.js + Express.js

The backend will handle:

- Authentication
- Authorization
- API creation
- Business logic
- Gnani API integration
- Gemini API integration
- MongoDB communication
- Security middleware


---

Database

MongoDB Atlas

MongoDB Atlas will store:

- User information
- Career goals
- Student skills
- Career profiles
- Personalized roadmaps
- Roadmap progress
- Communication practice history
- AI feedback
- Authentication/session-related information


---

Voice Technology

Gnani API

Gnani will be the primary voice technology used in the project.

Since this project is being developed for a Gnani internship, Gnani integration will be an important part of the project.

Gnani will be used for the available voice/speech capabilities, such as:

- Student voice processing
- Speech-to-Text
- Voice interaction
- Text-to-Speech / AI voice response

The exact implementation will depend on the Gnani APIs available for the internship account and official documentation.


---

AI Technology

Gemini API

Gemini will act as the AI intelligence layer.

Gemini will be used for:

- Understanding career goals
- Understanding career fields
- Skill analysis
- Skill gap understanding
- Personalized career roadmap generation
- Career guidance
- Communication answer analysis
- Communication feedback


---

3. Core Project Features

3.1 Secure User Authentication

The user will first:

1. Register using email and password.
2. Verify their email.
3. Log in securely.
4. Access the protected application dashboard.

Authentication features:

- Email and password signup
- Secure login
- Email verification
- Forgot password
- Reset password
- Logout
- Protected routes
- Protected APIs


---

4. Authentication Security

Password Hashing

Passwords will never be stored as plain text.

Technology:

Argon2

Flow:

User Password
      ↓
Argon2 Hashing
      ↓
Password Hash
      ↓
MongoDB Atlas


---

JWT Authentication

The application will use:

- Short-lived Access Token
- Longer-lived Refresh Token

Flow:

User Login
     ↓
Access Token
     +
Refresh Token
     ↓
Secure Authentication


---

Secure Cookies

Authentication tokens will use:

- HttpOnly cookies
- Secure cookies in production
- Appropriate SameSite protection

This helps protect authentication tokens from direct JavaScript access.


---

Email Verification

Signup
   ↓
Verification Token
   ↓
Email Verification
   ↓
Account Verified


---

Password Reset

Forgot Password
      ↓
Secure Reset Token
      ↓
Verification / Reset Link
      ↓
New Password
      ↓
Old Reset Token Invalid

Reset tokens will have an expiry time.


---

5. Security Requirements

The web application must be secure and scalable.

Security technologies:

Helmet

Used for security-related HTTP headers.

CORS

Only trusted frontend domains will be allowed to access the backend.

Rate Limiting

Used to protect against:

- Brute-force login attacks
- Excessive API requests
- API abuse

Authentication endpoints will have stricter limits.


---

Input Validation

All important backend inputs will be validated.

Recommended technology:

Zod

Validation will be applied to:

- Registration
- Login
- Password reset
- User profile updates
- API requests


---

Environment Variables

Sensitive values will be stored in .env.

Example:

NODE_ENV=development
PORT=5000

CLIENT_URL=

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GEMINI_API_KEY=

GNANI_API_KEY=

EMAIL_PROVIDER_KEY=

The .env file will be added to:

.gitignore

API keys and secrets will never be pushed to GitHub.


---

6. Main User Flow

Student Opens Bidya Guru
            ↓
      Register/Login
            ↓
      Email Verification
            ↓
          Dashboard
            ↓
     Talk with Bidya Guru
            ↓
   Voice-to-Voice Conversation
            ↓
 AI Understands Student Language
            ↓
 Understand Career Goal & Skills
            ↓
   Gemini Generates Career Analysis
            ↓
 Personalized Career Roadmap
            ↓
      Student Tracks Progress
            ↓
 Communication Practice with AI
            ↓
      AI Gives Feedback


---

7. Voice-to-Voice AI Conversation

This is one of the main features of Bidya Guru.

The student and AI will communicate using voice.

Flow:

Student Speaks 🎤
       ↓
Gnani Speech Processing
       ↓
Speech converted/processed
       ↓
Gemini AI Understanding 🧠
       ↓
AI Generates Response
       ↓
Gnani Voice Output 🔊
       ↓
Student Hears AI Response

The UI should clearly show:

- Listening
- Processing
- AI Speaking


---

8. Multilingual Support

The planned MVP languages are:

- Odia
- Hindi
- English

Example:

Student in Odia

> Mu Web Development field ku jiba ku chahunchi.



Student in Hindi

> Mujhe Web Development mein jana hai.



Student in English

> I want to become a Web Developer.



The AI should understand the student's intended meaning and provide guidance.

The exact language support will be verified based on the available Gnani API capabilities.


---

9. Career Field Detection

When the student first talks with Bidya Guru, AI will understand:

- Which field the student wants to enter
- Career interests
- Career goal

Example:

Student:
"I want to become a Full Stack Developer."

AI Career Goal:
Full Stack Developer

If the student is confused, the AI can ask guiding questions.


---

10. Student Skill Understanding

The AI will ask the student about their current knowledge and skills.

Example:

Target Career:
Full Stack Developer

Current Skills:
✓ HTML
✓ CSS
✓ JavaScript

Skills to Learn:
✗ React
✗ Node.js
✗ Express.js
✗ MongoDB

Gemini will help organize the student's information into:

- Known Skills
- Developing Skills
- Skills to Learn

The student should be able to review or edit this information.


---

11. Personalized Career Roadmap

Gemini will generate a personalized roadmap based on:

- Student career goal
- Current skills
- Knowledge level

Example:

HTML
  ↓
CSS
  ↓
JavaScript
  ↓
React
  ↓
Node.js
  ↓
Express.js
  ↓
MongoDB
  ↓
Projects

Each roadmap item will have a status:

- Locked
- In Progress
- Completed

The roadmap will be saved in MongoDB Atlas.


---

12. AI Career Guidance

The student can ask career-related questions through voice.

Example:

> "What should I learn after JavaScript?"



The system flow:

Student Voice
      ↓
Gnani
      ↓
Gemini AI
      ↓
Career Guidance Response
      ↓
Gnani Voice Output

The AI should provide simple and student-friendly guidance.


---

13. Communication Practice Feature

Students can practice communication with Bidya Guru.

The AI will provide a speaking question.

Example:

> "Tell me about yourself."



The student answers through voice.

Example flow:

AI Speaking Prompt
        ↓
Student Speaks
        ↓
Gnani Processes Voice
        ↓
Transcript Generated
        ↓
Gemini Analyzes Answer
        ↓
Feedback Generated


---

14. Communication Feedback

Gemini will analyze:

- Answer relevance
- Clarity
- Answer structure
- Areas for improvement
- Communication suggestions

Example:

Strength:
Your answer was clear.

Improvement:
Try to structure your introduction better.

Suggestion:
Start with your name, education,
skills, and career goal.

The student can:

- Practice again
- View previous feedback
- Track improvement

⚠️ Speech metrics such as filler words or pronunciation scores should only be included if the selected Gnani/speech pipeline can reliably provide the required data.


---

15. Progress Tracking

The Progress section will display:

Career Roadmap Progress

Example:

Completed: 4 / 10 Skills
Progress: 40%

Communication Practice

Show:

- Number of practice sessions
- Recent feedback
- Improvement history

The dashboard should remain simple and clean.


---

16. UI/UX Requirements

The application will be:

Desktop-First Web Application

Design requirements:

- Clean UI
- Modern design
- Minimal design
- Professional appearance
- Student-friendly
- Spacious layout
- Good whitespace
- Clear typography
- Soft rounded cards
- Subtle shadows
- No unnecessary clutter

The design must be original.

The previously provided image is only for general inspiration regarding cleanliness and professional visual quality. No layout, branding, component, or visual element should be copied.


---

17. Main Navigation

Desktop sidebar:

🎓 Bidya Guru

🏠 Dashboard

🎙 Talk with AI

🎯 Career Profile

🛣 Career Roadmap

🗣 Communication Practice

📊 Progress

⚙ Settings


---

18. Dashboard Requirements

The dashboard will show:

Hello, [Student Name] 👋

Main information:

- Current Career Goal
- Current Skills
- Roadmap Progress
- Communication Practice Progress

The main CTA will be:

🎙 Talk with Bidya Guru

This should be visually prominent.


---

19. Talk with AI Screen

This is the main product experience.

The screen should include:

- Bidya Guru AI visual/avatar
- Conversation transcript
- Large microphone button
- Voice waveform
- Listening state
- Processing state
- Speaking state
- Language indicator

Supported planned languages:

Odia • Hindi • English


---

20. Career Profile Screen

The screen will display:

Career Goal

Example:

Full Stack Developer

Current Skills

HTML
CSS
JavaScript

Skills to Learn

React
Node.js
Express.js
MongoDB

The student can update their profile.


---

21. Career Roadmap Screen

The roadmap should visually display the student's journey.

Each roadmap step includes:

- Skill name
- Status
- Progress

Example:

✓ HTML

✓ CSS

🟡 JavaScript

🔒 React

🔒 Node.js


---

22. Communication Practice Screen

The screen will include:

- AI speaking prompt
- Voice interaction
- Microphone button
- Student response
- AI feedback
- Practice Again button

The UI should remain focused and distraction-free.


---

23. Progress Screen

Show:

- Overall roadmap progress
- Completed skills
- Remaining skills
- Communication practice history
- Recent activities

Avoid overly complicated charts.


---

24. Backend Architecture

Recommended structure:

backend/

│
├── src/
│
│   ├── config/
│
│   ├── controllers/
│
│   ├── services/
│
│   ├── models/
│
│   ├── routes/
│
│   ├── middleware/
│
│   ├── validators/
│
│   ├── utils/
│
│   ├── integrations/
│   │
│   ├── gnani/
│   │
│   └── gemini/
│
│   └── app.js
│
├── server.js
│
├── package.json
│
└── .env


---

25. Backend Layer Responsibilities

Controllers

Handle:

- Request
- Response

Controllers should not contain large business logic.


---

Services

Handle:

- Business logic
- AI processing
- Gnani integration
- Gemini integration


---

Models

Handle MongoDB data structures.


---

Routes

Define API endpoints.


---

Middleware

Handle:

- Authentication
- Authorization
- Error handling
- Validation
- Rate limiting


---

26. Database Design

User Collection

User
│
├── name
├── email
├── passwordHash
├── emailVerified
├── createdAt
└── updatedAt


---

Career Profile Collection

CareerProfile
│
├── userId
├── targetField
├── careerGoal
├── knownSkills
├── developingSkills
├── skillsToLearn
├── languagePreference
├── createdAt
└── updatedAt


---

Roadmap Collection

Roadmap
│
├── userId
├── careerProfileId
├── title
├── roadmapItems
│
│   ├── skill
│   ├── status
│   └── order
│
├── version
├── createdAt
└── updatedAt


---

Communication Practice Collection

CommunicationPractice
│
├── userId
├── prompt
├── transcript
├── feedback
├── createdAt
└── updatedAt


---

27. API Design

Authentication APIs

POST /api/v1/auth/register

POST /api/v1/auth/verify-email

POST /api/v1/auth/login

POST /api/v1/auth/refresh

POST /api/v1/auth/logout

POST /api/v1/auth/forgot-password

POST /api/v1/auth/reset-password


---

User APIs

GET /api/v1/me

PUT /api/v1/me


---

Career APIs

POST /api/v1/career/analyze

GET /api/v1/career/profile


---

Roadmap APIs

POST /api/v1/roadmaps/generate

GET /api/v1/roadmaps/current

PATCH /api/v1/roadmaps/items/:itemId


---

Communication APIs

POST /api/v1/communication/practice

POST /api/v1/communication/feedback


---

Progress API

GET /api/v1/progress/summary


---

28. Scalability Requirements

The project should be designed to scale.

Backend

- Modular architecture
- Stateless APIs where practical
- Service-based logic
- API versioning

Database

Use indexes for:

- Email
- User ID
- Frequently queried data

AI Integration

Keep Gnani and Gemini integrations separated.

integrations/

├── gnani/
│
└── gemini/

This makes future provider changes easier.


---

29. Error Handling

Use centralized error handling.

The system should handle:

- Invalid requests
- Authentication errors
- Authorization errors
- MongoDB errors
- Gnani API failures
- Gemini API failures

The frontend should show user-friendly messages.

Example:

Unable to process your voice right now.

Please try again.


---

30. Production Security Checklist

Before deployment:

✓ HTTPS enabled

✓ Password hashing

✓ Secure cookies

✓ JWT access + refresh tokens

✓ Email verification

✓ Rate limiting

✓ Helmet

✓ CORS restrictions

✓ Input validation

✓ Protected APIs

✓ Environment variables

✓ .env in .gitignore

✓ MongoDB secure credentials

✓ No API keys exposed to frontend


---

31. Development Phases

Phase 1 — Project Setup

- React frontend
- Node.js backend
- Express setup
- MongoDB Atlas connection
- Basic UI


---

Phase 2 — Authentication

- Signup
- Login
- Password hashing
- JWT
- Refresh token
- Email verification
- Forgot password


---

Phase 3 — Gnani Integration

- Microphone access
- Voice processing
- Speech-to-Text
- Voice output integration based on available Gnani APIs


---

Phase 4 — Gemini Career Intelligence

- Career field detection
- Skill understanding
- Career analysis


---

Phase 5 — Career Roadmap

- Generate roadmap
- Save to MongoDB
- Display roadmap
- Update progress


---

Phase 6 — Communication Practice

- AI prompts
- Student voice response
- Speech processing
- Gemini feedback
- Practice history


---

Phase 7 — Testing and Deployment

- Security testing
- API testing
- End-to-end testing
- Provider failure testing
- Final UI polish
- Hackathon/internship demo preparation


---

32. Final System Architecture

┌───────────────────────┐
                │    React Frontend     │
                │  Desktop Web App 🖥️   │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Node.js + Express   │
                │      Backend         │
                └──────┬───────┬────────┘
                       │       │
             ┌─────────▼──┐ ┌──▼──────────┐
             │ MongoDB    │ │ Integrations│
             │ Atlas      │ └──┬───────┬──┘
             └────────────┘    │       │
                          ┌────▼───┐ ┌─▼───────┐
                          │ Gnani  │ │ Gemini  │
                          │ Voice  │ │ AI Brain│
                          └────────┘ └─────────┘


---

33. Final Technology Responsibility

Technology	Responsibility

React.js	Frontend UI
Node.js	Backend runtime
Express.js	Backend APIs
MongoDB Atlas	Database
Gnani API	Voice/Speech integration
Gemini API	Career AI and communication intelligence
Argon2	Password hashing
JWT	Authentication tokens
HttpOnly Cookies	Secure token storage
Helmet	Security headers
CORS	Trusted origin control
Rate Limiting	API abuse protection
Zod	Input validation



---

34. Final Project Summary

Bidya Guru is a secure, scalable, desktop-first AI web application that allows students to:

🎤 Talk with AI using voice

🌐 Use Odia, Hindi and English

🎯 Discover or define their career goal

🧠 Understand their current skills

🛣️ Receive a personalized career roadmap

🔊 Get AI guidance through voice

🗣️ Practice communication skills

📊 Track their learning and practice progress

🔐 Use a secure email/password authentication system


---

🏆 Core Technology Flow

Student 🎤
    ↓
Gnani Voice Technology
    ↓
Node.js + Express Backend
    ↓
Gemini AI 🧠
    ↓
MongoDB Atlas 🗄️
    ↓
Personalized Response
    ↓
Gnani Voice Output 🔊
    ↓
Student

