import axios, { AxiosInstance, AxiosError } from "axios";
import crypto from "crypto";
import { InternalServerErrorException } from "./exception";

interface InitializePaymentParams {
  email: string;
  amount: number; // in Naira
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}

interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: "success" | "failed" | "abandoned";
    paid_at: string;
    channel: string;
    currency: string;
    metadata: Record<string, unknown>;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

interface RefundPaymentParams {
  transaction: string | number; // transaction reference or id
  amount?: number; // optional, full refund if not provided (in Naira)
  merchant_note?: string;
  customer_note?: string;
}

interface RefundPaymentResponse {
  status: boolean;
  message: string;
  data: {
    transaction: {
      id: number;
      reference: string;
    };
    integration: number;
    deducted_amount: number;
    channel: string | null;
    merchant_note: string;
    customer_note: string;
    status: string;
    refunded_by: string;
    refunded_at: string;
  };
}

interface PaystackErrorResponse {
  status: boolean;
  message: string;
}

export class PaystackService {
  private api: AxiosInstance;
  private secretKey: string;

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error("Paystack secret key is required");
    }

    this.secretKey = secretKey;
    this.api = axios.create({
      baseURL: "https://api.paystack.co",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Initialize a payment transaction
   * @param params - Payment initialization parameters
   * @returns Payment authorization URL and reference
   */
  async initializePayment(
    params: InitializePaymentParams
  ): Promise<InitializePaymentResponse["data"]> {
    try {
      const response = await this.api.post<InitializePaymentResponse>(
        "/transaction/initialize",
        {
          email: params.email,
          amount: params.amount,
          reference: params.reference,
          metadata: params.metadata,
          callback_url: params.callback_url,
          currency: "NGN",
        }
      );

      if (!response.data.status) {
        throw new InternalServerErrorException(
          response.data.message || "Failed to initialize payment"
        );
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<PaystackErrorResponse>;
        if (axiosError.response?.data?.message) {
          throw new InternalServerErrorException(
            `Paystack error: ${axiosError.response.data.message}`
          );
        }
      }
      throw new InternalServerErrorException(
        "Failed to initialize payment with Paystack"
      );
    }
  }

  /**
   * Verify a payment transaction
   * @param reference - Transaction reference
   * @returns Payment verification data
   */
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse["data"]> {
    try {
      const response = await this.api.get<VerifyPaymentResponse>(
        `/transaction/verify/${reference}`
      );

      if (!response.data.status) {
        throw new InternalServerErrorException(
          response.data.message || "Failed to verify payment"
        );
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<PaystackErrorResponse>;
        if (axiosError.response?.data?.message) {
          throw new InternalServerErrorException(
            `Paystack error: ${axiosError.response.data.message}`
          );
        }
      }
      throw new InternalServerErrorException(
        "Failed to verify payment with Paystack"
      );
    }
  }

  /**
   * Process a refund for a transaction
   * @param params - Refund parameters
   * @returns Refund transaction data
   */
  async processRefund(params: RefundPaymentParams): Promise<RefundPaymentResponse["data"]> {
    try {
      const response = await this.api.post<RefundPaymentResponse>(
        "/refund",
        {
          transaction: params.transaction,
          amount: params.amount,
          merchant_note: params.merchant_note,
          customer_note: params.customer_note,
          currency: "NGN",
        }
      );

      if (!response.data.status) {
        throw new InternalServerErrorException(
          response.data.message || "Failed to process refund"
        );
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<PaystackErrorResponse>;
        if (axiosError.response?.data?.message) {
          throw new InternalServerErrorException(
            `Paystack refund error: ${axiosError.response.data.message}`
          );
        }
      }
      throw new InternalServerErrorException(
        "Failed to process refund with Paystack"
      );
    }
  }

  /**
   * Verify Paystack webhook signature
   * @param payload - Raw request body (string)
   * @param signature - X-Paystack-Signature header value
   * @returns True if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(payload)
      .digest("hex");

    return hash === signature;
  }

  /**
   * Generate a unique payment reference
   * @param prefix - Optional prefix for the reference
   * @returns Unique reference string
   */
  generateReference(prefix: string = "BKG"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}

// Singleton instance
let paystackInstance: PaystackService | null = null;

export const getPaystackService = (): PaystackService => {
  if (!paystackInstance) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY environment variable is not set");
    }
    paystackInstance = new PaystackService(secretKey);
  }
  return paystackInstance;
};

export default PaystackService;