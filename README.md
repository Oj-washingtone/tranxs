# Tranxs

`tranxs` is a powerful and easy-to-use Node.js library for integrating M-Pesa payment services into your application. It provides seamless support for all major M-Pesa transactions, including STK Push, B2C, B2B, C2B, Reversal, Account Balance, and Transaction Status queries. Whether you're building a fintech application, e-commerce platform, or any system requiring mobile payments, tranxs simplifies M-Pesa's complex APIs with an intuitive interface.

### Instllation

`npm i tranxs`

### Initializing Mpesa

```javascript
import { Mpesa } from "tranxs";

const transaction = new Mpesa(
  {
    CONSUMER_KEY: "Your-key",
    CONSUMER_SECRET: "mpesa-consumer-secret",
    BUSINESS_SHORT_CODE: "Yur-mpesa-business-code",
    PASS_KEY: "your-mpesa-pass-key",
  },
  "production"
);
```

**_Note:_** the environments can be `production` or `sandbox`

### M-pesa STK-push example

Making STK push request

```javascript
const response = await transaction.stkPush({
  phone: "0712028821",
  amount: 100,
  callbackUrl: "https://mydomain.com/callback",
  account: "Any account",
});
```

Expected Response

```json
{
  "MerchantRequestID": "38d5-4ca6-b9c9-0240a9781f7a24954456",
  "CheckoutRequestID": "ws_CO_04102024170035818712028821",
  "ResponseCode": "0",
  "ResponseDescription": "Success. Request accepted for processing",
  "CustomerMessage": "Success. Request accepted for processing"
}
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

### B2C EXAMPLE

Making a b2c request

```javascript
const response = await transaction.b2c({
  phone: "2547123456789",
  amount: 100,
  resultCallbackUrl: "https://mydomain.com/callback",
  queueTimeOutURL: "https://mydomain.com/timeout",
  commandID: "BusinessPayment",
});
```

Other fields you may include

| field     | value  | description                                               |
| --------- | ------ | --------------------------------------------------------- |
| commandID | string | `SalaryPayment `, `BusinessPayment` or `PromotionPayment` |
| remarks   | string | Any additional information you may want to add            |
| occasion  | string | Any additional information you may want to add            |

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

#### Ecpected callbacks from mpesa

##### Successful B2C Result

```json
{
  "Result": {
    "ResultType": 0,
    "ResultCode": 0,
    "ResultDesc": "The service request is processed successfully.",
    "OriginatorConversationID": "10571-7910404-1",
    "ConversationID": "AG_20191219_00004e48cf7e3533f581",
    "TransactionID": "NLJ41HAY6Q",
    "ResultParameters": {
      "ResultParameter": [
        {
          "Key": "TransactionAmount",
          "Value": 10
        },
        {
          "Key": "TransactionReceipt",
          "Value": "NLJ41HAY6Q"
        },
        {
          "Key": "B2CRecipientIsRegisteredCustomer",
          "Value": "Y"
        },
        {
          "Key": "B2CChargesPaidAccountAvailableFunds",
          "Value": -4510.0
        },
        {
          "Key": "ReceiverPartyPublicName",
          "Value": "254708374149 - John Doe"
        },
        {
          "Key": "TransactionCompletedDateTime",
          "Value": "19.12.2019 11:45:50"
        },
        {
          "Key": "B2CUtilityAccountAvailableFunds",
          "Value": 10116.0
        },
        {
          "Key": "B2CWorkingAccountAvailableFunds",
          "Value": 900000.0
        }
      ]
    },
    "ReferenceData": {
      "ReferenceItem": {
        "Key": "QueueTimeoutURL",
        "Value": "https://internalsandbox.safaricom.co.ke/mpesa/b2cresults/v1/submit"
      }
    }
  }
}
```

##### on Error

Example error

```json
{
  "Result": {
    "ResultType": 0,
    "ResultCode": 2001,
    "ResultDesc": "The initiator information is invalid.",
    "OriginatorConversationID": "29112-34801843-1",
    "ConversationID": "AG_20191219_00006c6fddb15123addf",
    "TransactionID": "NLJ0000000",
    "ReferenceData": {
      "ReferenceItem": {
        "Key": "QueueTimeoutURL",
        "Value": "https://internalsandbox.safaricom.co.ke/mpesa/b2cresults/v1/submit"
      }
    }
  }
}
```
