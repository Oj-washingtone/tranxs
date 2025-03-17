import fs from "fs";
import path from "path";
import { publicEncrypt, constants } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateSecurityCredentials(PASS_KEY) {
  const secFile = path.join(__dirname, "cert.cer");

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
