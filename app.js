import Mpesa from "./controllers/Mpesa.js";
import dotenv from "dotenv";

// export the transactions class for users to import
// export default Mpesa;

// tetsting the class

dotenv.config();

const credentials = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE,
  PASS_KEY: process.env.MPESA_PASS_KEY,
  B2C_INITIATOR_NAME: process.env.MPESA_B2C_INITIATOR_NAME,
};

const mpesa = new Mpesa(credentials, "production");

// send stk push
// mpesa
//   .stkPush({
//     phone: "0712028821",
//     amount: 100,
//     account: "Washingtone Jalang'o",
//     callbackUrl: "https://mydomain.com/callback",
//   })
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// B2C
// mpesa
//   .B2C({
//     phone: "254712028821",
//     amount: 1,
//     resultCallbackUrl: "https://mydomain.com/callback",
//     queueTimeOutURL: "https://mydomain.com/timeout",
//     commandID: "BusinessPayment",
//   })
//   .then((response) => {
//     console.log(response);
//   });
