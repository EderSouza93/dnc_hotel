import { Hotel } from "@prisma/client";

export const hotelMock: Hotel = {
  id: 1,
  name: 'Test Hotel',
  description: 'A test hotel description',
  image: 'test-image.jpg',
  price: 100,
  address: '123 Test St',
  ownerId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}