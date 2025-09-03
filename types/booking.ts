import { user } from "./auth";
import { room } from "./room";

// export interface booking {
//   user: user;
//   room: room;
//   checkInDate: Date;
//   checkOutDate: Date;
//   status: string;
// }
// types.ts
export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  bookingDate: string;
  // Booking fields ...

  userName: string;
  email: string;
  contact: string;

  hostelName: string;
  location: string;
}
