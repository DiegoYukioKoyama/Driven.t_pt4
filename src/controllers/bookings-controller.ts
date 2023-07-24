import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";    

export async function getBookingByUserId(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    try {
        const booking = await bookingService.getBookingByUserId(userId);
        return res.status(httpStatus.OK).send({ 
            id: booking.id,
            Room: booking.Room
        });
    } catch (e) {
        res.sendStatus(httpStatus.NOT_FOUND);
    }
}

export async function createBooking(req: AuthenticatedRequest, res: Response){
    const { roomId } = req.body;
    const { userId } = req;
    try {
        const booking = await bookingService.createBooking(userId, Number(roomId));
        return res.status(httpStatus.OK).send({ bookingId: booking });
    } catch (e) {
        if(e.name === 'NotFoundError'){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if(e.name === 'NoVacancyError'){
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
        return res.sendStatus(httpStatus.FORBIDDEN);
    }
}

export async function changeRoom(req: AuthenticatedRequest, res: Response){
    const { roomId } = req.body;
    const { userId } = req;
    const { bookingId } = req.params;

    try {
        const booking = await bookingService.changeRoom(userId, Number(roomId), Number(bookingId));
        return res.status(httpStatus.OK).send({ bookingId: booking });
    } catch (e) {
        if(e.name === 'NotFoundError'){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if(e.name === 'NoVacancyError'){
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
        return res.sendStatus(httpStatus.FORBIDDEN);
    }
}