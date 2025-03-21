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

      return { action: "Mpesa stkPush", response: response.data };
    } catch (error) {
      console.error(
        "Tranxs - Mpesa error:",
        error.response ? error.response.data : error.message
      );
    }

    return;
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

      return { action: "Mpesa B2C payment request", reponse: response.data };
    } catch (error) {
      console.error(
        "Tranxs - Mpesa error:",
        error.response ? error.response.data : error.message
      );
    }

    return;
  }

  // customer to business register urls

  async c2bRegisterUrl({ ResponseType, ConfirmationURL, ValidationURL } = {}) {
    if (!ResponseType) {
      throw new Error("Missing required parameters: ResponseType.");
    }

    if (!ConfirmationURL) {
      throw new Error("Missing required parameters: ConfirmationURL.");
    }

    if (!ValidationURL) {
      throw new Error("Missing required parameters: ValidationURL.");
    }

    const auth = `Bearer ${await this.generateToken()}`;

    const payload = {
      ShortCode: this.credentials.BUSINESS_SHORT_CODE,
      ResponseType,
      ConfirmationURL,
      ValidationURL,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/c2b/v1/registerurl`,
        payload,
        {
          headers: {
            Authorization: auth,
          },
        }
      );

      return { action: "Mpesa C2B URL Registration", response: response.data };
    } catch (error) {
      console.error(
        "Tranxs - Mpesa error:",
        error.response ? error.response.data : error.message
      );
    }
    return;
  }

  async B2CAccountTopUp({
    From,
    To,
    amount,
    remarks,
    queueTimeOutURL,
    resultCallbackUrl,
  }) {
    const auth = `Bearer ${await this.generateToken()}`;

    const payload = {
      Initiator: this.credentials.INITIATOR_NAME,
      SecurityCredential: generateSecurityCredentials(
        this.credentials.INITIATOR_PASSWORD
      ),
      CommandID: "BusinessPayToBulk",
      SenderIdentifierType: "4",
      RecieverIdentifierType: "4",
      Amount: amount,
      PartyA: From,
      PartyB: To,
      // AccountReference: "353353",
      // Requester: "254708374149",
      Remarks: remarks,
      QueueTimeOutURL: queueTimeOutURL,
      ResultURL: resultCallbackUrl,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/b2b/v1/paymentrequest`,
        payload,
        {
          headers: {
            Authorization: auth,
          },
        }
      );

      return {
        action: "Mpesa B2C Account Top Up",
        reponse: response.data,
      };
    } catch (error) {
      console.error(
        "Tranxs - Mpesa error:",
        error.response ? error.response.data : error.message
      );
    }
  }
}
