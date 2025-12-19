import { Router } from "express";
import { BookingController } from "../controllers/booking";
import { authenticate, isAdmin } from "../middlewares/auth";

const router = Router();
const bookingController = new BookingController();

/* ---------- ADMIN ROUTES ---------- */

router.get("/admin/bookings", isAdmin, bookingController.getAllBookings);
router.get("/admin/bookings/:id", isAdmin, bookingController.getBookingById);

/* ---------- USER ROUTES (AUTHENTICATED) ---------- */

router.post("/bookings/create", authenticate, bookingController.createBooking);
router.get("/bookings", authenticate, bookingController.getUserBookings);
router.get("/bookings/:id", authenticate, bookingController.getBookingById);
router.patch("/bookings/:id/cancel", authenticate, bookingController.cancelBooking);

export default router;