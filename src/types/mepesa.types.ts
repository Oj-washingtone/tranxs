export interface Credentials {
  CONSUMER_KEY: string;
  CONSUMER_SECRET: string;
  BUSINESS_SHORT_CODE: string;
  PASS_KEY?: string;
  INITIATOR_NAME?: string;
  INITIATOR_PASSWORD?: string;
}

type TransactionType = "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";

export interface STKPushRequestBody {
  phone: string;
  amount: number;
  callbackUrl: string;
  account?: string;
  TransactionDesc?: string;
  TransactionType?: TransactionType;
  PartyB?: number | string;
}

type B2CCommandID = "SalaryPayment" | "BusinessPayment" | "PromotionPayment";

export interface B2CRequestOptions {
  phone: string;
  amount: number;
  resultCallbackURL: string;
  queueTimeOutURL: string;
  ocattion: string;
  commandID: B2CCommandID;
  remarks?: string;
}

type ResponseType = "Cancelled" | "Completed";

export interface C2BRegisterUrlOptions {
  responseType: ResponseType;
  confirmationURL: string;
  validationURL: string;
}
