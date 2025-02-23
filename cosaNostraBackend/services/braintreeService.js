import gateway from '../models/braintree.js';  // Import the gateway from the model

// Generate a client token, optionally for a specific customer
export async function generateClientToken(customerId = null) {
  try {
    const options = customerId ? { customerId } : {};  // If customerId is null, pass an empty object
    const response = await gateway.clientToken.generate(options);  // Generate token
    return response.clientToken;
  } catch (error) {
    console.error('Error generating client token:', error);  // Log the error for debugging
    throw new Error(`Failed to generate client token: ${error.message}`);
  }
}


// Process a payment transaction
export async function processPayment(nonce, amount) {
  try {
    const result = await gateway.transaction.sale({
      amount,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true
      }
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.transaction;
  } catch (error) {
    throw new Error(`Payment failed: ${error.message}`);
  }
}
