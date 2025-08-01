export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'lecturer';
  department?: string;
}

export interface Room {
  id: string;
  name: string;
  venue: string;
  capacity: number;
  type: 'lecture' | 'seminar' | 'lab' | 'meeting';
  equipment: string[];
  location: string;
  floor: number;
  building: string;
}

export interface Booking {
  booking_id: string;
  room_id: string;
  room?: Room;
  user_id: string;
  user?: User;
  reason: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  room_id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string,  // send combined ISO strings
  end_time: string
}

export interface RoomSearchFilters {
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  type?: string;
  building?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  booking?: Booking;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: Booking;
}