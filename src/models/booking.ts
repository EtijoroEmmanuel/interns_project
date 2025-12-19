import mongoose, { Schema, Types } from "mongoose";

export const BOOKING_STATUS = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    ABANDONED: "ABANDONED",
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
            index: true,
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

export interface CreateBookingInput {
    userId: string | Types.ObjectId;
    boatId: string | Types.ObjectId;
    startDate: Date;
    endDate: Date;
    numberOfGuest: number;
    occasion?: string;
    specialRequest?: string;
}

export const BookingModel = mongoose.model<Booking>(
    "Booking",
    bookingSchema
);