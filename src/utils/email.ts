import * as SibApiV3Sdk from "sib-api-v3-typescript";
import { env } from "../config/env";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

if (!env.EMAIL.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not set in environment variables");
}

if (!env.EMAIL.BREVO_SENDER_EMAIL) {
  throw new Error("BREVO_SENDER_EMAIL is not set in environment variables");
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  env.EMAIL.BREVO_API_KEY
);

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Boat Cruise",
    email: env.EMAIL.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: options.to }];
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.html;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error: any) {
    if (error.response?.body) {
      throw new Error(
        "Failed to send email: " + JSON.stringify(error.response.body)
      );
    }
    throw new Error("Failed to send email");
  }
};
