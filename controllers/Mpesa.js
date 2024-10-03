import axios from "axios";

export default class Mpesa {
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
    account = "Tranx-helper",
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
}
