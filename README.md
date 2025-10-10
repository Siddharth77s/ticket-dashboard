# 🎟️ Ticket Dashboard – Project Management System

A **mini project management dashboard** inspired by Trello/Atlassian.  
It includes **email-based OTP authentication**, **real-time project & ticket management**, **super-user controls**, and **instant notifications** — all built with **React (Vite)** and **Convex (Serverless Backend)**.

> ✅ **Status:** Project Fully Completed & Deployed  
> 📅 **Assignment:** Cognito Innovations – Ticket Dashboard  
> 👨‍💻 **Developer:** Siddharth Shinde  

---

## 🚀 Overview

**Ticket Dashboard** is a collaborative project management tool where teams can create projects, manage tickets, and track real-time updates.  
The system includes authentication, role-based controls, and instant notifications using a clean, modern UI.

---

## 🧩 Tech Stack

| Layer | Technology Used |
|:------|:----------------|
| **Frontend** | React 19 (Vite), TypeScript, Tailwind CSS |
| **State Management** | Zustand |
| **Backend** | Convex (Serverless Functions, Realtime Sync) |
| **Database** | Convex Built-in NoSQL (real-time data layer) |
| **Auth** | Email-based OTP using Convex Auth |
| **Notifications** | Web-based realtime updates + email fallback |
| **Icons** | Lucide React |
| **UI Components** | Sonner (Toast Notifications), Tailwind Merge |

---

## 🧠 Features Implemented

### 🔐 Step 1: Authentication
- Email-based OTP login (no password required).  
- After login → Redirects to the **Project & Ticket Dashboard**.  
- Session management via Convex Auth.

### 📊 Step 2: Projects & Tickets
- Dashboard lists all available projects.  
- If no project → “Create New Project” option appears.  
- Each project supports **multiple tickets** with detailed descriptions.  
- Real-time updates using Convex — ticket movement reflects **instantly for all active users**.  
- **Super-User Toggle:**
  - ON → Shows who created or updated tickets.
  - OFF → Hides user details.
  - Password required to toggle ON.

### 🔔 Step 3: Notifications & Updates
- **Activity Feed:** Live ticket updates appear instantly.  
- **Email Notifications:**  
  - Sent to offline users who were previously active.  
  - Active users receive in-app (UI) notifications.  
- Implemented via **Strategy Pattern** for dual notification modes (email + in-app).

### ⚙️ Step 4: Backend Design
- **Backend:** Convex (Node.js-based serverless functions).  
- **Database:** NoSQL – Chosen for **real-time collaboration** and **schema flexibility**.  
- **Design Pattern:**  
  - **Strategy Pattern** – used in notifications (email vs in-app).
  - **Factory Pattern** – used for creating project/ticket objects dynamically.
- **API Architecture:** Modular convex functions with separation of concerns (`auth/`, `tickets/`, `projects/`, `notifications/`).

### 🎨 Step 5: Frontend Design
- **Framework:** React + Vite + TypeScript.  
- **State Management:** Zustand for predictable global state handling.  
- **UI:** Tailwind CSS with clean structure and responsive layout.  
- **Pages:**
  - Project List Page  
  - Project Detail Page with ticket list  
  - Super-user toggle with password prompt  
  - Notifications bell with dropdown  
- Pixel-perfect to Figma design guidelines.

---

## 🧰 Database & Design Decisions

| Criteria | Choice | Reason |
|:----------|:-------|:-------|
| **Database** | NoSQL (Convex) | Real-time data synchronization & schema-less flexibility |
| **Backend Pattern** | Strategy + Factory | Decouples logic for extensibility |
| **Auth** | Email OTP | Simplifies login and removes password friction |
| **Frontend State** | Zustand | Lightweight, simpler than Redux for dashboard apps |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone  https://github.com/Siddharth77s/ticket-dashboard
cd ticket-dashboard
2️⃣ Install Dependencies
npm install
3️⃣ Run the Project (Development)
npm run dev
Frontend → http://localhost:5173
Backend also runs with real-time sync.
```
### 🏗️ Build & Deployment

**Build for Production**
```bash
npm run build

Preview the Build
npm install -g serve
serve -s dist
Open in browser: http://localhost:5000

```
## 👨‍💻 Author 
Siddharth Shinde
🎓 B.Tech – Computer Science & Engineering (Cybersecurity)
📧 siddharthshinde9476@gmail.com

## 💻 GitHub – Siddharth77s

## 🪄 License

This project is developed as part of a technical assignment for Cognito Innovations.
It is open for evaluation and demonstration purposes only.
