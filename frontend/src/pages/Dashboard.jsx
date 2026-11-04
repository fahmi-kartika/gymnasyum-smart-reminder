import { useEffect, useState, useMemo } from 'react';
import {
  MessageCircle,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import API from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tab filter status pada tabel
  const [statusFilter, setStatusFilter] = useState('All');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    schedule_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

  // Antrean reminder hari ini dengan penyortiran berjenjang (jam kelas lalu prioritas)
  const todaysReminders = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');

    const filtered = reminders.filter(r => {
      const schedule = schedules.find(s => s.id === r.schedule_id);
      const classTime = r.class_time || schedule?.class_time;
      if (!classTime) return false;
      return new Date(classTime).toLocaleDateString('en-CA') === todayStr;
    });

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    return filtered.sort((a, b) => {
      const scheduleA = schedules.find(s => s.id === a.schedule_id);
      const scheduleB = schedules.find(s => s.id === b.schedule_id);
      const timeA = new Date(a.class_time || scheduleA?.class_time || 0).getTime();
      const timeB = new Date(b.class_time || scheduleB?.class_time || 0).getTime();

      if (timeA !== timeB) {
        return timeA - timeB;
      }

      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      return weightB - weightA;
    });
  }, [reminders, schedules]);

  // Filter tabel berdasarkan tab status yang dipilih
  const displayedReminders = useMemo(() => {
    if (statusFilter === 'All') return todaysReminders;
    return todaysReminders.filter(r => r.status === statusFilter);
  }, [todaysReminders, statusFilter]);

  // Pilihan jadwal kelas aktif untuk modal booking
  const availableSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return schedules.filter(s => {
      if (!s.class_time) return false;
      return new Date(s.class_time) >= today;
    });
  }, [schedules]);

  const handleWhatsApp = async (reminder) => {
    if (!reminder.whatsapp_number) return;

    const formattedPhone = reminder.whatsapp_number.startsWith('0')
      ? '62' + reminder.whatsapp_number.substring(1)
      : reminder.whatsapp_number;
    const message = `Halo ${reminder.customer_name}, ini dari Gymnasyum! Mengingatkan untuk jadwal kelas ${reminder.class_name} Anda hari ini. Apakah Anda akan hadir?`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');

    if (reminder.status === 'Scheduled') {
      try {
        await API.patch(`/reminders/${reminder.id}/status`, { status: 'Sent' });
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Gagal mengupdate status:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/reminders/${id}/status`, { status: newStatus });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert('Gagal mengubah status');
    }
  };

  const handleAddClick = () => {
    setFormData({ customer_id: '', schedule_id: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      customer_id: parseInt(formData.customer_id, 10),
      schedule_id: parseInt(formData.schedule_id, 10)
    };

    try {
      await API.post('/reminders', payload);
      setIsDialogOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Gagal menyimpan reminder:', error);
      alert('Gagal menambah reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, customerName) => {
    if (window.confirm(`Hapus reminder untuk ${customerName}?`)) {
      try {
        await API.delete(`/reminders/${id}`);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus reminder.');
      }
    }
  };

  const totalCount = todaysReminders.length;
  const scheduledCount = todaysReminders.filter(r => r.status === 'Scheduled').length;
  const sentCount = todaysReminders.filter(r => r.status === 'Sent').length;
  const respondedCount = todaysReminders.filter(r => r.status === 'Responded').length;

  return (
    <div className="space-y-6">
      {/* Header Halaman & Aksi Cepat */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Follow-up</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola antrean reminder jadwal kelas harian dan pantau kehadiran pelanggan.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 text-xs font-semibold shadow-xs transition"
        >
          <Plus size={15} />
          <span>Booking Kelas</span>
        </button>

        {/* Modal Booking Kelas Bergaya Shadcn */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[440px] p-6 rounded-xl border border-gray-200/90 shadow-lg bg-white">
            <DialogHeader className="gap-1 pb-3 border-b border-gray-100">
              <DialogTitle className="text-base font-bold text-gray-900">
                Booking Kelas untuk Member
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Daftarkan member ke sesi latihan untuk menjadwalkan reminder follow-up.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="customer" className="text-xs font-semibold text-gray-700">
                  Pilih Member
                </Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, customer_id: val }))}
                  required
                >
                  <SelectTrigger className="w-full h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg">
                    <SelectValue placeholder="Pilih member yang terdaftar..." />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-56">
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        <span className="text-xs">
                          {c.name} {c.whatsapp_number ? `(${c.whatsapp_number})` : ''}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schedule" className="text-xs font-semibold text-gray-700">
                  Pilih Jadwal Kelas
                </Label>
                <Select
                  value={formData.schedule_id}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, schedule_id: val }))}
                  required
                >
                  <SelectTrigger className="w-full h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg">
                    <SelectValue placeholder="Pilih jadwal kelas aktif..." />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-56">
                    {availableSchedules.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 text-center">
                        Tidak ada kelas aktif mulai hari ini ke depan.
                      </div>
                    ) : (
                      availableSchedules.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          <span className="text-xs">
                            <span className="font-semibold text-gray-900">{s.class_name}</span>
                            {' - '}
                            <span className="text-gray-600">
                              {new Date(s.class_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ({new Date(s.class_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)
                            </span>
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-6 pt-3 border-t border-gray-100 flex justify-end gap-2 bg-transparent">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(false)}
                  className="h-8 px-3.5 text-xs font-medium border-gray-200 rounded-lg hover:bg-gray-100"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-black text-white hover:bg-gray-800 shadow-2xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 4 Kartu Statistik Bergaya Shadcn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Total Reminder Hari Ini</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-gray-900">
              {loading ? <Skeleton className="h-9 w-16" /> : totalCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Seluruh partisipan kelas terdaftar
            </p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Belum Difollow-up</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-amber-600">
              {loading ? <Skeleton className="h-9 w-16" /> : scheduledCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Menunggu pesan reminder dikirim
            </p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Pesan Terkirim</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-blue-600">
              {loading ? <Skeleton className="h-9 w-16" /> : sentCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Menunggu konfirmasi kehadiran
            </p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Tingkat Konfirmasi</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">
              {loading ? <Skeleton className="h-9 w-16" /> : respondedCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Member terkonfirmasi hadir kelas
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Tabel Antrean dengan Filter Tab Bergaya Shadcn */}
      <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Antrean Follow-up Hari Ini
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Daftar member yang memiliki jadwal latihan hari ini, disortir berdasarkan jam dan urgensi.
            </CardDescription>
          </div>

          {/* Tab Filter Status */}
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'All'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('Scheduled')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'Scheduled'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Scheduled ({scheduledCount})
            </button>
            <button
              onClick={() => setStatusFilter('Sent')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'Sent'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sent ({sentCount})
            </button>
            <button
              onClick={() => setStatusFilter('Responded')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'Responded'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Responded ({respondedCount})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/50">
                    <TableHead className="text-xs font-semibold text-gray-500 pl-6">Member</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Kelas &amp; Jam</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Prioritas</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Status Interaksi</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedReminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-xs text-gray-400">
                        Tidak ada antrean reminder untuk filter status ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedReminders.map((reminder) => (
                      <TableRow key={reminder.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition">
                        {/* Member */}
                        <TableCell className="pl-6 font-medium text-xs text-gray-900">
                          <div>{reminder.customer_name}</div>
                          <div className="text-[11px] text-gray-400 font-normal">
                            {reminder.whatsapp_number}
                          </div>
                        </TableCell>

                        {/* Kelas & Jam */}
                        <TableCell className="text-xs">
                          <div className="font-medium text-gray-900">{reminder.class_name}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-gray-400" />
                            <span>
                              {reminder.class_time
                                ? new Date(reminder.class_time).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '-'}{' '}
                              WIB
                            </span>
                          </div>
                        </TableCell>

                        {/* Prioritas */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              reminder.priority?.toLowerCase() === 'high'
                                ? 'text-red-700 border-red-200 bg-red-50'
                                : reminder.priority?.toLowerCase() === 'medium'
                                ? 'text-amber-700 border-amber-200 bg-amber-50'
                                : 'text-emerald-700 border-emerald-200 bg-emerald-50'
                            }`}
                          >
                            {reminder.priority?.toUpperCase()}
                          </Badge>
                        </TableCell>

                        {/* Status Interaksi dengan Dot Indicator */}
                        <TableCell>
                          <Select
                            value={reminder.status || 'Scheduled'}
                            onValueChange={(value) => handleStatusChange(reminder.id, value)}
                          >
                            <SelectTrigger className="w-[145px] h-8 text-xs font-medium bg-white border border-gray-200 shadow-2xs rounded-lg">
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="Scheduled">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  <span>Scheduled</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Sent">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                                  <span>Sent</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Responded">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span>Responded</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="No Response">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="w-2 h-2 rounded-full bg-red-500" />
                                  <span>No Response</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Aksi */}
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleWhatsApp(reminder)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-2xs"
                              title="Kirim pesan WhatsApp"
                            >
                              <MessageCircle size={14} />
                              <span>Follow Up</span>
                            </button>

                            <button
                              onClick={() => handleDelete(reminder.id, reminder.customer_name)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                              title="Hapus reminder"
                            >
                              <Trash2 size={14} />
                            </button>
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

        {/* Footer Tabel Resmi CardFooter Shadcn */}
        <CardFooter className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-6 py-3 text-xs text-gray-500 rounded-b-xl">
          <span>
            Menampilkan {displayedReminders.length} dari {totalCount} antrean hari ini
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
