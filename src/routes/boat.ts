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

/* ---------- PUBLIC ROUTES ---------- */

// Boats (public)
router.get("/boats", boatController.getBoats);
router.get("/boats/:id", boatController.getBoatById);

export default router;