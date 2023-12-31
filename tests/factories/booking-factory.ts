import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createBooking(userId: number, roomId: number){
    return prisma.booking.create({
        data: {
            roomId,
            userId
        }
    })
}

export async function findBooking(userId: number) {
    return prisma.booking.findFirst({
        where: {
            userId
        }, include: {
            Room: true
        }
    })
}