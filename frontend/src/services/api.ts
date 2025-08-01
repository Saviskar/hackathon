import { supabase } from '@/lib/supabaseClient';
import { Room, Booking, BookingRequest, RoomSearchFilters, User } from '@/types';
import { UUID } from 'crypto';

// Mock data
const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Lecture Hall A',
    venue: 'Main Building',
    capacity: 120,
    type: 'lecture',
    equipment: ['Projector', 'Microphone', 'Whiteboard'],
    location: 'Ground Floor',
    floor: 0,
    building: 'Main Building'
  },
  {
    id: 'room-2',
    name: 'Seminar Room B1',
    venue: 'Science Building',
    capacity: 30,
    type: 'seminar',
    equipment: ['Smart Board', 'Video Conference'],
    location: 'First Floor',
    floor: 1,
    building: 'Science Building'
  },
  {
    id: 'room-3',
    name: 'Computer Lab C',
    venue: 'Tech Building',
    capacity: 40,
    type: 'lab',
    equipment: ['30 Computers', 'Projector', 'Network Access'],
    location: 'Second Floor',
    floor: 2,
    building: 'Tech Building'
  },
  {
    id: 'room-4',
    name: 'Meeting Room D',
    venue: 'Admin Building',
    capacity: 12,
    type: 'meeting',
    equipment: ['Video Conference', 'Whiteboard'],
    location: 'Third Floor',
    floor: 3,
    building: 'Admin Building'
  }
];


export const api = {
  // Room APIs
  async getRooms(filters?: RoomSearchFilters): Promise<Room[]> {
    
    let query = supabase.from('room').select('*');

    if (filters) {
      if (filters.capacity) {
        query = query.gte('capacity', filters.capacity);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.building) {
        query = query.eq('building', filters.building);
      }
      if (filters.location) {
        query = query.or(
          `location.ilike.%${filters.location}%,building.ilike.%${filters.location}%`
        );
      }
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    console.log(data[0]);

    if (error) throw new Error(error.message);

    const transformedData = data.map(room => ({
      id: room.room_id,
      ...room,
      equipment: [
      room.has_projector ? 'Projector' : null,
        room.has_av ? 'AV Equipment' : null,
      ].filter(Boolean), // removes nulls
    }));
    return transformedData as Room[];
  },

  async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    const has_projector = room.equipment?.includes('Projector') ?? false;
  const has_av = room.equipment?.includes('AV Equipment') ?? false;

  const { equipment, ...roomWithoutEquipment } = room;
    
    const { data, error } = await supabase
      .from('room')
      .insert([{
        ...roomWithoutEquipment,
    has_projector,
    has_av,
    }])
    .select()
    .single();

      if (error) throw new Error(error.message);
    return {
    ...data,
    equipment: [
      data.has_projector ? 'Projector' : null,
      data.has_av ? 'AV Equipment' : null,
    ].filter(Boolean),
  } as Room;
  },

  async updateRoom(id: string, room: Partial<Room>): Promise<Room> {
  // Convert equipment array to booleans if present
  const has_projector = room.equipment?.includes('Projector');
  const has_av = room.equipment?.includes('AV Equipment');

  const updatePayload: unknown = {
    ...room,
    ...(has_projector !== undefined && { has_projector }),
    ...(has_av !== undefined && { has_av }),
    equipment: undefined,
  };

  const { data, error } = await supabase
    .from('room')
    .update(updatePayload)
    .eq('room_id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    equipment: [
      data.has_projector ? 'Projector' : null,
      data.has_av ? 'AV Equipment' : null,
    ].filter(Boolean),
  } as Room;
},


  async deleteRoom(id: string): Promise<void> {
    console.log('Deleting room with id:', id);
  const { error } = 
  await supabase.from('room_availability').delete().eq('room_id', id);
  await supabase.from('room').delete().eq('room_id', id);
  if (error) {
    console.error('Delete error:', error);
    throw new Error(error.message);
  }
},

  // Booking APIs
  async getBookings(userId?: string, date?: string): Promise<Booking[]> {
  //   const query  = await supabase
  //   .from('booking')
  //   .select(`*, room(*), Users(*)`)
  //   .order('start_time', { ascending: true });
    
  //   const { data, error } = await query;
  //   console.log('Raw bookings:', data);
  
  //     console.log('Bookings data:', data);
  // if (error) throw new Error(error.message);
  // return data as Booking[];

  let query = supabase
    .from("booking")
    .select(`
      booking_id,
      reason,
      date,
      start_time,
      end_time,
      status,
      created_at,
      room:room_id (
        name
      ),
      user:user_id (
        full_name,
        role,
        phone
      )
    `)
    .order("created_at", { ascending: false });

    if (userId) {
    query = query.eq("user_id", userId);
  }

  if (date) {
    // Match records whose start_time is on the same date
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    query = query
      .gte("start_time", start.toISOString())
      .lt("start_time", end.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  console.log(data);
  return data;

  },

  async createBooking(bookingData: BookingRequest): Promise<Booking> {
  // 1. Check for conflicts by querying bookings on the same room and date/time range
  const { data: conflicts, error: conflictError } = await supabase
    .from('booking')
    .select('*')
    .eq('room_id', bookingData.room_id)
    .eq('date', bookingData.date)
    .neq('status', 'cancelled')
    .or(`
      and(start_time.gte.${bookingData.start_time},start_time.lt.${bookingData.end_time}),
      and(end_time.gt.${bookingData.start_time},end_time.lte.${bookingData.end_time}),
      and(start_time.lte.${bookingData.start_time},end_time.gte.${bookingData.end_time})
    `);

  if (conflictError) {
    throw new Error(conflictError.message);
  }
  if (conflicts && conflicts.length > 0) {
    throw new Error('Time slot is already booked');
  }

  // 2. Insert the new booking
  const newBookingData = {
    ...bookingData,
    user_id: name, // Replace with actual user from auth context
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('booking')
    .insert(newBookingData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Booking;
},


  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
  const updatesWithTimestamp = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('booking')
    .update(updatesWithTimestamp)
    .eq('booking_id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Booking;
},


  async deleteBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('booking')
    .delete()
    .eq('booking_id', id);

  if (error) {
    throw new Error(error.message);
  }
},


  // Check room availability for a specific date and time range
  async checkAvailability(
  roomId: string,
  date: string,          // format: "YYYY-MM-DD"
  start_time: string,    // format: "HH:mm"
  end_time: string       // format: "HH:mm"
): Promise<boolean> {
  // Combine date + time to ISO 8601 strings
  const startDateTime = new Date(`${date}T${start_time}:00Z`).toISOString();
  const endDateTime = new Date(`${date}T${end_time}:00Z`).toISOString();

  // Build filter string with quoted timestamps
  const filterString = `
    and(start_time.gte.'${startDateTime}',start_time.lt.'${endDateTime}'),
    and(end_time.gt.'${startDateTime}',end_time.lte.'${endDateTime}'),
    and(start_time.lte.'${startDateTime}',end_time.gte.'${endDateTime}')
  `;

  const { data: conflicts, error } = await supabase
    .from('booking')
    .select('start_time, end_time')
    .eq('room_id', roomId)
    .eq('date', date)
    .neq('status', 'cancelled')
    .or(filterString);

  if (error) {
    throw new Error(`Availability check failed: ${error.message}`);
  }

  return (conflicts?.length ?? 0) === 0;
}



};