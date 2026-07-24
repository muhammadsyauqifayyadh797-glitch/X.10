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

  // Persistent attendance records state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }

    // Default mock sample data for class X.10 preview
    return [
      {
        id: 'DEMO_1',
        studentName: 'NUR HAFIZAH F.F',
        day: 'Senin',
        dateStr: 'Senin, 24 Juli 2026',
        timestamp: '06:45:10 WITA',
        photoUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
        alreadyClean: true,
        status: 'ACC',
        syncedToAppsScript: true
      },
      {
        id: 'DEMO_2',
        studentName: 'Althafunnizza Asyara Said',
        day: 'Senin',
        dateStr: 'Senin, 24 Juli 2026',
        timestamp: '06:50:22 WITA',
        photoUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80',
        alreadyClean: true,
        status: 'ACC',
        syncedToAppsScript: true
      },
      {
        id: 'DEMO_3',
        studentName: 'Fathullah Rizqi M.',
        day: 'Senin',
        dateStr: 'Senin, 24 Juli 2026',
        timestamp: '07:02:15 WITA',
        photoUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80',
        alreadyClean: true,
        status: 'Pending',
        syncedToAppsScript: true
      }
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }, [attendanceRecords]);

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
