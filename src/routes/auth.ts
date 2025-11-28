import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { authenticate, otpLimiter } from "../middlewares/auth";

const router = Router();

router.post("/signup", AuthController.signup);

router.post("/login", AuthController.login);

router.post("/verify-otp", otpLimiter, AuthController.verifyOtp);
router.post("/resend-otp", otpLimiter, AuthController.resendOtp);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

 router.use(authenticate);

 router.post("/change-password", AuthController.changePassword);

export default router;
