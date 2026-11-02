import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import API from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data dari backend Express saat halaman dimuat
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await API.get('/reminders'); 
        setReminders(response.data.data || response.data);
      } catch (error) {
        console.error('Gagal mengambil data reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  // Fungsi untuk memformat link WhatsApp Click-to-Chat
  const handleWhatsApp = (phone, customerName, className) => {
    if (!phone) return;
    
    // Pastikan nomor diawali dengan 62
    let formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    
    const message = `Halo ${customerName}, ini dari Gymnasyum! Mengingatkan untuk jadwal kelas ${className} Anda. Apakah Anda akan hadir?`;
    const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(waLink, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Pantau status follow-up member gym Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Reminder Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Memuat data...</div>
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
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        Belum ada data reminder.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">
                          {reminder.customer_name}
                        </TableCell>
                        <TableCell>
                          {reminder.class_name}
                        </TableCell>
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
                          <Badge className={
                            reminder.status?.toLowerCase() === 'pending' ? 'bg-orange-500 hover:bg-orange-600' : 
                            reminder.status?.toLowerCase() === 'contacted' ? 'bg-blue-500 hover:bg-blue-600' : 
                            'bg-green-500 hover:bg-green-600'
                          }>
                            {reminder.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 ml-auto"
                            onClick={() => handleWhatsApp(
                              reminder.whatsapp_number, 
                              reminder.customer_name, 
                              reminder.class_name
                            )}
                          >
                            <MessageCircle size={16} />
                            Follow Up
                          </Button>
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