export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface Student {
  id: string;
  name: string;
  day: DayOfWeek;
}

export type ApprovalStatus = 'Pending' | 'ACC' | 'Tolak';

export interface AttendanceRecord {
  id: string;
  studentName: string;
  day: DayOfWeek;
  dateStr: string;
  timestamp: string;
  photoUrl: string;
  alreadyClean: boolean;
  status: ApprovalStatus;
  rejectionReason?: string;
  syncedToAppsScript?: boolean;
}

export type UserRole = 'student' | 'admin' | null;

export type AdminRoleType = 'wali_kelas' | 'ketua_kelas' | 'ketua_kebersihan' | null;

export interface AdminUser {
  roleType: AdminRoleType;
  name: string;
  title: string;
}
