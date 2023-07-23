import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { changeRoom, createBooking, getBookingByUserId } from "@/controllers";
import { createBookingSchema } from "@/schemas";

const bookingsRouter = Router();

bookingsRouter
    .all('/*', authenticateToken)
    .get('/', getBookingByUserId)
    .post('/',validateBody(createBookingSchema), createBooking)
    .put('/:bookingId', validateBody(createBookingSchema), changeRoom);

export { bookingsRouter };
