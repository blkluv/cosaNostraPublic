# Barbershop Management System
This project is a full-stack web application designed to manage a barbershop's daily operations. Built using React, Tailwind CSS, Node.js, and MySQL, the platform supports appointment scheduling, has a Google calendar integration, and barber-specific features such as managing appointments and breaks. The website is made using a mobile first approach. The website is currently LIVE! The domain is kosa-nostra.com 


## Landing Page

![kosa-nostra com_login (1)](https://github.com/user-attachments/assets/907f928c-ed72-447d-95fe-1672bbd867bb)

## Appointments page

![image](https://github.com/user-attachments/assets/59a5827a-a689-49d1-a827-df2cf949fe65)


## Login page

![image](https://github.com/user-attachments/assets/b77321d4-4091-495e-a864-6b9c092cb6e1)

## Navbar

![image](https://github.com/user-attachments/assets/6f184520-a286-427c-91dd-6918a6a97dc6)

## Change user data

![kosa-nostra com_login (2)](https://github.com/user-attachments/assets/4da34a88-bb1f-4f90-8732-cac5d23e0d5a)

## Barber dashboard

![image](https://github.com/user-attachments/assets/3a03ea0e-aab3-454c-b2d4-7fbf05049054)


# Features
## Client-Side (React with Tailwind)
Responsive UI: The application is fully responsive, adapting to different screen sizes using Tailwind CSS.
Appointment Scheduling: Customers can browse available time slots and book appointments with a preferred barber.
Authentication and Authorization: Secure user login and registration using JWT tokens. Access is restricted based on user roles (e.g., customer vs. barber).
User Dashboard: Customers can view their upcoming appointments.
Profile: Users can change their username, password and phone number.
## Barber-Specific Features
View Appointments: Barbers have a dedicated dashboard to review their upcoming appointments.
Manage Breaks: Barbers can schedule breaks throughout their workday.
VIP users: Barbers can give users VIP status giving them exclusive rights to make appointments.
Avialibility: Barbers can quickly change their avialibility, making them aviable to select users or completely unavialible.
Work days: Barbers can change how many days in advance users can book appointments.
Work hours: Barbers can change their working hours.
Custom appointment: The barber can also create appointments for users.
# Backend (Node.js and MySQL)
Authentication: Secure user registration and login with password hashing (bcrypt).
Authorization: Role-based access control (RBAC) implemented to ensure proper permissions.
API for Appointment Management: RESTful APIs to manage appointment scheduling, viewing, and modifications.
Database: MySQL for storing user data, appointments, and schedules.
Technologies Used
# Frontend
React: For building a dynamic, component-based user interface.
Tailwind CSS: For rapid styling and responsive design.
Backend
Node.js: Server-side environment.
Express.js: Framework for building REST APIs.
MySQL: Relational database to store user data, appointments, and schedules.
Security & Payment
JWT Authentication: JSON Web Tokens (JWT) for secure authentication and session management.
Password Hashing: Passwords are hashed using bcrypt to ensure security.
Google calendar integration: The created appointments are made as events in the barbers Google calendar.
 
# Installation prerequisites
Node.js installed
MySQL database setup





