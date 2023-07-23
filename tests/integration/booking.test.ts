import httpStatus from "http-status";
import faker from '@faker-js/faker';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import { createBooking, createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createRoomWithoutVacancies, createTicket, createTicketTypeWithHotel, createUser, findBooking } from "../factories";
import { TicketStatus } from "@prisma/client";
import { number } from "joi";

beforeAll(async () => {
    await init();
});
  
beforeEach(async () => {
    await cleanDb();
});
  
const server = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
      
    describe('when token is valid', () => {
        it('should respond with status 404 when user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            await createRoomWithHotelId(hotel.id);
            const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);
            expect(result.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with 200 and booking details', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            await createBooking(user.id, room.id);
            const booking = await findBooking(user.id);
            const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);
            expect(result.status).toBe(httpStatus.OK);
            expect(result.body).toEqual({
                id: booking.id,
                room: {
                    id: expect.any(Number),
                    capacity: expect.any(Number),
                    hotelId: expect.any(Number),
                    name: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }
            });
        });
    });
})

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 when roomId does not exist', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const body = { roomId: 0 };

            const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(result.status).toBe(httpStatus.NOT_FOUND)
        })
        
        it('should respond with status 403 when no vacancy', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithoutVacancies(hotel.id);
            const body = { roomId: room.id };
            const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(result.status).toBe(httpStatus.FORBIDDEN);
        });

        it('should respond with status 200 and bookingId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const body = { roomId: room.id };
            const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(result.status).toBe(httpStatus.OK);
            expect(result.body).toEqual({
                bookingId: expect.any(Number)
            })
        })
    });
})

describe('PUT /booking/:bookingId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 when roomId does not exist', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            await createBooking(user.id, room.id);
            const body = { roomId: 0 };
            const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(result.status).toBe(httpStatus.NOT_FOUND)
        })
        
        it('should respond with status 403 when no vacancy', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithoutVacancies(hotel.id);
            const body = { roomId: room.id };
            const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(result.status).toBe(httpStatus.FORBIDDEN);
        });

        it('should respond with status 200 and bookingId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            const body = { roomId: room.id };
            const result = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
            expect(result.status).toBe(httpStatus.OK);
            expect(result.body).toEqual({
                bookingId: booking.id
            })
        });
    });
});