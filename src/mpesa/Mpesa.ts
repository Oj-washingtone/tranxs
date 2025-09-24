import axios from "axios";
import {
  B2CRequestOptions,
  C2BRegisterUrlOptions,
  Credentials,
  STKPushRequestBody,
} from "../types/mepesa.types";
import { Environment, ReturnStructure } from "../types/common";
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

  async stkPush(options: STKPushRequestBody): Promise<ReturnStructure | any> {
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
      TransactionType: options.TransactionType || "CustomerPayBillOnline",
      Amount: options.amount,
      PartyA: phone,
      PartyB: options.PartyB || this.credentials.BUSINESS_SHORT_CODE,
      PhoneNumber: phone,
      CallBackURL: options.callbackUrl,
      AccountReference: options.account,
      TransactionDesc: options.TransactionDesc || "",
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
  async b2c(options: B2CRequestOptions): Promise<ReturnStructure | any> {
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

  async c2bRegisterUrl(
    options: C2BRegisterUrlOptions
  ): Promise<ReturnStructure> {
    if (!options.responseType) {
      throw new Error("Missing required field, responseType");
    }

    if (!options.confirmationURL) {
      throw new Error("Missing required field , confirmationURL");
    }

    if (!options.validationURL) {
      throw new Error("Missing required field, validationURL");
    }

    const payload = {
      ShortCode: this.credentials.BUSINESS_SHORT_CODE,
      ResponseType: options.responseType,
      ConfirmationURL: options.confirmationURL,
      ValidationURL: options.validationURL,
    };

    return {
      action: "Tranxs - Mpesa C2B url registration",
      response: await this.requestMpesaAPI(
        "/mpesa/c2b/v1/registerurl",
        payload
      ),
    };
  }
}
