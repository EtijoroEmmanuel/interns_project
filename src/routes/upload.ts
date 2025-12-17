import { Router } from "express";
import { UploadController } from "../controllers/upload";
import {  isAdmin } from "../middlewares/auth";

const router = Router();
const uploadController = new UploadController();


router.get("/upload/signature", isAdmin, uploadController.getUploadSignature);

export default router;