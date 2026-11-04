import { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import API from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter tab tipe member: All / Regular / VIP
  const [typeFilter, setTypeFilter] = useState('All');

  // State pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State untuk form Dialog (Tambah & Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // State untuk Modal Riwayat Pelanggan
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // State untuk Modal Konfirmasi Hapus
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    member_type: 'Regular',
    preferences: ''
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await API.get('/customers');
        setCustomers(response.data.data || response.data);
      } catch (error) {
        console.error('Gagal mengambil data customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [refreshTrigger]);

  // Filter customer berdasarkan tab
  const filteredCustomers = useMemo(() => {
    if (typeFilter === 'All') return customers;
    return customers.filter(c => (c.member_type || 'Regular').toUpperCase() === typeFilter.toUpperCase());
  }, [customers, typeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, safeCurrentPage, pageSize]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Nomor WhatsApp hanya boleh menerima karakter angka
    if (name === 'whatsapp_number') {
      const numericOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, member_type: value }));
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ name: '', whatsapp_number: '', member_type: 'Regular', preferences: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (customer) => {
    setIsEditMode(true);
    setEditId(customer.id);
    setFormData({
      name: customer.name,
      whatsapp_number: customer.whatsapp_number,
      member_type: customer.member_type || 'Regular',
      preferences: customer.preferences || ''
    });
    setIsDialogOpen(true);
  };

  const handleViewHistory = async (customer) => {
    setActiveCustomer(customer);
    setHistoryDialogOpen(true);
    setHistoryLoading(true);
    try {
      const res = await API.get(`/reminders?customer_id=${customer.id}`);
      setSelectedHistory(res.data.data || res.data);
    } catch (error) {
      console.error('Gagal mengambil riwayat:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await API.put(`/customers/${editId}`, formData);
      } else {
        await API.post('/customers', formData);
      }
      setIsDialogOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      alert('Gagal menyimpan data. Pastikan semua input sudah terisi dengan benar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await API.delete(`/customers/${customerToDelete.id}`);
      setRefreshTrigger(prev => prev + 1);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Gagal menghapus data member:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalMembers = customers.length;
  const vipCount = customers.filter(c => (c.member_type || '').toUpperCase() === 'VIP').length;
  const regularCount = customers.filter(c => (c.member_type || '').toUpperCase() !== 'VIP').length;

  return (
    <div className="space-y-6">
      {/* Header Halaman & Aksi Cepat */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data Member</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola profil pelanggan, klasifikasi keanggotaan, dan preferensi latihan gym.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition"
        >
          <Plus size={15} />
          <span>Tambah Member</span>
        </button>

        {/* Modal Form Tambah / Edit Member Bergaya Shadcn */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[440px] p-6 rounded-xl border border-gray-200/90 shadow-lg bg-white">
            <DialogHeader className="gap-1 pb-3 border-b border-gray-100">
              <DialogTitle className="text-base font-bold text-gray-900">
                {isEditMode ? 'Edit Data Member' : 'Tambah Member Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {isEditMode
                  ? 'Perbarui detail data dan status keanggotaan member.'
                  : 'Lengkapi data pelanggan baru untuk didaftarkan ke sistem.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp_number" className="text-xs font-semibold text-gray-700">
                  Nomor WhatsApp
                </Label>
                <Input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  type="tel"
                  inputMode="numeric"
                  value={formData.whatsapp_number}
                  onChange={handleInputChange}
                  placeholder="Contoh: 08123456789"
                  required
                  className="h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member_type" className="text-xs font-semibold text-gray-700">
                  Tipe Keanggotaan
                </Label>
                <Select value={formData.member_type} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full h-9 text-xs bg-white border border-gray-200 shadow-2xs rounded-lg">
                    <SelectValue placeholder="Pilih tipe member" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferences" className="text-xs font-semibold text-gray-700">
                  Preferensi Latihan
                </Label>
                <Input
                  id="preferences"
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleInputChange}
                  placeholder="Contoh: Latihan kardio, zumba pagi"
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

        {/* Modal Konfirmasi Hapus Member Bergaya Shadcn */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px] p-6 rounded-xl border border-gray-200/90 shadow-lg bg-white">
            <DialogHeader className="gap-1 pb-1">
              <DialogTitle className="text-base font-bold text-gray-900">
                Hapus Data Member
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus data member{' '}
                <span className="font-semibold text-gray-900">{customerToDelete?.name}</span>? Seluruh data profil pelanggan ini akan dihapus dari sistem.
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

        {/* Modal Riwayat Reminder Member Bergaya Shadcn */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="sm:max-w-[560px] p-6 rounded-xl border border-gray-200/90 shadow-lg bg-white">
            <DialogHeader className="gap-1 pb-3 border-b border-gray-100">
              <DialogTitle className="text-base font-bold text-gray-900">
                Riwayat Follow-up
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Daftar aktivitas reminder untuk member <span className="font-semibold text-gray-900">{activeCustomer?.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[320px] overflow-y-auto mt-2 rounded-lg border border-gray-100">
              {historyLoading ? (
                <div className="p-6 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 bg-gray-50/50">
                      <TableHead className="text-xs font-semibold text-gray-500 pl-4">Kelas</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500">Tanggal</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500">Prioritas</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 pr-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-xs text-gray-400">
                          Belum ada riwayat reminder untuk member ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedHistory.map((hist) => (
                        <TableRow key={hist.id} className="border-b border-gray-50 hover:bg-gray-50/40 text-xs">
                          <TableCell className="font-medium text-gray-900 pl-4">{hist.class_name}</TableCell>
                          <TableCell className="text-gray-600">
                            {hist.class_time ? new Date(hist.class_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                hist.priority?.toLowerCase() === 'high'
                                  ? 'text-red-700 border-red-200 bg-red-50'
                                  : hist.priority?.toLowerCase() === 'medium'
                                  ? 'text-amber-700 border-amber-200 bg-amber-50'
                                  : 'text-emerald-700 border-emerald-200 bg-emerald-50'
                              }`}
                            >
                              {hist.priority?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-4">
                            <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  hist.status === 'Scheduled'
                                    ? 'bg-amber-500'
                                    : hist.status === 'Sent'
                                    ? 'bg-blue-500'
                                    : hist.status === 'Responded'
                                    ? 'bg-emerald-500'
                                    : 'bg-red-500'
                                }`}
                              />
                              {hist.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-gray-100 flex justify-end bg-transparent">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHistoryDialogOpen(false)}
                className="h-8 px-3.5 text-xs font-medium border-gray-200 rounded-lg hover:bg-gray-100"
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 3 Kartu Ringkasan Member */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Total Member Terdaftar</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-gray-900">
              {loading ? <Skeleton className="h-9 w-16" /> : totalMembers}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Seluruh basis data member aktif
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Member VIP</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-amber-600">
              {loading ? <Skeleton className="h-9 w-16" /> : vipCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Pelanggan paket prioritas khusus
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500">Member Regular</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-gray-700">
              {loading ? <Skeleton className="h-9 w-16" /> : regularCount}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Pelanggan paket gym reguler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data Member Bergaya Shadcn */}
      <Card className="rounded-xl border border-gray-200/90 shadow-2xs bg-white">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Daftar Member Aktif
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Seluruh pelanggan yang terdaftar beserta informasi kontak dan preferensi latihan.
            </CardDescription>
          </div>

          {/* Filter Tab Tipe Member */}
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => { setTypeFilter('All'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition ${
                typeFilter === 'All'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Semua ({totalMembers})
            </button>
            <button
              onClick={() => { setTypeFilter('Regular'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition ${
                typeFilter === 'Regular'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Regular ({regularCount})
            </button>
            <button
              onClick={() => { setTypeFilter('VIP'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition ${
                typeFilter === 'VIP'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              VIP ({vipCount})
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
                    <TableHead className="text-xs font-semibold text-gray-500 pl-6">Nama Member</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">No. WhatsApp</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Tipe Member</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Preferensi Latihan</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-xs text-gray-400">
                        Tidak ada data member pada kategori ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition">
                        <TableCell className="pl-6 font-medium text-xs text-gray-900">
                          {customer.name}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 font-mono">
                          {customer.whatsapp_number}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              customer.member_type?.toUpperCase() === 'VIP'
                                ? 'text-amber-800 border-amber-300 bg-amber-50'
                                : 'text-gray-700 border-gray-200 bg-gray-50'
                            }`}
                          >
                            {customer.member_type?.toUpperCase() || 'REGULAR'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-[240px] truncate">
                          {customer.preferences || '-'}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewHistory(customer)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition"
                              title="Lihat riwayat reminder"
                            >
                              <History size={14} />
                            </button>
                            <button
                              onClick={() => handleEditClick(customer)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                              title="Edit data member"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(customer)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                              title="Hapus member"
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

        {/* Footer Tabel Resmi CardFooter Shadcn dengan Navigasi Pagination */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-6 py-3 text-xs text-gray-500 rounded-b-xl">
          <span>
            Menampilkan {filteredCustomers.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0}-
            {Math.min(safeCurrentPage * pageSize, filteredCustomers.length)} dari {filteredCustomers.length} member
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
