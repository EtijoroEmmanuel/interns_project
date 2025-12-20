import { Router, Request, Response } from "express";
import { paystackWebhookHandler } from "../controllers/webhook";

const router = Router();

router.post(
  "/paystack",
  async (req: Request, res: Response) => {
    return paystackWebhookHandler.handleWebhook(req, res);
  }
);

export default router;