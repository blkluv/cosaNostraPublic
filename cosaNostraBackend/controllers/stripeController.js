import { createCheckoutSession } from '../services/stripeService.js';

const createCheckoutSessionHandler = async (req, res) => {
  const { serviceId, barberId, appointmentDate, appointmentTime, note, clientId } = req.body;

  try {
    const sessionId = await createCheckoutSession({ serviceId, barberId, appointmentDate, appointmentTime, note, clientId });
    res.json({ id: sessionId });
  } catch (error) {
    console.error('Error creating Checkout Session:', error);
    res.status(500).json({ error: 'Failed to create Checkout Session' });
  }
};

export { createCheckoutSessionHandler };
