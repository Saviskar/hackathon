import { supabase } from '@/lib/supabaseClient';
import { Room, Booking, BookingRequest, RoomSearchFilters, User } from '@/types';

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

const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    roomId: 'room-1',
    userId: 'lecturer-1',
    title: 'Advanced Algorithms',
    description: 'CS401 - Weekly lecture',
    date: '2024-08-05',
    startTime: '09:00',
    endTime: '10:30',
    status: 'confirmed',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z'
  },
  {
    id: 'booking-2',
    roomId: 'room-2',
    userId: 'lecturer-1',
    title: 'Research Seminar',
    description: 'Weekly research discussion',
    date: '2024-08-06',
    startTime: '14:00',
    endTime: '15:30',
    status: 'confirmed',
    createdAt: '2024-08-01T11:00:00Z',
    updatedAt: '2024-08-01T11:00:00Z'
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

    if (error) throw new Error(error.message);

    const transformedData = data.map(room => ({
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

    const { data, error } = await supabase
      .from('room')
      .insert([{
      ...room,
      has_projector,
      has_av,
      equipment: undefined, // Don't insert `equipment` directly into Supabase
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
    .eq('id', id)
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
  const { error } = await supabase.from('room').delete().eq('id', id);
  if (error) throw new Error(error.message);
},

  // Booking APIs
  async getBookings(userId?: string, date?: string): Promise<Booking[]> {
    let query = supabase
    .from('booking')
    .select('*, room(*)');

    if (userId) {
    query = query.eq('userId', userId);
  }

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data as Booking[];
  },

  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    
    // Check for conflicts
    const conflicts = mockBookings.filter(b => 
      b.roomId === bookingData.roomId &&
      b.date === bookingData.date &&
      b.status !== 'cancelled' &&
      (
        (bookingData.startTime >= b.startTime && bookingData.startTime < b.endTime) ||
        (bookingData.endTime > b.startTime && bookingData.endTime <= b.endTime) ||
        (bookingData.startTime <= b.startTime && bookingData.endTime >= b.endTime)
      )
    );
    
    if (conflicts.length > 0) {
      throw new Error('Time slot is already booked');
    }
    
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      ...bookingData,
      userId: 'lecturer-1', // In real app, get from auth context
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockBookings.push(newBooking);
    return newBooking;
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const index = mockBookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    
    mockBookings[index] = { ...mockBookings[index], ...updates, updatedAt: new Date().toISOString() };
    return mockBookings[index];
  },

  async deleteBooking(id: string): Promise<void> {
    const index = mockBookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    mockBookings.splice(index, 1);
  },

  // Check room availability for a specific date and time range
  async checkAvailability(roomId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
    
    const conflicts = mockBookings.filter(b => 
      b.roomId === roomId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      (
        (startTime >= b.startTime && startTime < b.endTime) ||
        (endTime > b.startTime && endTime <= b.endTime) ||
        (startTime <= b.startTime && endTime >= b.endTime)
      )
    );
    
    return conflicts.length === 0;
  }
};