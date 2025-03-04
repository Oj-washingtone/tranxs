# Tranxs

`tranxs` is a powerful and easy-to-use Node.js library for integrating M-Pesa payment services into your application. It provides seamless support for all major M-Pesa transactions, including STK Push, B2C, B2B, C2B, Reversal, Account Balance, and Transaction Status queries. Whether you're building a fintech application, e-commerce platform, or any system requiring mobile payments, tranxs simplifies M-Pesa's complex APIs with an intuitive interface.

### Instllation

`npm i tranxs`

### M-pesa STK-push example

Making STK push request

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
    account: "Any account",
  })
  .then((response) => {
    console.log("STK Push Response:", response);
  });
```

Other fields you can pass

| field           | value  | description                                          |
| --------------- | ------ | ---------------------------------------------------- |
| TransactionDesc | string | You can describe the transaction in any way you like |

**Note that:** `callbackUrl` is the API endpoint where safaricom will post the results of te transaction.

example result that will be posted by Mpesa to this url is

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220191020363925",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 1.0
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "NLJ7RT61SV"
          },
          {
            "Name": "TransactionDate",
            "Value": 20191219102115
          },
          {
            "Name": "PhoneNumber",
            "Value": 254708374149
          }
        ]
      }
    }
  }
}
```

_Refer to daraja api's documentation under M-Pesa Express_

Expected Response

This shows that you request is successful and Mpesa has initiated an stk push to the number provided

```json
{
  "MerchantRequestID": "38d5-4ca6-b9c9-0240a9781f7a24954456",
  "CheckoutRequestID": "ws_CO_04102024170035818712028821",
  "ResponseCode": "0",
  "ResponseDescription": "Success. Request accepted for processing",
  "CustomerMessage": "Success. Request accepted for processing"
}
```

### B2C EXAMPLE

Making a b2c request

```javascript
import { Mpesa } from "tranxs";
import dotenv from "dotenv";

dotenv.config();

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
    phone: "2547123456789",
    amount: 100,
    resultCallbackUrl: "https://mydomain.com/callback",
    queueTimeOutURL: "https://mydomain.com/timeout",
    commandID: "BusinessPayment",
  })
  .then((response) => {
    console.log(response);
  });
```

Other fields you may include

| field     | value  | description                                               |
| --------- | ------ | --------------------------------------------------------- |
| commandID | string | `SalaryPayment `, `BusinessPayment` or `PromotionPayment` |
| remarks   | string | Any additional information you may want to add            |
| occasion  | string | ny additional information you may want to add             |

**Note:**
`queueTimeOutURL` is the URL to be specified in your request that will be used by API Proxy to send notification incase the payment request is timed out while awaiting processing in the queue.

`resultCallbackUrl` is the URL to be specified in your request that will be used by M-PESA to send notification upon processing of the payment request.

Expected response

```json
{
  "ConversationID": "AG_20241004_20101e712a4c5b931e70",
  "OriginatorConversationID": "32f3b1ea-f0d7-4c99-b29e-5e3866cf75d6",
  "ResponseCode": "0",
  "ResponseDescription": "Accept the service request successfully."
}
```
