import axios from "axios";
import {
  B2CRequestOptions,
  Credentials,
  STKPushRequestBody,
} from "../types/mepesa.types";
import { Environment } from "../types/common";
import { generateTimestamp } from "../utils/generateTimeStamp";
import { cleanPhoneNumber } from "../utils/cleanPhone";
import { v4 as uuidv4 } from "uuid";
import { generateSecurityCredentials } from "./segGen";

export class Mpesa {
  private credentials: Credentials;
  private environment: Environment;
  private baseUrl: string;

  constructor(credentials: Credentials, environment: Environment = "sandbox") {
    this.credentials = credentials;
    this.environment = environment;
    this.baseUrl =
      this.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
  }

  private async generateToken(): Promise<string | null> {
    const auth = Buffer.from(
      `${this.credentials.CONSUMER_KEY}:${this.credentials.CONSUMER_SECRET}`
    ).toString("base64");

    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate`, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: { grant_type: "client_credentials" },
      });

      return response.data.access_token;
    } catch (error: any) {
      console.error(
        "Tranx Error:",
        error.response ? error.response.data : error.message
      );
    }

    return null;
  }

  private async requestMpesaAPI(endpoint: string, payload: any): Promise<any> {
    const token = await this.generateToken();
    if (!token) throw new Error("Unable to authenticate with Mpesa API.");

    try {
      const { data } = await axios.post(`${this.baseUrl}${endpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const message =
        typeof data === "object"
          ? JSON.stringify(data, null, 2)
          : data || error.message;

      throw new Error(
        `[Tranxs Error] ${
          status ? `Status: ${status}, ` : ""
        }Message: ${message}`
      );
    }
  }

  async stkPush(options: STKPushRequestBody): Promise<any> {
    const timestamp = generateTimestamp();
    const password = Buffer.from(
      this.credentials.BUSINESS_SHORT_CODE +
        (this.credentials.PASS_KEY || "") +
        timestamp
    ).toString("base64");

    const phone = cleanPhoneNumber(options.phone);

    const payload = {
      BusinessShortCode: this.credentials.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: options.amount,
      PartyA: phone,
      PartyB: this.credentials.BUSINESS_SHORT_CODE,
      PhoneNumber: phone,
      CallBackURL: options.callbackUrl,
      AccountReference: options.account,
      TransactionDesc: options.TransactionDesc,
    };

    return {
      action: "Tranxs - Mpesa STK Push",
      response: await this.requestMpesaAPI(
        "/mpesa/stkpush/v1/processrequest",
        payload
      ),
    };
  }

  // Business to Custommer
  async b2c(options: B2CRequestOptions): Promise<any> {
    const securityCredentials = generateSecurityCredentials(
      this.credentials.INITIATOR_PASSWORD!
    );

    const phone = cleanPhoneNumber(options.phone);

    const payload = {
      OriginatorConversationID: uuidv4(),
      InitiatorName: this.credentials.INITIATOR_NAME,
      SecurityCredential: securityCredentials,
      CommandID: options.commandID,
      Amount: options.amount,
      PartyA: this.credentials.BUSINESS_SHORT_CODE,
      PartyB: phone,
      Remarks: options.remarks,
      QueueTimeOutURL: options.queueTimeOutURL,
      ResultURL: options.resultCallbackURL,
      Occasion: options.ocattion,
    };

    return {
      action: "Tranxs - Mpesa B2C transaction",
      response: await this.requestMpesaAPI(
        "/mpesa/b2c/v3/paymentrequest",
        payload
      ),
    };
  }
}

// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
// import { generateSecurityCredentials } from "../Security/SecGen.js";

// export class Mpesa {
//   constructor(credentials, environment = "sandbox") {
//     this.credentials = credentials;
//     this.environment = environment;
//     this.baseUrl =
//       environment === "production"
//         ? "https://api.safaricom.co.ke"
//         : "https://sandbox.safaricom.co.ke";
//   }

//   async generateToken() {
//     const auth = Buffer.from(
//       `${this.credentials.CONSUMER_KEY}:${this.credentials.CONSUMER_SECRET}`
//     ).toString("base64");

//     try {
//       const response = await axios.get(`${this.baseUrl}/oauth/v1/generate`, {
//         headers: {
//           Authorization: `Basic ${auth}`,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },

//         params: {
//           grant_type: "client_credentials",
//         },
//       });

//       return response.data.access_token;
//     } catch (error) {
//       console.error(
//         "Tranx Error:",
//         error.response ? error.response.data : error.message
//       );
//     }

//     return null;
//   }

//   async requestMpesaAPI(endpoint, payload) {
//     const token = await this.generateToken();
//     if (!token) throw new Error("Unable to authenticate with Mpesa API.");

//     try {
//       const response = await axios.post(`${this.baseUrl}${endpoint}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return response.data;
//     } catch (error) {
//       const status = error?.response?.status;
//       const data = error?.response?.data;

//       const message =
//         typeof data === "object"
//           ? JSON.stringify(data, null, 2)
//           : data || error.message;

//       throw new Error(
//         `[Tranxs Error] ${
//           status ? `Status: ${status}, ` : ""
//         }Message: ${message}`
//       );
//     }
//   }

//   // Mpesa STK Push
//   async stkPush({
//     phone,
//     amount,
//     callbackUrl,
//     account = "",
//     TransactionDesc = "Payment",
//   }) {
//     const formated_phone = phone.replace(/^0+/, "254");
//     const date = new Date();
//     const timestamp =
//       date.getFullYear() +
//       ("0" + (date.getMonth() + 1)).slice(-2) +
//       ("0" + date.getDate()).slice(-2) +
//       ("0" + date.getHours()).slice(-2) +
//       ("0" + date.getMinutes()).slice(-2) +
//       ("0" + date.getSeconds()).slice(-2);

// const password = Buffer.from(
//   this.credentials.BUSINESS_SHORT_CODE +
//     this.credentials.PASS_KEY +
//     timestamp
// ).toString("base64");

//     const payload = {
//       BusinessShortCode: this.credentials.BUSINESS_SHORT_CODE,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: "CustomerPayBillOnline",
//       Amount: amount,
//       PartyA: formated_phone,
//       PartyB: this.credentials.BUSINESS_SHORT_CODE,
//       PhoneNumber: formated_phone,
//       CallBackURL: callbackUrl,
//       AccountReference: account,
//       TransactionDesc: TransactionDesc,
//     };

//     return {
//       action: "Tranxs - Mpesa STK Push",
//       response: await this.requestMpesaAPI(
//         "/mpesa/stkpush/v1/processrequest",
//         payload
//       ),
//     };
//   }

//   // Mpesa B2C
//   async b2c({
//     phone,
//     amount,
//     resultCallbackUrl,
//     queueTimeOutURL,
//     occasion = "Withdrawal",
//     commandID,
//     remarks = "Withdrawal",
//   }) {
//     const payload = {
//       OriginatorConversationID: uuidv4(),
//       InitiatorName: this.credentials.INITIATOR_NAME,
//       SecurityCredential: generateSecurityCredentials(
//         this.credentials.INITIATOR_PASSWORD
//       ),
//       CommandID: commandID,
//       Amount: amount,
//       PartyA: this.credentials.BUSINESS_SHORT_CODE,
//       PartyB: phone,
//       Remarks: remarks,
//       QueueTimeOutURL: queueTimeOutURL,
//       ResultURL: resultCallbackUrl,
//       Occasion: occasion,
//     };

//     return {
//       action: "Tranxs - Mpesa B2C transaction",
//       response: await this.requestMpesaAPI(
//         "/mpesa/b2c/v3/paymentrequest",
//         payload
//       ),
//     };
//   }

//   // customer to business register urls
//   async c2bRegisterUrl({ ResponseType, ConfirmationURL, ValidationURL } = {}) {
//     if (!ResponseType) {
//       throw new Error("Missing required parameters: ResponseType.");
//     }

//     if (!ConfirmationURL) {
//       throw new Error("Missing required parameters: ConfirmationURL.");
//     }

//     if (!ValidationURL) {
//       throw new Error("Missing required parameters: ValidationURL.");
//     }

//     const payload = {
//       ShortCode: this.credentials.BUSINESS_SHORT_CODE,
//       ResponseType,
//       ConfirmationURL,
//       ValidationURL,
//     };

//     return {
//       action: "Tranxs - Mpesa C2B url registration",
//       response: await this.requestMpesaAPI(
//         "/mpesa/c2b/v1/registerurl",
//         payload
//       ),
//     };
//   }

//   async B2CAccountTopUp({
//     From,
//     To,
//     amount,
//     remarks,
//     queueTimeOutURL,
//     resultCallbackUrl,
//   }) {
//     const payload = {
//       Initiator: this.credentials.INITIATOR_NAME,
//       SecurityCredential: generateSecurityCredentials(
//         this.credentials.INITIATOR_PASSWORD
//       ),
//       CommandID: "BusinessPayToBulk",
//       SenderIdentifierType: "4",
//       RecieverIdentifierType: "4",
//       Amount: amount,
//       PartyA: From,
//       PartyB: To,
//       // AccountReference: "353353",
//       // Requester: "254708374149",
//       Remarks: remarks,
//       QueueTimeOutURL: queueTimeOutURL,
//       ResultURL: resultCallbackUrl,
//     };

//     return {
//       action: "Tranxs - Mpesa B2C AccountTopUp",
//       response: await this.requestMpesaAPI(
//         "/mpesa/b2b/v1/paymentrequest",
//         payload
//       ),
//     };
//   }
// }
