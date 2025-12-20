import mongoose, { Schema, Types } from "mongoose";

export const BOOKING_STATUS = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    ABANDONED: "ABANDONED",
} as const;

export const PAYMENT_STATUS = {
    PENDING: "PENDING",
    SUCCESSFUL: "SUCCESSFUL",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
    PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
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
            unique: true,
            sparse: true,
            index: true,
        },

        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
            index: true,
        },

        paymentMethod: {
            type: String,
            trim: true,
        },

        paymentChannel: {
            type: String,
            trim: true,
        },

        paidAt: {
            type: Date,
        },

        refundAmount: {
            type: Number,
            default: 0,
        },

        refundPercentage: {
            type: Number,
            default: 0,
        },

        refundReference: {
            type: String,
        },

        refundedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

bookingSchema.index({ paymentReference: 1 });

bookingSchema.index({ user: 1, paymentStatus: 1 });

bookingSchema.index({ paymentStatus: 1, createdAt: 1 });

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