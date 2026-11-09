import { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  X
} from 'lucide-react';
import API from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter tab waktu: All / Upcoming / Past
  const [timeFilter, setTimeFilter] = useState('All');

  // State pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State untuk form Dialog (Tambah & Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // State untuk Modal Konfirmasi Hapus
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk Modal Roster Peserta & Booking
  const [rosterDialogOpen, setRosterDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [cancellingReminderId, setCancellingReminderId] = useState(null);
  const [rosterError, setRosterError] = useState('');
  const [rosterSuccess, setRosterSuccess] = useState('');

  const [formData, setFormData] = useState({
    class_name: '',
    class_time: '',
    instructor_name: '',
    quota: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [schedRes, remRes, custRes] = await Promise.all([
          API.get('/schedules'),
          API.get('/reminders'),
          API.get('/customers')
        ]);
        setSchedules(schedRes.data.data || schedRes.data || []);
        setReminders(remRes.data.data || remRes.data || []);
        setCustomers(custRes.data.data || custRes.data || []);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  // Pengelompokan & filter jadwal berdasarkan tab
  const filteredSchedules = useMemo(() => {
    const now = new Date();

    if (timeFilter === 'Upcoming') {
      return schedules
        .filter(s => new Date(s.class_time) >= now)
        .sort((a, b) => new Date(a.class_time) - new Date(b.class_time));
    }

    if (timeFilter === 'Past') {
      return schedules
        .filter(s => new Date(s.class_time) < now)
        .sort((a, b) => new Date(b.class_time) - new Date(a.class_time));
    }

    // Tab 'Semua': prioritaskan kelas Mendatang di depan (paling dekat lebih dahulu),
    // lalu kelas yang sudah Selesai diletakkan di halaman belakang.
    const upcoming = schedules
      .filter(s => new Date(s.class_time) >= now)
      .sort((a, b) => new Date(a.class_time) - new Date(b.class_time));

    const past = schedules
      .filter(s => new Date(s.class_time) < now)
      .sort((a, b) => new Date(b.class_time) - new Date(a.class_time));

    return [...upcoming, ...past];
  }, [schedules, timeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSchedules = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredSchedules.slice(startIndex, startIndex + pageSize);
  }, [filteredSchedules, safeCurrentPage, pageSize]);

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
    const dateObj = new Date(schedule.class_time);
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateObj - tzOffset).toISOString().slice(0, 16);

    setFormData({
      class_name: schedule.class_name,
      class_time: localISOTime,
      instructor_name: schedule.instructor_name,
      quota: schedule.quota.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      alert('Gagal menyimpan jadwal. Pastikan semua input terisi dengan valid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    setIsDeleting(true);
    try {
      await API.delete(`/schedules/${scheduleToDelete.id}`);
      setRefreshTrigger(prev => prev + 1);
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error('Gagal menghapus data jadwal:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatTimeOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date) + ' WIB';
  };

  const handleOpenRoster = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedCustomerId('');
    setRosterError('');
    setRosterSuccess('');
    setRosterDialogOpen(true);
  };

  const handleBookMember = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedSchedule) return;
    setIsBooking(true);
    setRosterError('');
    setRosterSuccess('');
    try {
      await API.post('/reminders', {
        customer_id: Number(selectedCustomerId),
        schedule_id: selectedSchedule.id
      });
      const remRes = await API.get('/reminders');
      setReminders(remRes.data.data || remRes.data || []);
      setSelectedCustomerId('');
      setRosterSuccess('Member berhasil didaftarkan ke kelas!');
      setTimeout(() => setRosterSuccess(''), 3000);
    } catch (err) {
      setRosterError(err.response?.data?.message || 'Gagal mendaftarkan member.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (reminderId) => {
    setCancellingReminderId(reminderId);
    setRosterError('');
    setRosterSuccess('');
    try {
      await API.delete(`/reminders/${reminderId}`);
      const remRes = await API.get('/reminders');
      setReminders(remRes.data.data || remRes.data || []);
      setRosterSuccess('Pendaftaran member berhasil dibatalkan.');
      setTimeout(() => setRosterSuccess(''), 3000);
    } catch (err) {
      setRosterError(err.response?.data?.message || 'Gagal membatalkan pendaftaran.');
    } finally {
      setCancellingReminderId(null);
    }
  };

  // Peserta yang terdaftar di jadwal yang dipilih
  const currentScheduleRoster = useMemo(() => {
    if (!selectedSchedule) return [];
    return reminders.filter(r => r.schedule_id === selectedSchedule.id);
  }, [reminders, selectedSchedule]);

  // Daftar member yang belum terdaftar di jadwal yang dipilih
  const availableCustomers = useMemo(() => {
    if (!selectedSchedule) return [];
    const enrolledIds = new Set(currentScheduleRoster.map(r => r.customer_id));
    return customers.filter(c => !enrolledIds.has(c.id));
  }, [customers, currentScheduleRoster, selectedSchedule]);

  const now = new Date();
  const totalClasses = schedules.length;
  const upcomingCount = schedules.filter(s => new Date(s.class_time) >= now).length;
  const pastCount = schedules.filter(s => new Date(s.class_time) < now).length;

  return (
    <div className="space-y-6">
      {/* Header Halaman & Aksi Cepat */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jadwal Kelas</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola jadwal sesi latihan gym, alokasi instruktur, dan ketersediaan kuota kelas.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition"
        >
          <Plus size={15} />
          <span>Tambah Jadwal</span>
        </button>

        {/* Modal Form Tambah / Edit Jadwal Bergaya Shadcn */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[440px] p-6 rounded-xl border border-gray-200/90 shadow-lg bg-white">
            <DialogHeader className="gap-1 pb-3 border-b border-gray-100">
              <DialogTitle className="text-base font-bold text-gray-900">
                {isEditMode ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {isEditMode
                  ? 'Perbarui waktu latihan, nama instruktur, atau batas kuota kelas.'
                  : 'Atur sesi kelas baru untuk membuka slot pendaftaran member.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="class_name" className="text-xs font-semibold text-gray-700">
                  Nama Kelas
                </Label>
                <Input
                  id="class_name"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Yoga Pagi, Zumba Fitness"
                  required
                  className="h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class_time" className="text-xs font-semibold text-gray-700">
                  Waktu & Tanggal Kelas
                </Label>
                <Input
                  type="datetime-local"
                  id="class_time"
                  name="class_time"
                  value={formData.class_time}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructor_name" className="text-xs font-semibold text-gray-700">
                  Nama Instruktur / Coach
                </Label>
                <Input
                  id="instructor_name"
                  name="instructor_name"
                  value={formData.instructor_name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Coach Maya"
                  required
                  className="h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quota" className="text-xs font-semibold text-gray-700">
                  Kuota Peserta
                </Label>
                <Input
                  type="number"
                  min="1"
                  id="quota"
                  name="quota"
                  value={formData.quota}
                  onChange={handleInputChange}
                  placeholder="Contoh: 15"
                  required
                  className="h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg"
                />
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
                  className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Konfirmasi Hapus Jadwal Bergaya Shadcn */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px] p-6 rounded-xl border border-gray-200/90 shadow-lg bg-white">
            <DialogHeader className="gap-1 pb-1">
              <DialogTitle className="text-base font-bold text-gray-900">
                Hapus Jadwal Kelas
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus kelas{' '}
                <span className="font-semibold text-gray-900">{scheduleToDelete?.class_name}</span>? Jadwal ini tidak akan lagi tersedia untuk booking member.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2 bg-transparent">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(false)}
                className="h-8 px-3.5 text-xs font-medium border-gray-200 rounded-lg hover:bg-gray-100"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-2xs"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Lihat Peserta & Booking Kelas */}
        <Dialog open={rosterDialogOpen} onOpenChange={setRosterDialogOpen}>
          <DialogContent className="sm:max-w-[560px] p-6 rounded-xl border border-gray-200/90 shadow-lg bg-white">
            <DialogHeader className="gap-1 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="text-blue-600" size={18} />
                  <span>Peserta & Booking Kelas</span>
                </DialogTitle>
                {selectedSchedule && (
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      currentScheduleRoster.length >= selectedSchedule.quota
                        ? 'border-amber-300 text-amber-700 bg-amber-50'
                        : 'border-blue-200 text-blue-700 bg-blue-50'
                    }`}
                  >
                    Terisi {currentScheduleRoster.length} / {selectedSchedule.quota}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-gray-500 mt-1">
                {selectedSchedule && (
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-gray-800">{selectedSchedule.class_name}</span>
                    <span>•</span>
                    <span>{formatDateTime(selectedSchedule.class_time)} ({formatTimeOnly(selectedSchedule.class_time)})</span>
                    <span>•</span>
                    <span>Coach: {selectedSchedule.instructor_name}</span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Notifikasi Error / Sukses */}
            {rosterError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <span>{rosterError}</span>
                <button onClick={() => setRosterError('')} className="text-red-500 hover:text-red-700">
                  <X size={14} />
                </button>
              </div>
            )}
            {rosterSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {rosterSuccess}
              </div>
            )}

            {/* Form Daftarkan Member Baru ke Kelas Ini */}
            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-2.5">
              <span className="text-xs font-semibold text-gray-800 block">
                Daftarkan Member ke Kelas Ini
              </span>
              {selectedSchedule && currentScheduleRoster.length >= selectedSchedule.quota ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg p-2">
                  Kuota kelas sudah penuh ({selectedSchedule.quota} peserta). Tidak dapat menambahkan peserta lagi kecuali ada yang dibatalkan.
                </p>
              ) : availableCustomers.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Semua member terdaftar telah masuk ke kelas ini.
                </p>
              ) : (
                <form onSubmit={handleBookMember} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg w-full">
                        <SelectValue placeholder="Pilih member gym..." />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-56">
                        {availableCustomers.map((cust) => (
                          <SelectItem key={cust.id} value={cust.id.toString()}>
                            {cust.name} ({cust.whatsapp_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!selectedCustomerId || isBooking}
                    className="h-9 px-3.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-2xs flex items-center gap-1.5 shrink-0"
                  >
                    <UserPlus size={14} />
                    <span>{isBooking ? 'Mendaftarkan...' : 'Daftarkan'}</span>
                  </Button>
                </form>
              )}
            </div>

            {/* Tabel / Daftar Peserta yang Sudah Terdaftar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Daftar Peserta Terdaftar ({currentScheduleRoster.length})</span>
                <span className="text-gray-400 text-[11px]">Sisa slot: {Math.max(0, (selectedSchedule?.quota || 0) - currentScheduleRoster.length)}</span>
              </div>

              <div className="border border-gray-200/80 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {currentScheduleRoster.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Belum ada member yang terdaftar di kelas ini.
                  </div>
                ) : (
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 bg-gray-50/70 text-[11px]">
                        <TableHead className="w-[45%] py-2 pl-4 font-semibold text-gray-500">Nama Member</TableHead>
                        <TableHead className="w-[30%] py-2 font-semibold text-gray-500">Status</TableHead>
                        <TableHead className="w-[25%] py-2 text-right pr-4 font-semibold text-gray-500">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentScheduleRoster.map((item) => (
                        <TableRow key={item.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                          <TableCell className="py-2.5 pl-4">
                            <div className="font-medium text-gray-900 truncate">{item.customer_name}</div>
                            <div className="text-[11px] text-gray-400 truncate">{item.whatsapp_number}</div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                item.status === 'Responded'
                                  ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                                  : item.status === 'Sent'
                                  ? 'text-blue-700 border-blue-200 bg-blue-50'
                                  : item.status === 'No Response'
                                  ? 'text-red-700 border-red-200 bg-red-50'
                                  : 'text-amber-700 border-amber-200 bg-amber-50'
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-right pr-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={cancellingReminderId === item.id}
                              onClick={() => handleCancelBooking(item.id)}
                              className="h-7 px-2 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 hover:border-red-200"
                              title="Batalkan keikutsertaan member"
                            >
                              {cancellingReminderId === item.id ? '...' : 'Batalkan'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            <DialogFooter className="mt-2 pt-3 border-t border-gray-100 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRosterDialogOpen(false)}
                className="h-8 px-4 text-xs font-medium border-gray-200 rounded-lg hover:bg-gray-100"
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 3 Kartu Ringkasan Jadwal Kelas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Total Seluruh Kelas</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-gray-900">
              {loading ? <Skeleton className="h-9 w-16" /> : totalClasses}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Seluruh sesi latihan terjadwal
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Kelas Aktif / Mendatang</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">
              {loading ? <Skeleton className="h-9 w-16" /> : upcomingCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Siap untuk booking peserta
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Kelas Telah Selesai</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-gray-600">
              {loading ? <Skeleton className="h-9 w-16" /> : pastCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Sesi latihan waktu lampau
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data Jadwal Kelas Bergaya Shadcn */}
      <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Daftar Sesi Latihan
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Daftar kelas latihan gym lengkap dengan informasi jadwal, instruktur, dan kuota.
            </CardDescription>
          </div>

          {/* Filter Tab Waktu Kelas */}
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => { setTimeFilter('All'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition ${
                timeFilter === 'All'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Semua ({totalClasses})
            </button>
            <button
              onClick={() => { setTimeFilter('Upcoming'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition ${
                timeFilter === 'Upcoming'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mendatang ({upcomingCount})
            </button>
            <button
              onClick={() => { setTimeFilter('Past'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition ${
                timeFilter === 'Past'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Selesai ({pastCount})
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
              <Table className="table-fixed w-full min-w-[700px]">
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/50">
                    <TableHead className="w-[24%] text-xs font-semibold text-gray-500 pl-6">Nama Kelas</TableHead>
                    <TableHead className="w-[20%] text-xs font-semibold text-gray-500">Tanggal &amp; Waktu</TableHead>
                    <TableHead className="w-[17%] text-xs font-semibold text-gray-500">Instruktur</TableHead>
                    <TableHead className="w-[15%] text-xs font-semibold text-gray-500">Kuota</TableHead>
                    <TableHead className="w-[10%] text-xs font-semibold text-gray-500">Status</TableHead>
                    <TableHead className="w-[14%] text-xs font-semibold text-gray-500 text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-xs text-gray-400">
                        Tidak ada data jadwal kelas pada kategori ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSchedules.map((schedule) => {
                      const isUpcoming = new Date(schedule.class_time) >= now;
                      const bookedCount = reminders.filter(r => r.schedule_id === schedule.id).length;
                      const isFull = bookedCount >= schedule.quota;
                      return (
                        <TableRow key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition">
                          <TableCell className="pl-6 font-medium text-xs text-gray-900 truncate">
                            {schedule.class_name}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium text-gray-900 truncate">
                              {formatDateTime(schedule.class_time)}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                              {formatTimeOnly(schedule.class_time)}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-700 truncate">
                            {schedule.instructor_name}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-gray-900">{bookedCount}/{schedule.quota}</span>
                              <span className="text-gray-500 text-[11px]">Peserta</span>
                              {isFull && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 text-amber-700 bg-amber-50">
                                  Penuh
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                isUpcoming
                                  ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                                  : 'text-gray-500 border-gray-200 bg-gray-50'
                              }`}
                            >
                              {isUpcoming ? 'Mendatang' : 'Selesai'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenRoster(schedule)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                                title="Lihat Peserta & Booking Kelas"
                              >
                                <Users size={14} />
                              </button>
                              <button
                                onClick={() => handleEditClick(schedule)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                                title="Edit jadwal kelas"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(schedule)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                                title="Hapus jadwal kelas"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Footer Tabel Resmi CardFooter Shadcn dengan Navigasi Pagination */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-6 py-3 text-xs text-gray-500 rounded-b-xl">
          <span>
            Menampilkan {filteredSchedules.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0}-
            {Math.min(safeCurrentPage * pageSize, filteredSchedules.length)} dari {filteredSchedules.length} jadwal
          </span>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Baris:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-[68px] text-xs bg-white border border-gray-200 shadow-2xs rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-[11px] font-medium text-gray-600">
              Hal {safeCurrentPage} dari {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="h-7 w-7 rounded-md border-gray-200 bg-white hover:bg-gray-100 shadow-2xs disabled:opacity-40"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                title="Halaman sebelumnya"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="h-7 w-7 rounded-md border-gray-200 bg-white hover:bg-gray-100 shadow-2xs disabled:opacity-40"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                title="Halaman selanjutnya"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
