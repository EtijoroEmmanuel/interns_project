import { Router } from "express";
import { BoatController } from "../controllers/boat";
import { isAdmin } from "../middlewares/auth";

const router = Router();
const boatController = new BoatController();

/* ---------- ADMIN ROUTES ---------- */

// Boats (admin)
router.post("/boats", isAdmin, boatController.createBoat);
router.patch("/boats/:id", isAdmin, boatController.updateBoatDetails);
router.patch("/boats/:id/toggle-availability", isAdmin, boatController.toggleBoatAvailability);
router.delete("/boats/:id", isAdmin, boatController.deleteBoat);

// Boat media (admin)
router.post("/boats/:id/media", isAdmin, boatController.addMedia);
router.delete("/boats/:id/media/:mediaId", isAdmin, boatController.deleteMedia);

// Packages (admin)
router.patch("/boats/:id/packages/:packageId", isAdmin, boatController.updatePackage);
router.delete("/boats/:id/packages/:packageId", isAdmin, boatController.deletePackage);

// Package media (admin)
router.post("/boats/:id/packages/:packageId/media", isAdmin, boatController.addMedia);
router.delete("/boats/:id/packages/:packageId/media/:mediaId", isAdmin, boatController.deleteMedia);

/* ---------- PUBLIC ROUTES ---------- */

// Boats (public)
router.get("/boats", boatController.getBoats);
router.get("/boats/:id", boatController.getBoatById);

// Packages (public)
router.get("/packages", boatController.getAllPackages);
router.get("/boats/:id/packages", boatController.getAllPackagesForBoat);
router.get("/boats/:id/packages/:packageId", boatController.getPackageById);

export default router;
