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
import { db } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const STORAGE_KEY = 'X10_PIKET_ATTENDANCE_V1';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [adminRoleType, setAdminRoleType] = useState<AdminRoleType>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [adminTitle, setAdminTitle] = useState<string>('');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Attendance records state backed by Firebase Firestore + LocalStorage fallback
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AttendanceRecord[] = JSON.parse(saved);
        return parsed.filter(r => r.id && !r.id.startsWith('DEMO_'));
      }
    } catch (e) {
      console.error('Failed to load initial storage:', e);
    }
    return [];
  });

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const recordsCol = collection(db, 'attendance_records');
      const q = query(recordsCol, orderBy('createdAt', 'desc'));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedRecords: AttendanceRecord[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            studentName: data.studentName || '',
            day: data.day || 'Senin',
            dateStr: data.dateStr || '',
            timestamp: data.timestamp || '',
            photoUrl: data.photoUrl || '',
            alreadyClean: Boolean(data.alreadyClean),
            status: data.status || 'Pending',
            syncedToAppsScript: Boolean(data.syncedToAppsScript),
            rejectionReason: data.rejectionReason || undefined
          } as AttendanceRecord;
        });

        const cleanRecords = fetchedRecords.filter(r => r.id && !r.id.startsWith('DEMO_'));
        setAttendanceRecords(cleanRecords);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanRecords));
        } catch (e) {
          console.error('LocalStorage write error:', e);
        }
      }, (error) => {
        console.error('Firestore snapshot listener error:', error);
      });
    } catch (err) {
      console.error('Firestore setup error:', err);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddRecord = async (newRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);
    
    try {
      const docRef = doc(db, 'attendance_records', newRecord.id);
      await setDoc(docRef, {
        ...newRecord,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error saving record to Firebase:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: ApprovalStatus, rejectionReason?: string) => {
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

    try {
      const docRef = doc(db, 'attendance_records', id);
      await updateDoc(docRef, {
        status,
        rejectionReason: status === 'Tolak' ? rejectionReason : null
      });
    } catch (err) {
      console.error('Error updating status in Firebase:', err);
    }
  };

  const handleResetData = async () => {
    setAttendanceRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      const snapshot = await getDocs(collection(db, 'attendance_records'));
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'attendance_records', docSnap.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Error resetting Firebase collection:', err);
    }
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
