import fs from "fs";
import path from "path";
import { publicEncrypt, constants } from "crypto";
// const __dirname = path.resolve();

export function generateSecurityCredentials(password: string): string {
  const secFile = path.join(__dirname, "cert.cer");
  let publicKey: string;

  try {
    publicKey = fs.readFileSync(secFile, "utf8");
  } catch (error) {
    console.error("Error reading the public key file", error);
    throw error;
  }

  const buffer = Buffer.from(password);
  const encryption = publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_PADDING,
    },
    buffer
  );

  return encryption.toString("base64");
}
