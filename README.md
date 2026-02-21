# Web-Based AI-Powered Mock Interview Platform

### Semester-6 Capstone Project 
- **PHASE-I Project Supervisor(s):** Dr. Shreyas Suresh Rao
- **PHASE-II Project Supervisor(s):** Mr. Thilak Vasant and Mr. Pranav Arya Sunku.

---

## Team Members

| Name | Role | Student ID |
|------|------|-------------|
| **Lekhshree Paunikar** | (Team Lead) API Integration & Testing| 2022EBCS070 |
| **Meenakshi Sharma** | Database Developer | 2022EBCS034 |
| **Manviya Sahni** | Frontend Developer | 2022EBCS130 |

---

## Project Overview

**Web-Based AI-Powered Mock Interview Platform** is an intelligent web application designed to help users **practice and improve interview skills** using AI-driven question generation and evaluation.  
It offers **text and voice-based** interview simulations, **automated scoring**, and **personalized feedback** - accessible anytime, anywhere.

---

## Objectives

- Provide **automated mock interviews** using AI and LLMs.  
- Support **dynamic and resume-based** question generation.  
- Deliver **instant feedback and performance analytics**.  
- Enable **multi-modal interaction** (Text + Voice).  
- Maintain **security, accessibility, and scalability** for all users.

---

## Core Features

- **User Authentication:** Secure login, registration, and JWT-based sessions.  
- **Role & Skill Customization:** Configure preferred domains and languages.  
- **AI Interview Engine:** Adaptive question sequencing and evaluation.  
- **Dynamic Question Generation:** LLM-based contextual question creation.  
- **Voice Support:** Text-to-Speech (TTS) and Speech-to-Text (STT).  
- **Performance Analytics:** Detailed reports with charts and insights.  
- **Admin Dashboard:** Manage users, questions, and moderate content.  
- **Resume Parsing:** NLP-based CV analysis for personalized questions.  

---

## Unique Selling Points (What Sets Us Apart)

- **Free & Accessible Anytime:** Unlike paid or mentor-based platforms, ours is always available at zero cost.  
- **AI-Driven Personalization:** Tailored questions based on roles, skills, and uploaded resumes.  
- **Instant Automated Feedback:** Real-time scoring and improvement tips with no human delay.  
- **Adaptive Difficulty:** Question complexity evolves dynamically based on user performance.  
- **Multimodal Experience:** Choose between text or voice for a realistic interview feel.  
- **Comprehensive Analytics:** Visualized performance metrics and learning progress tracking.  
- **Privacy First:** Secure data handling (AES-256 encryption, GDPR-like compliance).  

---

## System Architecture

The platform follows a **Three-Tier Architecture**:
1. **Frontend (Presentation Layer):** Built with React + TypeScript + Vite for a fast, responsive UI.  
2. **Backend (Application Layer):** Powered by Node.js (Express.js) to handle RESTful APIs, authentication, and AI logic. 
3. **Database (Data Layer)Database:** Uses PostgreSQL to store user data, sessions, and interview results securely.

- Extra Note:
  - **AI Modules:**  
    - LLM for question generation & answer evaluation.  
    - NLP for resume parsing.  
    - STT & TTS for voice interaction.  
  - **Deployment:** Containerized via Docker with CI/CD (GitHub Actions).  

---

## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, TypeScript, Vite, HTML5, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **AI/ML Integration** | OpenAI API / Hugging Face Transformers |
| **Voice Processing** | Vapi API/ Google Speech API (STT/TTS) |
| **Authentication** | JWT + HTTPS (TLS 1.2+), Express Middleware |
| **Deployment** | npm, Docker, GitHub, Vite |

---

## Non-Functional Requirements

- **Performance:** 95% of requests ≤ 2s response time.  
- **Availability:** ≥ 99% uptime monthly.  
- **Security:** AES-256 encryption & GDPR-like data policies.  
- **Scalability:** Supports 1,000+ concurrent users.  
- **Accessibility:** WCAG 2.1 AA compliance & cross-browser support.  

---

## Out of Scope

- Native mobile/desktop apps.  
- Offline functionality.  
- Non-English languages.  
- Live mentorship or recruiter integration.  

---

## Deliverables

- Responsive Web Application.  
- Admin and User Dashboards.  
- Automated Evaluation System.  
- AI-based Question Generation Module.  
- Comprehensive Performance Reports.  

---
  
## High Fidelity Figma Prototype

  The original project prototype is available at https://www.figma.com/design/2RRNFXiNFKKxA7KKmXgSh4/AI-Powered-Mock-Interview-Platform.

---

## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

---
