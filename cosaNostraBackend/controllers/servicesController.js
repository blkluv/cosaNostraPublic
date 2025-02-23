import { getServices, getService, createService, updateService, deleteService, getServicePrice } from '../services/servicesService.js';
import { createServiceAppointmentsHandler } from './serviceappointmentsController.js';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function getServicePriceHandler(req, res, next) {
  try{
    const id = req.params.id;
    const services = await getServicePrice(id);
    res.send(services)
  } catch (error) {
    next(error)
  }
}

export async function getServicesHandler(req, res, next) {
  try {
    const services = await getServices();
    res.send(services);
  } catch (error) {
    next(error);
  }
}

export async function getServiceHandler(req, res, next) {
  try {
    const id = req.params.id;
    const service = await getService(id);
    res.send(service);
  } catch (error) {
    next(error);
  }
}

export async function createServiceHandler(req, res, next) {
  try {
    if (req.userType === 'barber') {
      const service = await createService(req.body);
      res.status(201).send(service);
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    next(error);
  }
}

export async function updateServiceHandler(req, res, next) {
  try {
    const id = req.params.id;
    const service = await updateService(id, req.body);
    if (req.userType === 'barber') {
      res.status(200).send(service);
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    next(error);
  }
}

export async function deleteServiceHandler(req, res, next) {
  try {
    const id = req.params.id;
    if (req.userType === 'barber') {
      await deleteService(id);
      res.status(200).send({ message: `Deleted service with id: ${id}` });
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    next(error);
  }
}

export async function stripeHandler(req, res) {
  try {
    const serviceId = req.body.serviceId;
    
    const service = await getService(serviceId);
    
    if (!service || !service.priceId) {
      return res.status(404).json({ error: 'Price ID not found for the selected service' });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: service.priceId, // Use the price ID fetched from the service
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/`,
      cancel_url: `http://localhost:3000/schedule`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
