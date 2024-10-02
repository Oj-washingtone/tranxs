# Tranxs

`tranxs` is a powerful and easy-to-use Node.js library for integrating M-Pesa payment services into your application. It provides seamless support for all major M-Pesa transactions, including STK Push, B2C, B2B, C2B, Reversal, Account Balance, and Transaction Status queries. Whether you're building a fintech application, e-commerce platform, or any system requiring mobile payments, tranxs simplifies M-Pesa's complex APIs with an intuitive interface.

## M-pesa STK-push example

```javascript
import Transactions from "tranxs";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE,
  PASS_KEY: process.env.MPESA_PASS_KEY,
};

const transaction = new Transactions(credentials, "production"); // or sandbox for sandbox applications
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
