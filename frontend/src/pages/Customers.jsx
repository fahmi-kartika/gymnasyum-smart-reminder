import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import API from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Import komponen shadcn tambahan
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tambahkan state baru sebagai pemicu (trigger) untuk memuat ulang data
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    member_type: 'Regular',
    preferences: ''
  });

  // Pindahkan fungsi fetch sepenuhnya ke dalam useEffect
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, member_type: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/customers', formData);
      setIsDialogOpen(false);
      setFormData({ name: '', whatsapp_number: '', member_type: 'Regular', preferences: '' });
      
      // Ubah nilai trigger untuk memancing useEffect memuat ulang data terbaru
      setRefreshTrigger(prev => prev + 1); 
      
    } catch (error) {
      console.error('Gagal menambah data:', error);
      alert('Gagal menambahkan member. Periksa konsol untuk detail error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Data Member</h2>
          <p className="text-gray-500 mt-1">Kelola daftar pelanggan gym Anda di sini.</p>
        </div>
        
        {/* Pembungkus Dialog / Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus size={16} />
              Tambah Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Member Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Contoh: Budi Santoso" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
                <Input 
                  id="whatsapp_number" 
                  name="whatsapp_number" 
                  value={formData.whatsapp_number} 
                  onChange={handleInputChange} 
                  placeholder="Contoh: 08123456789" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member_type">Tipe Member</Label>
                <Select value={formData.member_type} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferensi Latihan</Label>
                <Input 
                  id="preferences" 
                  name="preferences" 
                  value={formData.preferences} 
                  onChange={handleInputChange} 
                  placeholder="Contoh: Latihan kardio ringan" 
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
          <CardTitle>Daftar Member Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Memuat data...</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>No. WhatsApp</TableHead>
                    <TableHead>Tipe Member</TableHead>
                    <TableHead>Preferensi Latihan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        Belum ada data member.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.whatsapp_number}</TableCell>
                        <TableCell>
                          <Badge variant={customer.member_type?.toUpperCase() === 'VIP' ? 'default' : 'secondary'} 
                                 className={customer.member_type?.toUpperCase() === 'VIP' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                            {customer.member_type?.toUpperCase() || 'REGULAR'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {customer.preferences || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Edit size={16} />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
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