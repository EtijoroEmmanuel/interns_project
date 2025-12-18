import { Router } from "express";
import { PackageController } from "../controllers/pacakge";
import { isAdmin } from "../middlewares/auth";

const router = Router();
const packageController = new PackageController();

/* ---------- ADMIN ROUTES ---------- */

// Packages (admin)
router.post("/packages", isAdmin, packageController.createPackage);
router.delete("/packages/:id", isAdmin, packageController.deletePackage);

// Package media (admin)
router.post("/packages/:id/media", isAdmin, packageController.addMedia);
router.delete("/packages/:id/media/:mediaId", isAdmin, packageController.deleteMedia);

/* ---------- PUBLIC ROUTES ---------- */

// Packages (public)
router.get("/packages", packageController.getAllPackages);

export default router;