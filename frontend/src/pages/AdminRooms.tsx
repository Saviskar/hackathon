import { useState, useEffect } from 'react';
import { Room } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Edit2, Trash2, Plus, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    venue: '',
    capacity: '',
    type: '',
    equipment: '',
    location: '',
    floor: '',
    building: ''
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      venue: '',
      capacity: '',
      type: '',
      equipment: '',
      location: '',
      floor: '',
      building: ''
    });
    setEditingRoom(null);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      venue: room.venue,
      capacity: room.capacity.toString(),
      type: room.type,
      equipment: room.equipment.join(', '),
      location: room.location,
      floor: room.floor.toString(),
      building: room.building
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const roomData = {
        name: formData.name,
        venue: formData.venue,
        capacity: parseInt(formData.capacity),
        type: formData.type as Room['type'],
        equipment: formData.equipment.split(',').map(item => item.trim()).filter(Boolean),
        location: formData.location,
        floor: parseInt(formData.floor),
        building: formData.building
      };

      if (editingRoom) {
        await api.updateRoom(editingRoom.id, roomData);
        toast({
          title: "Room updated",
          description: "Room has been successfully updated",
        });
      } else {
        await api.createRoom(roomData);
        toast({
          title: "Room created",
          description: "New room has been added successfully",
        });
      }

      loadRooms();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save room",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await api.deleteRoom(roomId);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      toast({
        title: "Room deleted",
        description: "Room has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive"
      });
    }
  };

  const roomTypeColors = {
    lecture: 'bg-blue-100 text-blue-800',
    seminar: 'bg-green-100 text-green-800',
    lab: 'bg-purple-100 text-purple-800',
    meeting: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage all rooms and their details</p>
        </div>

        <Dialog open={showAddModal} onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogDescription>
                {editingRoom ? 'Update room information' : 'Enter the details for the new room'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture_hall">Lecture Hall</SelectItem>
                      <SelectItem value="seminar_room">Seminar Room</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="meeting">Meeting Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                <Input
                  id="equipment"
                  placeholder="e.g. Projector, Whiteboard, Microphone"
                  value={formData.equipment}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building *</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor *</Label>
                  <Input
                    id="level"
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rooms ({rooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>
                      <Badge className={roomTypeColors[room.type] || 'bg-gray-100 text-gray-800'}>
                        {room.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {room.building} - {room.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
  <div className="flex flex-wrap gap-1">
    {(room.equipment?.slice(0, 2) || []).map((item, idx) => (
      <Badge key={idx} variant="secondary" className="text-xs">
        {item}
      </Badge>
    ))}
    {Array.isArray(room.equipment) && room.equipment.length > 2 && (
      <Badge variant="secondary" className="text-xs">
        +{room.equipment.length - 2}
      </Badge>
    )}
  </div>
</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(room)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(room.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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