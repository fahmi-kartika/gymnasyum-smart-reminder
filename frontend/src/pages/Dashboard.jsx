import { useEffect, useState } from 'react';
import { MessageCircle, Activity, Clock, Send, CheckCircle, Plus, Trash2 } from 'lucide-react';
import API from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State untuk form Tambah Reminder
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    schedule_id: '',
    priority: 'Medium'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mengambil semua data secara paralel agar lebih cepat
        const [remindersRes, customersRes, schedulesRes] = await Promise.all([
          API.get('/reminders'),
          API.get('/customers'),
          API.get('/schedules')
        ]);
        
        setReminders(remindersRes.data.data || remindersRes.data);
        setCustomers(customersRes.data.data || customersRes.data);
        setSchedules(schedulesRes.data.data || schedulesRes.data);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const handleWhatsApp = (phone, customerName, className) => {
    if (!phone) return;
    let formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const message = `Halo ${customerName}, ini dari Gymnasyum! Mengingatkan untuk jadwal kelas ${className} Anda. Apakah Anda akan hadir?`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/reminders/${id}/status`, { status: newStatus });
      setRefreshTrigger(prev => prev + 1); 
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Gagal mengubah status: ${errorMessage}`);
    }
  };

  const handleDelete = async (id, customerName) => {
  if (window.confirm(`Apakah Anda yakin ingin menghapus reminder untuk ${customerName}?`)) {
    try {
      await API.delete(`/reminders/${id}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Gagal menghapus reminder:', error);
      alert('Gagal menghapus reminder. Pastikan backend mendukung endpoint DELETE ini.');
    }
  }
};

  // Logika form Tambah Reminder
  const handleAddClick = () => {
    setFormData({ customer_id: '', schedule_id: '', priority: 'Medium' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Konversi string ID dari Select menjadi Integer sesuai permintaan backend
    const payload = {
      customer_id: parseInt(formData.customer_id, 10),
      schedule_id: parseInt(formData.schedule_id, 10),
      priority: formData.priority
    };

    try {
      await API.post('/reminders', payload);
      setIsDialogOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Gagal menyimpan reminder:', error);
      alert('Gagal menambah reminder. Periksa konsol untuk detail error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReminders = reminders.length;
  const scheduledCount = reminders.filter(r => r.status === 'Scheduled').length;
  const sentCount = reminders.filter(r => r.status === 'Sent').length;
  const respondedCount = reminders.filter(r => r.status === 'Responded').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Pantau status follow-up member gym Anda.</p>
        </div>
        
        {/* Tombol Tambah Reminder */}
        <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus size={16} />
          Buat Reminder
        </Button>

        {/* Dialog Form Tambah Reminder */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Buat Reminder Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Member</Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, customer_id: val }))}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Pilih Member" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule">Jadwal Kelas</Label>
                <Select 
                  value={formData.schedule_id} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, schedule_id: val }))}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                  <SelectContent>
                    {schedules.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.class_name} - {new Date(s.class_time).toLocaleDateString('id-ID')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioritas</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ... Kartu statistik tetap sama ... */}
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium text-gray-600">Total Reminder</CardTitle><Activity className="w-4 h-4 text-gray-400" /></CardHeader><CardContent><div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : totalReminders}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium text-orange-600">Belum Difollow-up</CardTitle><Clock className="w-4 h-4 text-orange-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{loading ? <Skeleton className="h-8 w-16" /> : scheduledCount}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium text-blue-600">Pesan Terkirim</CardTitle><Send className="w-4 h-4 text-blue-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{loading ? <Skeleton className="h-8 w-16" /> : sentCount}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium text-green-600">Sudah Merespons</CardTitle><CheckCircle className="w-4 h-4 text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{loading ? <Skeleton className="h-8 w-16" /> : respondedCount}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Reminder Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {/* Animasi Skeleton untuk Tabel */}
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">Belum ada data reminder.</TableCell>
                    </TableRow>
                  ) : (
                    reminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">{reminder.customer_name}</TableCell>
                        <TableCell>{reminder.class_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            reminder.priority?.toLowerCase() === 'high' ? 'text-red-600 border-red-200 bg-red-50' : 
                            reminder.priority?.toLowerCase() === 'medium' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 
                            'text-green-600 border-green-200 bg-green-50'
                          }>
                            {reminder.priority?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={reminder.status || 'Scheduled'} 
                            onValueChange={(value) => handleStatusChange(reminder.id, value)}
                          >
                            <SelectTrigger className={`w-[130px] h-8 text-xs font-medium text-white border-0 ${
                              reminder.status === 'Scheduled' ? 'bg-orange-500 hover:bg-orange-600' : 
                              reminder.status === 'Sent' ? 'bg-blue-500 hover:bg-blue-600' : 
                              reminder.status === 'Responded' ? 'bg-green-500 hover:bg-green-600' : 
                              reminder.status === 'No Response' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500' 
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="Sent">Sent</SelectItem>
                              <SelectItem value="Responded">Responded</SelectItem>
                              <SelectItem value="No Response">No Response</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            onClick={() => handleWhatsApp(reminder.whatsapp_number, reminder.customer_name, reminder.class_name)}
                          >
                            <MessageCircle size={16} />
                            Follow Up
                          </Button>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 px-0 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(reminder.id, reminder.customer_name)}
                            title="Hapus Reminder"
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