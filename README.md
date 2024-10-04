# Tranxs

`tranxs` is a powerful and easy-to-use Node.js library for integrating M-Pesa payment services into your application. It provides seamless support for all major M-Pesa transactions, including STK Push, B2C, B2B, C2B, Reversal, Account Balance, and Transaction Status queries. Whether you're building a fintech application, e-commerce platform, or any system requiring mobile payments, tranxs simplifies M-Pesa's complex APIs with an intuitive interface.

### Instllation

`npm i tranxs`

### M-pesa STK-push example

Making the request

```javascript
import { Mpesa } from "tranxs";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE,
  PASS_KEY: process.env.MPESA_PASS_KEY,
};

const transaction = new Mpesa(credentials, "production"); // or sandbox for sandbox applications
transaction
  .stkPush({
    phone: "0712345678",
    amount: 100,
    callbackUrl: "https://mydomain.com/callback",
  })
  .then((response) => {
    console.log("STK Push Response:", response);
  });
```

### B2C EXAMPLE

Making a b2c request

```javascript
import { Mpesa } from "tranxs";
import dotenv from "dotenv";

const b2c_credentials = {
  CONSUMER_KEY: process.env.SANDBOX_KEY,
  CONSUMER_SECRET: process.env.SANDBOX_SECRET,
  BUSINESS_SHORT_CODE: process.env.SANDBOX_BUSINESS_NUMBER,
  INITIATOR_PASSWORD: process.env.SANDBOX_B2C_INITIATOR_PASSWORD,
  INITIATOR_NAME: process.env.SANDBOX_B2C_INITIATOR_NAME,
};

const mpesa = new Mpesa(b2c_credentials, "sandbox"); // or production

mpesa
  .b2c({
    phone: "254712028821",
    amount: 100,
    resultCallbackUrl: "https://mydomain.com/callback",
    queueTimeOutURL: "https://mydomain.com/timeout",
    commandID: "BusinessPayment",
  })
  .then((response) => {
    console.log(response);
  });
```

Expected response

```javascript
{
  ConversationID: 'AG_20241004_20101e712a4c5b931e70',
  OriginatorConversationID: '32f3b1ea-f0d7-4c99-b29e-5e3866cf75d6',
  ResponseCode: '0',
  ResponseDescription: 'Accept the service request successfully.'
}
```
