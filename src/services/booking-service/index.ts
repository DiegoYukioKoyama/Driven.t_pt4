import { noVacancyError, notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketsRepository from "@/repositories/tickets-repository";

async function getBookingByUserId(userId: number){
    const booking = await bookingRepository.findBookingByUserId(userId);

    if(!booking) throw notFoundError();

    return booking;
}

async function createBooking(userId: number, roomId: number){
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) throw notFoundError();

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if(!ticket || ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false || ticket.status === 'RESERVED'){
        throw noVacancyError();
    }

    const room = await hotelRepository.findRoomById(roomId);
    if(!room) throw notFoundError();

    if(room.capacity === room.Booking.length) throw noVacancyError();

    const booking = await bookingRepository.createBooking(userId, roomId);
    return booking.id;
}

async function changeRoom(userId: number, roomId: number, bookingId: number){
    const booking = await bookingRepository.findBookingByUserId(userId);
    if(!booking) throw noVacancyError();

    const room = await hotelRepository.findRoomById(roomId);
    if(!room) throw notFoundError();

    if(room.capacity === room.Booking.length) throw noVacancyError();

    const updateBooking = await bookingRepository.updateBooking(roomId, bookingId);
    return updateBooking.id;
}

export default {
    getBookingByUserId,
    createBooking,
    changeRoom,
}