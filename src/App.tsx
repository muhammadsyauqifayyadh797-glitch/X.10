/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OceanBackground } from './components/OceanBackground';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { AttendanceRecord, ApprovalStatus, UserRole, AdminRoleType } from './types';
import { ADMIN_CREDENTIALS } from './data/piketSchedule';

const STORAGE_KEY = 'X10_PIKET_ATTENDANCE_V1';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [adminRoleType, setAdminRoleType] = useState<AdminRoleType>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [adminTitle, setAdminTitle] = useState<string>('');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Persistent attendance records state (100% real-time, no fake/demo trial data)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AttendanceRecord[] = JSON.parse(saved);
        // Remove any old mock/demo trial records (e.g. DEMO_1, DEMO_2)
        const realRecords = parsed.filter(r => r.id && !r.id.startsWith('DEMO_'));
        return realRecords;
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
    return [];
  });

  // Save to localStorage & notify other components/tabs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }, [attendanceRecords]);

  // Real-time synchronization across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated: AttendanceRecord[] = JSON.parse(e.newValue);
          const cleanUpdated = updated.filter(r => r.id && !r.id.startsWith('DEMO_'));
          setAttendanceRecords(cleanUpdated);
        } catch (err) {
          console.error('Storage sync error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddRecord = (newRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => [newRecord, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: ApprovalStatus, rejectionReason?: string) => {
    setAttendanceRecords(prev =>
      prev.map(rec => {
        if (rec.id === id) {
          return {
            ...rec,
            status,
            rejectionReason: status === 'Tolak' ? rejectionReason : undefined
          };
        }
        return rec;
      })
    );
  };

  const handleResetData = () => {
    setAttendanceRecords([]);
  };

  const handleSuccessStudentLogin = () => {
    setUserRole('student');
    setAdminRoleType(null);
    setIsLoginModalOpen(false);
  };

  const handleSuccessAdminLogin = (roleType: AdminRoleType, name: string) => {
    setUserRole('admin');
    setAdminRoleType(roleType);
    setAdminName(name);
    setAdminTitle(
      roleType === 'wali_kelas'
        ? 'Wali Kelas X.10'
        : roleType === 'ketua_kelas'
        ? 'Ketua Kelas X.10'
        : 'Ketua Kebersihan X.10'
    );
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    setAdminRoleType(null);
    setAdminName('');
    setAdminTitle('');
    setIsLoginModalOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500 selection:text-slate-900">
      {/* Ocean Theme Background Layer */}
      <OceanBackground />

      {/* Gate or Main Dashboard View */}
      {userRole === null ? (
        <LoginModal
          isInitialGate={true}
          onSuccessStudent={handleSuccessStudentLogin}
          onSuccessAdmin={handleSuccessAdminLogin}
        />
      ) : (
        <main className="relative z-10 min-h-screen">
          {userRole === 'admin' ? (
            <AdminDashboard
              adminName={adminName}
              adminTitle={adminTitle}
              attendanceRecords={attendanceRecords}
              onUpdateStatus={handleUpdateStatus}
              onResetData={handleResetData}
              onLogout={handleLogout}
            />
          ) : (
            <StudentDashboard
              attendanceRecords={attendanceRecords}
              onAddRecord={handleAddRecord}
              onLogout={handleLogout}
              onOpenAdminLogin={() => setIsLoginModalOpen(true)}
            />
          )}
        </main>
      )}

      {/* Login / Switch Role Modal when logged in */}
      {userRole !== null && isLoginModalOpen && (
        <LoginModal
          isInitialGate={false}
          onSuccessStudent={handleSuccessStudentLogin}
          onSuccessAdmin={handleSuccessAdminLogin}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}
