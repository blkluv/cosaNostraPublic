import Stripe from 'stripe';
import { createAppointment } from '../services/appointmentsService.js'; // Import your appointment creation function

import { getService } from '../services/servicesService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
    default:
  }

  res.json({ received: true });
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const handleCheckoutSessionCompleted = async (session) => {
  const clientId = session.metadata.clientId;
  const serviceId = session.metadata.serviceId;
  const barberId = session.metadata.barberId;
  const appointmentDate = formatDate(session.metadata.appointmentDate);
  const appointmentTime = formatTime(session.metadata.appointmentTime);
  const note = session.metadata.note;
  const service = await getService(serviceId)

  const appointmentDuration = service.serviceDuration
  try {
    await createAppointment({
      barberId,
      appointmentDate,
      appointmentTime,
      clientId,
      appointmentDuration,
      note,
      serviceId
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
  }
};

export { stripeWebhookHandler };
