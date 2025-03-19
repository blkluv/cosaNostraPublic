//TO-DO
//kod iz /createEvent prebaci u /create-appointment
//izmeni delete appointment da obrise i appointment u google kalendaru
//dodaj da moze da menja radno vreme svoje
//onemoguci vikendima da se moze zakazati

import https from 'https';
import http from 'http'; // Added for local development
import fs from 'fs';
import express from 'express';
import path from 'path';
import cors from 'cors';
import Stripe from 'stripe';
import cookieParser from 'cookie-parser';
import { google } from 'googleapis';
import { generateClientTokenHandler, processPaymentHandler } from './controllers/braintreeController.js';
import { verifyToken } from './middleware/authMiddleware.js';
import { isBarber, isClient } from './middleware/roleMiddleware.js';
import { createCheckoutSessionHandler } from './controllers/stripeController.js';
import { checkPassword, logoutHandler, refreshHandler, registerHandler, loginHandler, barberloginHandler, barberregisterHandler } from './controllers/authController.js';
import { getBarbersHandler, getBarberHandler, createBarberHandler, updateBarberHandler, deleteBarberHandler } from './controllers/barbersController.js';
import { getServicePriceHandler, getServicesHandler, getServiceHandler, createServiceHandler, updateServiceHandler, deleteServiceHandler } from './controllers/servicesController.js';
import { getClientsHandler, getClientHandler, createClientHandler, updateClientHandler, updateClientByUsernameHandler, deleteClientHandler } from './controllers/clientsController.js';
import { getAppointmentHandler, getAppointmentsHandler, createAppointmentHandler, createGuestAppointmentHandler, updateAppointmentHandler, deleteAppointmentHandler, GetAvailableSlotsHandler, getAppointmentDetailsHandler, getAppointmentDetailsForClientHandler, deleteLastAppointmentHandler } from './controllers/appointmentsController.js';
import { getServiceAppointmentHandler, getServiceAppointmentsHandler, createServiceAppointmentsHandler, updateServiceAppointmentsHandler, deleteServiceAppointmentsHandler } from './controllers/serviceappointmentsController.js';
import { getBarberAppointmentHandler, getBarberAppointmentsHandler, createBarberAppointmentsHandler, updateBarberAppointmentsHandler, deleteBarberAppointmentsHandler } from './controllers/barberAppointmentsController.js';
import { stripeWebhookHandler } from './controllers/stripeWebhookController.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const SCOPES = process.env.SCOPES;
const PRIV_KEY = process.env.GOOGLE_PRIVATE_KEY;
const CLIENT_MAIL = process.env.GOOGLE_CLIENT_MAIL;
const PROJ_NUM = process.env.GOOGLE_PROJECT_NUMBER;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const allowedOrigins = [
  'https://cosa-nostra-public.vercel.app/', // Production frontend
  'http://localhost:3001',  // Local frontend
];

const checkOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin !== 'https://cosa-nostra-public.vercel.app/') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next(); // Continue to the next middleware or route handler
};

const jwtClient = new google.auth.JWT(
  CLIENT_MAIL,
  null,
  PRIV_KEY,
  SCOPES
);

const calendar = google.calendar({
  version: 'v3',
  project: PROJ_NUM,
  auth: jwtClient
});


const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be included  
};

//app.use(checkOrigin);
app.use(cors(corsOptions));
app.use(cookieParser());


app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
app.use(express.json()); // Parse JSON request bodies

app.post('/create-checkout-session', createCheckoutSessionHandler);
app.post('/register', registerHandler);
app.post('/login', loginHandler);
//app.post('/barberregister', barberregisterHandler);
app.post('/barberlogin', barberloginHandler);
app.post('/refresh', refreshHandler );
app.post('/logout', logoutHandler);
app.put('/change-password', verifyToken, checkPassword);


app.get('/barbers', verifyToken, getBarbersHandler);
app.get('/barbers/:id', verifyToken, getBarberHandler);
app.post('/barbers', verifyToken, isBarber, createBarberHandler);
app.put('/barbers/:id', verifyToken, isBarber, updateBarberHandler);
app.delete('/barbers/:id', verifyToken, isBarber, deleteBarberHandler);

app.get('/services', getServicesHandler);
app.get('/services/:id', getServiceHandler);
app.post('/services', verifyToken, isBarber, createServiceHandler);
app.put('/services/:id', verifyToken, isBarber, updateServiceHandler);
app.delete('/services/:id', verifyToken, isBarber, deleteServiceHandler);
app.get('/serviceprice/:id', verifyToken, getServicePriceHandler);

app.get('/clients', verifyToken, isBarber, getClientsHandler);
app.get('/clients/:id', verifyToken, getClientHandler);
app.post('/clients', verifyToken, isBarber, createClientHandler);
app.put('/clients/:id', verifyToken, isBarber, updateClientHandler);
app.put('/clientsByUsername/:username', verifyToken, isBarber, updateClientByUsernameHandler);
app.delete('/clients/:id', verifyToken, isBarber, deleteClientHandler);

app.get('/appointment', verifyToken, getAppointmentsHandler);
app.get('/appointment/:id', verifyToken, getAppointmentHandler);
app.post('/appointment', verifyToken, createAppointmentHandler);
app.post('/guestAppointment', verifyToken, createGuestAppointmentHandler);
app.put('/appointment/:id', verifyToken, isBarber, updateAppointmentHandler);
app.delete('/appointment/:id', verifyToken, isBarber, deleteAppointmentHandler);
app.get('/available-slots', verifyToken, GetAvailableSlotsHandler);
app.get('/appointment-details/:id', verifyToken, isBarber, getAppointmentDetailsHandler);
app.get('/appointment-details-client/:id', verifyToken, getAppointmentDetailsForClientHandler);
app.delete('/delete-last-appointment', verifyToken, deleteLastAppointmentHandler);

app.get('/serviceappointment', verifyToken, getServiceAppointmentsHandler);
app.get('/serviceappointment/:id', verifyToken, getServiceAppointmentHandler);
app.post('/serviceappointment', verifyToken, createServiceAppointmentsHandler);
app.put('/serviceappointment/:id', verifyToken, isBarber, updateServiceAppointmentsHandler);
app.delete('/serviceappointment/:id', verifyToken, isBarber, deleteServiceAppointmentsHandler);

app.get('/barberappointment', verifyToken, getBarberAppointmentsHandler);
app.get('/barberappointment/:id', verifyToken, getBarberAppointmentHandler);
app.post('/barberappointment', verifyToken, createBarberAppointmentsHandler);
app.put('/barberappointment/:id', verifyToken, updateBarberAppointmentsHandler);
app.delete('/barberappointment/:id', verifyToken, deleteBarberAppointmentsHandler);

app.get('/braintree/client-token/:customerId?', generateClientTokenHandler);
app.post('/braintree/checkout', processPaymentHandler);  // Process payment

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Catch-all handler for all non-API routes (returns index.html for React Router to handle)
//app.get("*", (req, res) => {
//  res.sendFile(path.resolve(__dirname, "build", "index.html"));
//});

if (isProduction) {
  // Load SSL certificate and key for production
  const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/www.api.kosa-nostra.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.api.kosa-nostra.com/fullchain.pem'),
  };

  // Start HTTPS server in production
  https.createServer(sslOptions, app).listen(8080, () => {
    console.log('HTTPS Server running on port 8080');
  });
} else {
  // Start HTTP server for local development
  const port = 3000; // Use a different port for local testing
  http.createServer(app).listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
  });
}

