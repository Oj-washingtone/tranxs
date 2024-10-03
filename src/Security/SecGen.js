import fs from "fs";
import path from "path";
import { publicEncrypt, constants } from "crypto";
import { config } from "dotenv";

config();

export function generateSecurityCredentials(PASS_KEY) {
  const secFile = path.join(process.cwd(), "src", "Security", "cert.cer");

  let publicKey;

  try {
    publicKey = fs.readFileSync(secFile, "utf8");
  } catch (error) {
    console.error("Error reading the public key file", error);
    throw error;
  }

  const buffer = Buffer.from(PASS_KEY);
  const encryption = publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_PADDING,
    },
    buffer
  );

  return encryption.toString("base64");
}
