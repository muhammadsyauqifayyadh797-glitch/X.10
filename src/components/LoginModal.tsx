import React, { useState, useEffect } from 'react';
import { ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, Lock, User, Camera, X, Clock, AlertTriangle } from 'lucide-react';
import { AdminRoleType } from '../types';
import { ADMIN_CREDENTIALS } from '../data/piketSchedule';
import { FaceScanCamera } from './FaceScanCamera';
import { ClassFooter } from './ClassFooter';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  onSuccessStudent: () => void;
  onSuccessAdmin: (roleType: AdminRoleType, name: string) => void;
  onClose?: () => void;
  isInitialGate?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onSuccessStudent,
  onSuccessAdmin,
  onClose,
  isInitialGate = false
}) => {
  const [loginTab, setLoginTab] = useState<'student' | 'admin'>('student');

  // Form states - Empty by default, user enters password themselves
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [selectedAdminRole, setSelectedAdminRole] = useState<AdminRoleType>('wali_kelas');

  const [showStudentPass, setShowStudentPass] = useState<boolean>(false);
  const [showAdminPass, setShowAdminPass] = useState<boolean>(false);

  // Lockout logic for Student (3 failed attempts -> 15s timer)
  const [studentFailCount, setStudentFailCount] = useState<number>(0);
  const [studentLockoutSeconds, setStudentLockoutSeconds] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccessModal, setIsSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Dual Face Scan Trigger State
  const [showFaceScanCamera, setShowFaceScanCamera] = useState<boolean>(false);

  // Student lockout timer effect
  useEffect(() => {
    let timer: any = null;
    if (studentLockoutSeconds > 0) {
      timer = setInterval(() => {
        setStudentLockoutSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [studentLockoutSeconds]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#06b6d4', '#0284c7', '#38bdf8']
      });
    } catch (e) {}
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentLockoutSeconds > 0) return;

    setErrorMsg(null);

    if (studentPassword === ADMIN_CREDENTIALS.studentPassword) {
      setStudentFailCount(0);
      setIsSuccessModal(true);
      setSuccessMessage('Login Siswa Berhasil');
      triggerConfetti();
      setTimeout(() => {
        onSuccessStudent();
      }, 1000);
    } else {
      const nextFail = studentFailCount + 1;
      if (nextFail >= 3) {
        setStudentFailCount(0);
        setStudentLockoutSeconds(15);
        setErrorMsg('Password salah 3 kali! Silakan tunggu 15 detik sebelum mencoba kembali.');
      } else {
        setStudentFailCount(nextFail);
        setErrorMsg(`Password siswa salah (${nextFail}/3). Silakan periksa kembali.`);
      }
    }
  };

  const handleAdminPasswordCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const pwd = adminPassword.trim();
    const isPassValid = 
      pwd === ADMIN_CREDENTIALS.adminPassword || 
      pwd === ADMIN_CREDENTIALS.ketuaKebersihanPassword ||
      pwd === 'X.10Kebersihan' ||
      pwd === 'X.10Pakervan';

    if (!isPassValid) {
      setErrorMsg('Password Admin/Ketua Kebersihan salah! Silakan coba lagi.');
      return;
    }

    // Open Face Scan Camera for verified admin role!
    setShowFaceScanCamera(true);
  };

  const handleFaceScanSuccess = (role: AdminRoleType, name: string) => {
    setShowFaceScanCamera(false);
    setIsSuccessModal(true);
    const roleLabel = role === 'wali_kelas' ? 'Wali Kelas' : role === 'ketua_kelas' ? 'Ketua Kelas' : 'Ketua Kebersihan';
    setSuccessMessage(`Akses Admin Disetujui (${roleLabel})`);
    triggerConfetti();

    setTimeout(() => {
      onSuccessAdmin(role, name);
    }, 1000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden text-slate-100">
          {/* Close Button if not initial gate */}
          {!isInitialGate && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-5 flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-extrabold mx-auto mb-2 flex items-center justify-center text-sm shadow-sm">
              X.10
            </div>
            <h1 className="text-xs font-extrabold text-cyan-300 uppercase tracking-wide">
              MAN 1 Kota Makassar
            </h1>
            <h2 className="text-base font-bold text-slate-100">Portal Absensi Piket Kelas X.10</h2>
            <p className="text-xs text-slate-400 mt-0.5">Silakan masukkan password akun Anda</p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => { setLoginTab('student'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                loginTab === 'student'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Murid
            </button>
            <button
              type="button"
              onClick={() => { setLoginTab('admin'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                loginTab === 'admin'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* TAB 1: MURID */}
          {loginTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password Murid:
                </label>
                <div className="relative">
                  <input
                    type={showStudentPass ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    disabled={studentLockoutSeconds > 0}
                    placeholder="Ketik password murid..."
                    className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 pl-9 pr-10 border border-slate-800 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowStudentPass(!showStudentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showStudentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-medium border flex items-start gap-2 ${
                  studentLockoutSeconds > 0
                    ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                    : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                }`}>
                  {studentLockoutSeconds > 0 ? (
                    <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={studentLockoutSeconds > 0 || !studentPassword.trim()}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {studentLockoutSeconds > 0 ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Tunggu {studentLockoutSeconds} Detik...
                  </>
                ) : (
                  'Masuk Kebenaran Absensi'
                )}
              </button>
            </form>
          )}

          {/* TAB 2: ADMIN */}
          {loginTab === 'admin' && (
            <form onSubmit={handleAdminPasswordCheck} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih Jabatan Admin:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAdminRole('wali_kelas')}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      selectedAdminRole === 'wali_kelas'
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-100 text-[11px] truncate">Wali Kelas</div>
                    <div className="text-[9px] text-slate-400 truncate" title="Pak Ervan Ramli, S.H., Gr.">Pak Ervan Ramli, S.H., Gr.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAdminRole('ketua_kelas')}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      selectedAdminRole === 'ketua_kelas'
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-100 text-[11px] truncate">Ketua Kelas</div>
                    <div className="text-[9px] text-slate-400 truncate" title="Muhammad Syauqi Fayyadh">Muhammad Syauqi Fayyadh</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAdminRole('ketua_kebersihan')}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      selectedAdminRole === 'ketua_kebersihan'
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-100 text-[11px] truncate">Ketua Kebersihan</div>
                    <div className="text-[9px] text-slate-400 truncate">Admin Piket</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password Admin:
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Ketik password admin..."
                    className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 pl-9 pr-10 border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-200 text-xs border border-rose-500/40 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!adminPassword.trim()}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Lanjut Verifikasi Biometrik
              </button>
            </form>
          )}

          {/* Class Footer */}
          <ClassFooter />

          {/* SUCCESS MODAL OVERLAY */}
          {isSuccessModal && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200 z-30">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">{successMessage}</h3>
              <p className="text-xs text-slate-400 mt-1">Membuka Dashboard...</p>
            </div>
          )}
        </div>
      </div>

      {/* DUAL FACE SCAN CAMERA MODAL */}
      {showFaceScanCamera && (
        <FaceScanCamera
          roleType={selectedAdminRole}
          onSuccess={handleFaceScanSuccess}
          onCancel={() => setShowFaceScanCamera(false)}
        />
      )}
    </>
  );
};

