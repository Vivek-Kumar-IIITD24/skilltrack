# SkillTrack – AI-Powered Student Skill Management Platform

SkillTrack is a comprehensive **Full-Stack Application** (Web, Mobile, & Backend) designed to help students learn, track, and showcase their skills. The platform features an **AI-driven quiz engine**, secure role-based access, and a cross-platform experience for seamless learning.

Deployed Website: [skilltrack-frontend.vercel.app](https://skilltrack-frontend.vercel.app)

---

##  Key Features

###  **AI-Powered Learning**
- **Smart Quizzes:** Generates interview-style questions from course content using **Google Gemini Flash 1.5 AI**.
- **Dynamic Assessment:** Questions adapt to the lesson context instantly.

###  **Security & Access**
- **Role-Based Access Control (RBAC):** Distinct portals for **Students** (Learning) and **Admins** (Content Management).
- **JWT Authentication:** Secure, stateless login for both Web and Mobile apps.

###  **Interactive Classroom**
- **Video Learning:** Integrated YouTube player with state tracking.
- **Anti-Cheat System:** "Effort Tracking" logic ensures students actually watch content before progressing.
- **Notes & Progress:** Save notes with timestamps; progress syncs across devices.

###  **Cross-Platform Experience**
- **Unified Web Portal:** Responsive React dashboard for managing courses and profiles.
- **Mobile App:** React Native (Expo) app for learning on the go.

---

##  Tech Stack

### **Backend** (Spring Boot)
- **Language:** Java 17
- **Framework:** Spring Boot 3.2
- **Auth:** Spring Security + JWT
- **Database:** PostgreSQL
- **AI Integration:** Google Gemini API (Flash 1.5)
- **Tools:** Maven, Docker, Swagger UI

### **Frontend** (Website)
- **Framework:** React.js (v18)
- **Styling:** Tailwind CSS + Lucide React
- **Deployment:** Vercel

### **Mobile** (App)
- **Framework:** React Native
- **Platform:** Expo (Managed Workflow)
- **Navigation:** Expo Router
- **Styling:** NativeWind / StyleSheet

---

##  Project Structure

\\\	ext
skilltrack/
 backend/            # Spring Boot REST API
    src/main/java   # Controllers, Services, Entities
    Dockerfile      # Containerization config
 website/            # React Web Application (Student + Admin)
    src/pages       # Dashboard, Quiz, Login pages
    public/         # Static assets
 mobile/             # React Native Mobile App
    app/            # Screens and Navigation
    components/     # Reusable UI elements
 README.md           # Project Documentation
\\\

---

##  Getting Started

### 1. Backend Setup
\\\ash
cd backend
# Update application.properties with your DB and Gemini API Key
./mvnw spring-boot:run
\\\
*Server runs at: \http://localhost:8085\*

### 2. Website Setup
\\\ash
cd website
npm install
npm start
\\\
*Web App runs at: \http://localhost:3000\*

### 3. Mobile App Setup
\\\ash
cd mobile
npm install
npx expo start
\\\
*Scan the QR code with Expo Go on your phone.*

---

##  Development Roadmap

- [x] **Phase 1: Foundation** - Auth, DB, Basic CRUD.
- [x] **Phase 2: Core Features** - Video Player, Progress Tracking, Unified Web UI.
- [x] **Phase 3: Intelligence** - Gemini AI integration for Quizzes.
- [x] **Phase 4: Mobile** - React Native App launch.
- [ ] **Phase 5: Analytics** - Detailed Admin Dashboard with Charts.

---

##  Author

**Vivek Kumar**
*Full Stack Developer*

 **GitHub:** [Vivek-Kumar-IIITD24](https://github.com/Vivek-Kumar-IIITD24)


---

## ?? Startup Roadmap (Work In Progress)

We are actively working on the following to move from MVP to Product Market Fit:

- [x] **Phase 1: Foundation (Completed)** - Secure Auth, Database Design, Basic CRUD.
- [x] **Phase 2: Core Learning Engine (Completed)** - Video Player, Progress Tracking, Unified Web UI.
- [x] **Phase 3: Intelligence (Verified)** - Gemini AI integration for dynamic Quizzes.
- [x] **Phase 4: Mobile Launch (Verified)** - React Native App publicly available via Expo.
- [ ] **Phase 5: Advanced Analytics (In Progress)** - Admin Dashboard to view student engagement trends.
- [ ] **Phase 6: Gamification** - Leaderboards, Badges, and Streaks.
- [ ] **Phase 7: Monetization** - Premium courses and Certification generation.

---

## ????? Author

**Vivek Kumar**
*Full Stack Developer & Startup Founder*

?? **GitHub:** [Vivek-Kumar-IIITD24](https://github.com/Vivek-Kumar-IIITD24)

---

> **Note:** This repository represents the core technology behind our startup vision. Contributions and feedback are welcome as we scale!
