import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '1020',
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export async function createRoomWithoutVacancies(hotelId: number){
  return prisma.room.create({
    data: {
      name: '1020',
      capacity: 0,
      hotelId: hotelId,
    },
  });
}

export async function createFakeRoomId(){
  const roomId = faker.datatype.number({max: 100});
  return { roomId };
}
