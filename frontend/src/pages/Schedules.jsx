import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, CalendarClock } from 'lucide-react';
import API from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State untuk form Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    class_name: '',
    class_time: '',
    instructor_name: '',
    quota: ''
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const response = await API.get('/schedules');
        setSchedules(response.data.data || response.data);
      } catch (error) {
        console.error('Gagal mengambil data schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [refreshTrigger]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ class_name: '', class_time: '', instructor_name: '', quota: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (schedule) => {
    setIsEditMode(true);
    setEditId(schedule.id);
    
    // Format waktu ISO ke format yang diterima input type="datetime-local" (YYYY-MM-DDThh:mm)
    // Penyesuaian zona waktu sederhana agar tidak bergeser saat diedit
    const dateObj = new Date(schedule.class_time);
    const tzOffset = dateObj.getTimezoneOffset() * 60000; 
    const localISOTime = new Date(dateObj - tzOffset).toISOString().slice(0, 16);

    setFormData({
      class_name: schedule.class_name,
      class_time: localISOTime,
      instructor_name: schedule.instructor_name,
      quota: schedule.quota
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Konversi nilai kuota ke tipe angka (integer) sebelum dikirim
    const payload = {
      ...formData,
      quota: parseInt(formData.quota, 10)
    };

    try {
      if (isEditMode) {
        await API.put(`/schedules/${editId}`, payload);
      } else {
        await API.post('/schedules', payload);
      }
      setIsDialogOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      alert('Gagal menyimpan jadwal. Periksa konsol untuk detail error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, className) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kelas "${className}"?`)) {
      try {
        await API.delete(`/schedules/${id}`);
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error('Gagal menghapus data:', error);
        alert('Gagal menghapus jadwal.');
      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Jadwal Kelas</h2>
          <p className="text-gray-500 mt-1">Kelola jadwal latihan dan kelas gym Anda.</p>
        </div>
        
        <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus size={16} />
          Tambah Jadwal
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="class_name">Nama Kelas</Label>
                <Input 
                  id="class_name" name="class_name" value={formData.class_name} 
                  onChange={handleInputChange} placeholder="Contoh: Yoga Pagi" required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_time">Waktu Kelas</Label>
                <Input 
                  type="datetime-local" id="class_time" name="class_time" 
                  value={formData.class_time} onChange={handleInputChange} required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor_name">Nama Instruktur</Label>
                <Input 
                  id="instructor_name" name="instructor_name" value={formData.instructor_name} 
                  onChange={handleInputChange} placeholder="Contoh: Coach Maya" required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota">Kuota Peserta</Label>
                <Input 
                  type="number" min="1" id="quota" name="quota" value={formData.quota} 
                  onChange={handleInputChange} placeholder="Contoh: 15" required 
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Memuat data...</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kelas</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Instruktur</TableHead>
                    <TableHead>Kuota</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">Belum ada data jadwal kelas.</TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.class_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarClock size={16} className="text-gray-400"/>
                            {formatDateTime(schedule.class_time)}
                          </div>
                        </TableCell>
                        <TableCell>{schedule.instructor_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50">
                            {schedule.quota} Peserta
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" size="icon" 
                              className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleEditClick(schedule)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="outline" size="icon" 
                              className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(schedule.id, schedule.class_name)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}