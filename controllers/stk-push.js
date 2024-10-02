import axios from "axios";
import { config } from "dotenv";

config();

export async function stkPush(req, res) {
  const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE;
  const { phone, amount, account } = req.body;

  const formated_phone = phone.replace(/^0+/, "254");

  // timeStamp

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

  const password = Buffer.from(
    BUSINESS_SHORT_CODE + process.env.MPESA_PASS_KEY + timestamp
  ).toString("base64");

  const payload = {
    BusinessShortCode: BUSINESS_SHORT_CODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: formated_phone,
    PartyB: process.env.MPESA_BUSINESS_SHORT_CODE,
    PhoneNumber: formated_phone,
    CallBackURL: `https://mydomain.com/callback`,
    AccountReference: account,
    TransactionDesc: "Payment",
  };

  try {
    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      }
    );

    return res.status(201).json(response.data);
  } catch (error) {
    console.error(
      "Axios error:",
      error.response ? error.response.data : error.message
    );
    res
      .status(400)
      .json({ error: error.response ? error.response.data : error.message });
  }
}
