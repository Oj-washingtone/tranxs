import axios from "axios";

import { AirtelCredentials } from "../types/airtel.types";
import { Environment } from "../types/common";

export class AirtelMoney {
  private credentials: AirtelCredentials;
  private environment: Environment;
  private baseURL: string;

  constructor(
    credentials: AirtelCredentials,
    environment: Environment = "sandbox"
  ) {
    this.credentials = credentials;
    this.environment = environment;
    this.baseURL =
      this.environment === "production"
        ? "https://openapi.airtel.africa"
        : "https://openapiuat.airtel.africa";
  }

  private async generateAuthToken(): Promise<string | null> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/oauth2/token`,
        {
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecretKey,
          grant_type: "client_credentials",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      console.error(
        "Tranx Error:",
        error.response ? error.response.data : error.message
      );
    }

    return null;
  }

  // USSD Push (Request mayment from user)
  async USSDPush(): Promise<void> {
    console.log(this.generateAuthToken());
  }
}
