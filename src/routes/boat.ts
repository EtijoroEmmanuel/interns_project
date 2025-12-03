import { Router } from "express";
import { BoatController } from "../controllers/boat";
import { authenticate, isAdmin } from "../middlewares/auth";

const router = Router();
const boatController = new BoatController();

router.post("/boats", authenticate, isAdmin, boatController.createBoat);

router.post("/boats/:id/media", authenticate, isAdmin, boatController.addMedia);
router.patch("/boats/:id/media/primary", authenticate, isAdmin, boatController.updatePrimaryMedia);
router.delete("/boats/:id/media/:mediaId", authenticate, isAdmin, boatController.deleteMedia);

router.patch("/boats/:id", authenticate, isAdmin, boatController.updateBoatDetails);
router.patch("/boats/:id/toggle-availability", authenticate, isAdmin, boatController.toggleAvailability);
router.delete("/boats/:id", authenticate, isAdmin, boatController.deleteBoat);

router.get("/boats", boatController.getBoats);
router.get("/boats/:id", boatController.getBoatById);

export default router;