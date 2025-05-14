import { Mpesa } from "./mpesa/Mpesa";
import { Credentials } from "./types/mepesa.types";
import { Environment } from "./types/common";

export function useMpesa(
  credentials: Credentials,
  environment: Environment = "sandbox"
): Mpesa {
  return new Mpesa(credentials, environment);
}

// use Service Registry useService or usePayment whichever sounds nice
