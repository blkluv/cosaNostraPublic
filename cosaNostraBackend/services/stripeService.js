import Stripe from 'stripe';
import { getService } from './servicesService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async ({ serviceId, barberId, appointmentDate, appointmentTime, note, clientId }) => {
  const service = await getService(serviceId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'rsd',
          product_data: {
            name: service.serviceName,
          },
          unit_amount: service.servicePrice * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
    metadata: {
      serviceId,
      barberId,
      appointmentDate,
      appointmentTime,
      note,
      clientId
    }
  });

  return session.id;
};

export { createCheckoutSession };
