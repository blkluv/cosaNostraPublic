import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "wvq33mmnkcgyq4xy",
  publicKey: "bhk2d6v7v9v2w99z",
  privateKey: "2548ed2a0f87811498b17de708e7eebc"
});

export default gateway;