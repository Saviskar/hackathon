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
      setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
      setBookings(prev => prev.filter(b => b.id !== bookingId));
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
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.title}</div>
                        {booking.description && (
                          <div className="text-sm text-muted-foreground">{booking.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
  <div className="flex items-start gap-2 flex-col">
    <div className="flex items-center gap-1">
      <MapPin className="h-3 w-3" />
      <span className="text-sm font-medium">{booking.room?.name || 'Unknown Room'}</span>
    </div>
    {booking.room && (
      <>
        <div className="text-xs text-muted-foreground">
          {booking.room.building}
        </div>
        {booking.room.equipment && booking.room.equipment.length > 0 && (
          <ul className="text-xs list-disc list-inside space-y-0.5 mt-1 text-muted-foreground">
            {booking.room.equipment.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </>
    )}
  </div>
</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <div className="text-sm">
                          <div>{format(parseISO(booking.date), 'MMM d, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-sm">{booking.user?.name || booking.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(booking.createdAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
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