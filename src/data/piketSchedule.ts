import { DayOfWeek, Student } from '../types';

export const API_URL = "https://script.google.com/macros/s/AKfycbx-gIlr8Hr7guUZmKVJpLkce2MgrhgCCWdZmAHq4_ev8xT1qxkTbGVqyi9julJ-s9M/exec";

export const SCHEDULE_X10: Record<DayOfWeek, Student[]> = {
  Senin: [
    { id: 'SN1', name: 'NUR HAFIZAH F.F', day: 'Senin' },
    { id: 'SN2', name: 'Althafunnizza Asyara Said', day: 'Senin' },
    { id: 'SN3', name: 'Fathullah Rizqi M.', day: 'Senin' },
    { id: 'SN4', name: 'Najwa Athifah A.', day: 'Senin' },
    { id: 'SN5', name: 'Andi Muhammad Ibnu Fiqri J.K', day: 'Senin' },
    { id: 'SN6', name: 'Jasmine Salwah Syalabiyyah', day: 'Senin' },
    { id: 'SN7', name: 'Al Gazali', day: 'Senin' }
  ],
  Selasa: [
    { id: 'SL1', name: 'Natasya Amanda Aulia Rifat', day: 'Selasa' },
    { id: 'SL2', name: 'Muh. Raihan Putra Nuris', day: 'Selasa' },
    { id: 'SL3', name: 'Husna Kariera Joko', day: 'Selasa' },
    { id: 'SL4', name: 'Abidzar Al Ghiffary', day: 'Selasa' },
    { id: 'SL5', name: 'Muh. Rizki Arrayyan', day: 'Selasa' },
    { id: 'SL6', name: 'Muhammad Syauqi Fayyadh (Ketua Kelas)', day: 'Selasa' },
    { id: 'SL7', name: 'Muh Faiz Muyassar', day: 'Selasa' }
  ],
  Rabu: [
    { id: 'RB1', name: 'Annisa Awaliah Mardani', day: 'Rabu' },
    { id: 'RB2', name: 'La Ode Muhammad fadhlurrahman', day: 'Rabu' },
    { id: 'RB3', name: 'Siti Humaerah', day: 'Rabu' },
    { id: 'RB4', name: 'M. Dzaki Aidil Ridwan', day: 'Rabu' },
    { id: 'RB5', name: 'Jasmine Afifah Naufaizza Muqsith Ersha', day: 'Rabu' },
    { id: 'RB6', name: 'Muhammad Dafi Al Faqih Fitrah', day: 'Rabu' },
    { id: 'RB7', name: 'Daanish Haiyan Al Hakim', day: 'Rabu' }
  ],
  Kamis: [
    { id: 'KM1', name: 'Nuril Maharani', day: 'Kamis' },
    { id: 'KM2', name: 'Muhammad Ridhwan Rahdiansyah R.', day: 'Kamis' },
    { id: 'KM3', name: 'Zakiyyatul Hikmah Rusli', day: 'Kamis' },
    { id: 'KM4', name: 'Dzaky Fadhil Ramadhan', day: 'Kamis' },
    { id: 'KM5', name: 'Anugerah Rezky Talia', day: 'Kamis' },
    { id: 'KM6', name: 'Naufal Hadi Putra', day: 'Kamis' },
    { id: 'KM7', name: 'Hilmiyah', day: 'Kamis' },
    { id: 'KM8', name: 'muh.kanzie prayata akhsan', day: 'Kamis' }
  ],
  Jumat: [
    { id: 'JM1', name: 'Muhammad Abdu Albar Raqiq Qalbi', day: 'Jumat' },
    { id: 'JM2', name: 'Djihan Nurcahya Hafdar', day: 'Jumat' },
    { id: 'JM3', name: 'Ahmad Fauzan Adli Adzim Ramadhan', day: 'Jumat' },
    { id: 'JM4', name: 'Shofya Nasution', day: 'Jumat' },
    { id: 'JM5', name: 'Muhammad Yusril', day: 'Jumat' },
    { id: 'JM6', name: 'Nayla Izzatunnisa Azzahra', day: 'Jumat' },
    { id: 'JM7', name: 'Muhammad restu', day: 'Jumat' },
    { id: 'JM8', name: 'Mulya Noury Putuhena', day: 'Jumat' }
  ],
  Sabtu: [],
  Minggu: []
};

export const ADMIN_CREDENTIALS = {
  studentPassword: 'X.10Bersih',
  adminPassword: 'X.10Pakervan',
  waliKelasName: 'Pak Ervan Ramli, S.H., Gr. (Wali Kelas X.10)',
  ketuaKelasName: 'Muhammad Syauqi Fayyadh (Ketua Kelas)'
};
