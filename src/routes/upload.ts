import { Router } from "express";
import { UploadController } from "../controllers/upload";
import { authenticate, isAdmin } from "../middlewares/auth";

const router = Router();
const uploadController = new UploadController();


router.get("/upload/signature", authenticate, isAdmin, uploadController.getUploadSignature);

export default router;