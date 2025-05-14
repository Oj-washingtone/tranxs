# Tranxs

`tranxs` is a powerful and easy-to-use Node.js library for integrating M-Pesa payment services into your application. It provides seamless support for all major M-Pesa transactions, including STK Push, B2C, B2B, C2B, Reversal, Account Balance, and Transaction Status queries. Whether you're building a fintech application, e-commerce platform, or any system requiring mobile payments, tranxs simplifies M-Pesa's complex APIs with an intuitive interface.

### Instllation

`npm i tranxs`

### Initializing Mpesa

### Change in Initialization (v2.0.0)

In version 2.0.0, we’ve changed the way you initialize and used.
for users

#### Previous Method (v1.x.x):

```js
import { Mpesa } from "tranxs ";

const mpesa = new Mpesa({ ... }, "sandbox");
```

#### New initialization style (v2.x.x)

```javascript
import { useMpesa } from "tranxs";

const mpesa = useMpesa(
  {
    CONSUMER_KEY: "Your-key",
    CONSUMER_SECRET: "mpesa-consumer-secret",
    BUSINESS_SHORT_CODE: "Yur-mpesa-business-code",
    PASS_KEY: "your-mpesa-pass-key", // not required for B2C transactions

    // for b2c transactions include initiator name and password(This should be username and password of a account on mpesa portal with business manager role  for that organization)

    INITIATOR_NAME: "your initiator name",
    INITIATOR_PASSWORD: "Initiatot password",
  },
  "production" // or sandbox
);
```

**_Note:_** the environments can be `production` or `sandbox`

### M-pesa STK-push example

Making STK push request

```javascript
const response = await mpesa.stkPush({
  phone: "0712345678",
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
const response = await mpesa.b2c({
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

### M-pesa C2B URL Registration

This allows your platform to receive notifications made to your till/Paybillnumber.

Here you need to register two urls; Validation URL and Confirmation URL

**_Validation URL_**: This is what is used when a Merchant (Partner) requires to validate the details of the payment before accepting the payment eg (Bank wants to ensure the account you're depositing to exists before accepting the deposit/ payment)

**_Confirmation URL_**: This is used to receive payment notification once payment has been completed successfully on Mpesa

#### Initiating Callback URL Registrations

```javascript
const response = await mpesa.c2bRegisterUrl({
  ResponseType: "Completed", // Canceled
  ConfirmationURL: "https://mydomain.com/confirmation", // your callback url
  ValidationURL: "https://mydomain.com/validation", //your callback url
});
```

##### Expected response

```json
{
  "OriginatorCoversationID": "7619-37765134-1",
  "ResponseCode": "0",
  "ResponseDescription": "success"
}
```

**_Note_**: **_ResponseType_** specifies what should happen when your validation url is unreachable by mpesa or did not respond in the required time. Only two values are allowed: **_Completed or Cancelled._** **_Completed_** means M-PESA will automatically complete your transaction, while **_Cancelled_** means M-PESA will automatically cancel the transaction, in the event M-PESA is unable to reach your **_Validation URL_**.

**_Note_**: Transaction validation is an optional feature that needs to be activated on Mpesa by the owner of the shortcode, by emailing safaricom. for more information referr to API docs for C2B URL Registration.

#### Validation Request to your URL

Mpesa will POST the following result to your validation URL

(Example)

```json
{
   "TransactionType": "Pay Bill",
   "TransID":"RKTQDM7W6S",
   "TransTime":"20191122063845",
   "TransAmount":"10"
   "BusinessShortCode": "600638",
   "BillRefNumber":"invoice008",
   "InvoiceNumber":"",
   "OrgAccountBalance":""
   "ThirdPartyTransID": "",
   "MSISDN":"25470****149",
   "FirstName":"John",
   "MiddleName":""
   "LastName":"Doe"
}

```

Your API after receiving this request, it is required to respond with the following when acepting the transaction

```json
{
  "ResultCode": "0",
  "ResultDesc": "Accepted"
}
```

and gthe following when rejecting

```json
{
  "ResultCode": "C2B00011",
  "ResultDesc": "Rejected"
}
```

Please refer to [Draja API documentation](https://developer.safaricom.co.ke). for further details
