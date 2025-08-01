# 🏫 Classroom Booking System

A modern, responsive web application built with React and Tailwind CSS that allows university administrators and lecturers to manage and book classrooms efficiently. Designed with usability, accessibility, and extensibility in mind, the system supports real-time availability checks, conflict prevention, role-based access, and several advanced features to enhance scheduling efficiency across campus.

---

## 🚀 Project Overview

This Classroom Booking System streamlines the process of room scheduling for educational institutions. It offers separate dashboards for Administrators and Lecturers, supports secure authentication, and includes user-friendly features such as dark mode, real-time clash detection, and Google Calendar integration.

Administrators can manage rooms and bookings, while Lecturers can search, view, and manage their own reservations—all from a clean and responsive interface.

---

## ✨ Features

### 👤 Authentication & Roles
- JWT-based login (Admin & Lecturer)
- Protected routes with role-based access
- Demo credentials for testing

### 👨‍🏫 Lecturer Features
- **Search Rooms** by date, time, location, capacity, and type
- **Create Bookings** via interactive modal with real-time clash prevention
- **Timetable View** (calendar grid)
- **View/Edit/Cancel Bookings** (with 1-hour cancellation policy)
- **Add to Google Calendar** with OAuth integration

### 🛠 Admin Features
- **Dashboard** with system KPIs and actions
- **Room Management** with full CRUD
- **Booking Oversight** to view and manage all reservations
- **Data Tables** with inline actions

### 📊 Enhancements
- Dark Mode toggle
- Analytics Dashboard:
  - Busiest rooms
  - Peak time heatmap
  - Average utilization trends
- Exportable reports (PDF/CSV)
- Waitlist system with auto-assignment on slot availability
- Email reminders (24hr & 1hr before booking)
- SMS support (optional stubbed integration)

---

## 🧰 Technologies Used

- **Vite**
- **TypeScript**
- **React**
- **shadcn-ui**
- **Tailwind CSS**
---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```sh
   git clone https://github.com/Saviskar/hackathon.git
   cd hackathon
   ```
2. **Install dependencies**
    ```sh
    npm install
    ```
3. **Start the development server**
    ```sh
    npm run dev
    ```
4. **Login with demo credentials**
    - Admin: admin@university.edu | password123
    - Lecturer: ishara.silva@example.com | password123