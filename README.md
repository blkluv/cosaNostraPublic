# Barbershop Management System
This project is a full-stack web application designed to manage a barbershop's daily operations. Built using React, Tailwind CSS, Node.js, and MySQL, the platform supports appointment scheduling, payment processing, and barber-specific features such as managing appointments and breaks. The website is made using a mobile first approach

NOTE!
The website is still in developement, and this is not the final product!
The mock of the website which was used as inspiration to build this can be found on Figma
https://www.figma.com/design/UZJj3Sd7hsph9irVqgzfXD/Untitled?t=ejeF5D1W3UyeUDkZ-0**

## Landing Page

![image](https://github.com/user-attachments/assets/ddfeec1f-9a56-46b9-9f6f-05ac22f1b569)

## Appointments page

![image](https://github.com/user-attachments/assets/59a5827a-a689-49d1-a827-df2cf949fe65)


## Login page

![image](https://github.com/user-attachments/assets/b77321d4-4091-495e-a864-6b9c092cb6e1)




# Features
## Client-Side (React with Tailwind)
Responsive UI: The application is fully responsive, adapting to different screen sizes using Tailwind CSS.
Appointment Scheduling: Customers can browse available time slots and book appointments with a preferred barber.
Authentication and Authorization: Secure user login and registration using JWT tokens. Access is restricted based on user roles (e.g., customer vs. barber).
Payment Processing: Customers can pay for their appointments using an integrated payment gateway.
User Dashboard: Customers can view and manage their upcoming and past appointments.
## Barber-Specific Features
View Appointments: Barbers have a dedicated dashboard to review their upcoming appointments.
Manage Breaks: Barbers can schedule breaks throughout their workday.
Appointment Updates: Barbers can update the status of appointments (e.g., completed, cancelled).
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
Payment Gateway: Integrated payment processor (e.g., Stripe or PayPal) to handle transactions securely.
 
# Installation prerequisites
Node.js installed
MySQL database setup





