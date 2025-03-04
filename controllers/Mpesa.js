import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { generateSecurityCredentials } from "../src/Security/SecGen.js";

export class Mpesa {
  constructor(credentials, environment = "sandbox") {
    this.credentials = credentials;
    this.environment = environment;
    this.baseUrl =
      environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
  }

  async generateToken() {
    const auth = Buffer.from(
      `${this.credentials.CONSUMER_KEY}:${this.credentials.CONSUMER_SECRET}`
    ).toString("base64");

    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate`, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },

        params: {
          grant_type: "client_credentials",
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error(
        "Tranx Error:",
        error.response ? error.response.data : error.message
      );
    }

    return null;
  }

  async stkPush({
    phone,
    amount,
    callbackUrl,
    account = "",
    TransactionDesc = "Payment",
  }) {
    const formated_phone = phone.replace(/^0+/, "254");
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(
      this.credentials.BUSINESS_SHORT_CODE +
        this.credentials.PASS_KEY +
        timestamp
    ).toString("base64");

    const payload = {
      BusinessShortCode: this.credentials.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formated_phone,
      PartyB: this.credentials.BUSINESS_SHORT_CODE,
      PhoneNumber: formated_phone,
      CallBackURL: callbackUrl,
      AccountReference: account,
      TransactionDesc: TransactionDesc,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${await this.generateToken()}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Tranx Mpesa Error:",
        error.response ? error.response.data : error.message
      );
    }

    return null;
  }

  // Mpesa B2C

  async b2c({
    phone,
    amount,
    resultCallbackUrl,
    queueTimeOutURL,
    occasion = "Withdrawal",
    commandID,
    remarks = "Withdrawal",
  }) {
    const auth = `Bearer ${await this.generateToken()}`;
    const originatorConversationID = uuidv4();

    const payload = {
      OriginatorConversationID: originatorConversationID,
      InitiatorName: this.credentials.INITIATOR_NAME,
      SecurityCredential: generateSecurityCredentials(
        this.credentials.INITIATOR_PASSWORD
      ),
      CommandID: commandID,
      Amount: amount,
      PartyA: this.credentials.BUSINESS_SHORT_CODE,
      PartyB: phone,
      Remarks: remarks,
      QueueTimeOutURL: queueTimeOutURL,
      ResultURL: resultCallbackUrl,
      Occasion: occasion,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/b2c/v3/paymentrequest`,
        payload,
        {
          headers: {
            Authorization: auth,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "B2C initiator error:",
        error.response ? error.response.data : error.message
      );
      return error.response ? error.response.data : error.message;
    }
  }
}
