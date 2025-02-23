import { generateClientToken, processPayment } from '../services/braintreeService.js';

// Handler to generate client token
export async function generateClientTokenHandler(req, res, next) {
  try {
    const { customerId } = req.params;  // Assuming customerId is passed as a route parameter
    const clientToken = await generateClientToken(customerId);  // Call service to generate token
    res.status(200).send({ clientToken });  // Send the clientToken in response
  } catch (error) {
    next(error);  // Pass error to error-handling middleware
  }
}

// Handler to process a payment
export async function processPaymentHandler(req, res, next) {
  try {
    const { paymentMethodNonce, amount } = req.body;  // Expect nonce and amount in the request body
    const transaction = await processPayment(paymentMethodNonce, amount);
    res.status(200).send({ success: true, transaction });
  } catch (error) {
    next(error);
  }
}
