import { Router } from "express";
import { SpecialOccasionBoatController } from "../controllers/package";
import { authenticate, isAdmin } from "../middlewares/auth";

const router = Router();
const packageController = new SpecialOccasionBoatController();

router.post("/special-occasion-boats", authenticate, isAdmin, packageController.createSpecialOccasionBoat);


router.post("/special-occasion-boats/:id/media", authenticate, isAdmin, packageController.addMedia);
router.patch("/special-occasion-boats/:id/media/primary", authenticate, isAdmin, packageController.updatePrimaryMedia);
router.delete("/special-occasion-boats/:id/media/:mediaId", authenticate, isAdmin, packageController.deleteMedia);


router.patch("/special-occasion-boats/:id", authenticate, isAdmin, packageController.updateSpecialOccasionBoat);
router.delete("/special-occasion-boats/:id", authenticate, isAdmin, packageController.deleteSpecialOccasionBoat);


router.get("/special-occasion-boats", packageController.getAllSpecialOccasionBoats);
router.get("/special-occasion-boats/:id", packageController.getSpecialOccasionBoatById);

export default router;