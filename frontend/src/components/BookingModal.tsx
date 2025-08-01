import { useState } from 'react';
import { Room, BookingRequest } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, MapPin, Users, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onOpenChange,
  room,
  initialDate = '',
  initialStartTime = '',
  initialEndTime = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: initialDate,
    startTime: initialStartTime,
    endTime: initialEndTime
  });
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsAvailable(null); // Reset availability when form changes
    setError('');
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError('Please fill in all date and time fields');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }

    setCheckingAvailability(true);
    try {
      const startDateTimeISO = new Date(`${formData.date}T${formData.startTime}:00Z`).toISOString();
const endDateTimeISO = new Date(`${formData.date}T${formData.endTime}:00Z`).toISOString();

      const available = await api.checkAvailability(
        room.id,
        formData.date,
        startDateTimeISO,
        endDateTimeISO
      );
      setIsAvailable(available);
      if (!available) {
        setError('This time slot is already booked');
      } else {
        setError('');
      }
    } catch (err) {
      setError('Failed to check availability');
      console.error(err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a title for your booking');
      return;
    }

    if (isAvailable === null) {
      await checkAvailability();
      return;
    }

    if (isAvailable === false) {
      setError('This time slot is not available');
      return;
    }

    setLoading(true);
    try {
      const bookingData: BookingRequest = {
        room_id: room.id,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime
      };

      await api.createBooking(bookingData);
      
      toast({
        title: "Booking confirmed",
        description: `${room.name} has been booked for ${formData.date} from ${formData.startTime} to ${formData.endTime}`,
      });
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: ''
      });
      setIsAvailable(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
          <DialogDescription>
            Create a new booking for this room
          </DialogDescription>
        </DialogHeader>

        {/* Room Info */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{room.building} - {room.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>Capacity: {room.capacity}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Booking Title *</Label>
            <Input
              id="title"
              placeholder="e.g. CS101 Lecture"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Availability Check */}
          {formData.date && formData.startTime && formData.endTime && (
            <div className="space-y-2">
              {isAvailable === null ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkAvailability}
                  disabled={checkingAvailability}
                  className="w-full"
                >
                  {checkingAvailability && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Clock className="mr-2 h-4 w-4" />
                  Check Availability
                </Button>
              ) : isAvailable ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-success">
                    Time slot is available! You can proceed with booking.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This time slot is already booked. Please choose different times.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || isAvailable === false || isAvailable === null}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Calendar className="mr-2 h-4 w-4" />
              Confirm Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};