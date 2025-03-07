import axios from "axios";
import { config } from "dotenv";

config();

const createMpesaToken = async (req, res, next) => {
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const key = process.env.MPESA_CONSUMER_KEY;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  try {
    const response = await axios.get(
      "https://api.safaricom.co.ke/oauth/v1/generate",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          grant_type: "client_credentials",
        },
      }
    );

    console.log("Token response:", response.data);

    req.token = response.data.access_token;
    next();
  } catch (error) {
    console.error(
      "Axios error:",
      error.response ? error.response.data : error.message
    );
    res
      .status(400)
      .json({ error: error.response ? error.response.data : error.message });
  }
};

export default createMpesaToken;
