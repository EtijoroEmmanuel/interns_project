import mongoose, { Schema } from "mongoose";

export const BOOKING_STATUS = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
} as const;

const bookingSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        boat: {
            type: Schema.Types.ObjectId,
            ref: "Boat",
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        duration: {
            type: Number,
            required: true,
        },

        time: {
            type: String,
            required: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },

        numberOfGuest: {
            type: Number,
            required: true,
            min: 1,
        },

        occasion: {
            type: String,
            trim: true,
        },

        specialRequest: {
            type: String,
            trim: true,
        },

        totalPrice: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(BOOKING_STATUS),
            default: BOOKING_STATUS.PENDING,
        },

        paymentReference: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export type Booking = mongoose.InferSchemaType<typeof bookingSchema>;

export const BookingModel = mongoose.model<Booking>(
    "Booking",
    bookingSchema
);
