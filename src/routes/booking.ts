import { Router } from "express";
import { BookingController } from "../controllers/booking";
import { authenticate, isAdmin } from "../middlewares/auth";

const router = Router();
const bookingController = new BookingController();

/* ---------- ADMIN ROUTES ---------- */

router.get("/admin/bookings", isAdmin, bookingController.getAllBookings);
router.get("/admin/bookings/:id", isAdmin, bookingController.getBookingById);

/* ---------- USER ROUTES (AUTHENTICATED) ---------- */

// Initialize booking and get payment link
router.post("/bookings/initialize", authenticate, bookingController.initializeBooking);

// Verify payment and confirm booking (can be called from frontend after payment)
router.get("/bookings/verify/:reference", authenticate, bookingController.verifyBookingPayment);

// Get booking by payment reference (useful for checking status)
router.get("/bookings/reference/:reference", authenticate, bookingController.getBookingByReference);

// Get all user bookings
router.get("/bookings", authenticate, bookingController.getUserBookings);

// Get specific booking by ID
router.get("/bookings/:id", authenticate, bookingController.getBookingById);

// Cancel booking and process refund
router.patch("/bookings/:id/cancel", authenticate, bookingController.cancelBooking);

export default router;