import { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, MapPin, User, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await api.deleteBooking(bookingId);
      setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
      toast({
        title: "Booking deleted",
        description: "Booking has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Bookings</h1>
        <p className="text-muted-foreground">Manage all room bookings across the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Records ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
  <TableCell>
    <div>
      <div className="font-medium">{booking.reason}</div>
      {/* You don't have description in your API, remove or add if needed */}
    </div>
  </TableCell>
  <TableCell>
    <div className="flex items-start gap-2 flex-col">
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        <span className="text-sm font-medium">{booking.room?.name || 'Unknown Room'}</span>
      </div>
      {/* You might not have building or equipment info unless you expand the query */}
    </div>
  </TableCell>
  <TableCell>
    <div className="flex items-center gap-1">
      <Calendar className="h-3 w-3" />
      <div className="text-sm">
        <div>{format(parseISO(booking.start_time), 'MMM d, yyyy')}</div>
        <div className="text-muted-foreground">
          {format(parseISO(booking.start_time), 'HH:mm')} - {format(parseISO(booking.end_time), 'HH:mm')}
        </div>
      </div>
    </div>
  </TableCell>
  <TableCell>
    <div className="flex items-center gap-1">
      <User className="h-3 w-3" />
      <span className="text-sm">{booking.user?.full_name || 'Unknown User'}</span>
    </div>
  </TableCell>
  <TableCell>
    <Badge className={getStatusColor(booking.status)}>
      {booking.status}
    </Badge>
  </TableCell>
  <TableCell>
    <div className="text-sm text-muted-foreground">
      {format(parseISO(booking.created_at), 'MMM d, yyyy')}
    </div>
  </TableCell>
  <TableCell>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => handleDeleteBooking(booking.booking_id)}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  </TableCell>
</TableRow>

                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};