import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Camera, Send, ShieldCheck, Sparkles, UserCheck, AlertCircle, ChevronDown, CheckCircle2, FileText, Mail, LogOut } from 'lucide-react';
import { DayOfWeek, Student, AttendanceRecord } from '../types';
import { SCHEDULE_X10, API_URL } from '../data/piketSchedule';
import { CameraCapture } from './CameraCapture';
import { ClassFooter } from './ClassFooter';
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  attendanceRecords: AttendanceRecord[];
  onAddRecord: (record: AttendanceRecord) => void;
  onLogout: () => void;
  onOpenAdminLogin: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  attendanceRecords,
  onAddRecord,
  onLogout,
  onOpenAdminLogin
}) => {
  // Determine automatic day
  const getTodayDayName = (): DayOfWeek => {
    const dayIndex = new Date().getDay();
    const days: DayOfWeek[] = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex];
  };

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const today = getTodayDayName();
    return (today === 'Sabtu' || today === 'Minggu') ? 'Senin' : today;
  });

  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [alreadyClean, setAlreadyClean] = useState<boolean>(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [quotaPopup, setQuotaPopup] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Daily student list automatically filtered by day
  const dailyStudents: Student[] = SCHEDULE_X10[selectedDay] || [];

  // Count submissions for selected day
  const todayRecords = attendanceRecords.filter(r => r.day === selectedDay);
  const totalStudentsForDay = dailyStudents.length;
  const submittedCount = todayRecords.length;

  // Filter out students who already submitted for this day
  const availableStudents = dailyStudents.filter(
    st => !todayRecords.some(rec => rec.studentName.toLowerCase().trim() === st.name.toLowerCase().trim())
  );

  // Reset student selection when day changes
  useEffect(() => {
    setSelectedStudentName('');
    setAlreadyClean(false);
    setPhotoBase64(null);
    setErrorMessage(null);
  }, [selectedDay]);

  const triggerOceanConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#06b6d4', '#0284c7', '#34d399', '#6366f1']
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedStudentName) {
      setErrorMessage('Pilih nama siswa piket terlebih dahulu.');
      return;
    }

    if (!alreadyClean) {
      setErrorMessage('Centang opsi "Sudah Piket" sebagai konfirmasi pelaksanaan.');
      return;
    }

    if (!photoBase64) {
      setErrorMessage('Ambil foto bukti piket menggunakan kamera HP Android terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timestampStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newRecord: AttendanceRecord = {
      id: 'REC_' + Date.now(),
      studentName: selectedStudentName,
      day: selectedDay,
      dateStr,
      timestamp: timestampStr,
      photoUrl: photoBase64,
      alreadyClean,
      status: 'Pending',
      syncedToAppsScript: true
    };

    // Send payload to Google Apps Script API_URL
    try {
      const payload = {
        action: 'submit_attendance',
        studentName: selectedStudentName,
        day: selectedDay,
        date: dateStr,
        timestamp: timestampStr,
        photoUrl: photoBase64,
        alreadyClean: true,
        class: 'X.10'
      };

      // no-cors fetch with text/plain header to bypass Google Apps Script CORS restrictions
      fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        console.log('Absen berhasil dikirim!');
      })
      .catch(err => console.warn('Gagal mengirim data:', err));

    } catch (err) {
      console.warn('API error:', err);
    }

    // Save record to local state & storage
    onAddRecord(newRecord);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    triggerOceanConfetti();

    // Check if daily quota is now complete
    if (submittedCount + 1 >= totalStudentsForDay && totalStudentsForDay > 0) {
      setTimeout(() => {
        setQuotaPopup(true);
      }, 1500);
    }

    // Reset form after 2 seconds
    setTimeout(() => {
      setSelectedStudentName('');
      setAlreadyClean(false);
      setPhotoBase64(null);
      setSubmitSuccess(false);
    }, 2500);
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-12 pt-4 px-3 max-w-md mx-auto relative z-10">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            X.10
          </div>
          <div>
            <h1 className="text-xs font-bold text-cyan-300 tracking-wide uppercase">MAN 1 Kota Makassar</h1>
            <p className="text-sm font-black text-slate-100 flex items-center gap-1.5">
              <span>Absensi Piket Kelas X.10</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAdminLogin}
          className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          Login Admin
        </button>
      </div>

      {/* Ocean Hero Date Banner */}
      <div className="ocean-glass-card rounded-3xl p-4 mb-4 border border-cyan-500/30 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />
        <p className="text-[11px] uppercase tracking-wider text-cyan-300 font-bold mb-1 flex items-center justify-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {getFormattedDate()}
        </p>
        <h2 className="text-xl font-black text-slate-100 ocean-text-gradient mb-0.5">
          Jadwal Piket Kebersihan X.10
        </h2>
        <p className="text-xs text-cyan-200 font-bold mb-1">
          MAN 1 Kota Makassar
        </p>
        <p className="text-xs text-slate-300">
          Pastikan foto bukti piket jelas &amp; nama terdata di sistem
        </p>

        {/* Day Selector Tabs for Android */}
        <div className="mt-3 flex items-center justify-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          {(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as DayOfWeek[]).map((day) => {
            const isCurrent = day === selectedDay;
            const dayRecordCount = attendanceRecords.filter(r => r.day === day).length;
            const totalForDay = (SCHEDULE_X10[day] || []).length;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {day}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isCurrent ? 'bg-slate-950/20 text-slate-900 font-extrabold' : 'bg-slate-800 text-cyan-400'}`}>
                  {dayRecordCount}/{totalForDay}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Attendance Card */}
      <div className="ocean-glass-card rounded-3xl p-5 border border-cyan-500/30 relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day Status Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-cyan-950/50 border border-cyan-500/20">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Filter Nama Otomatis: <strong className="text-slate-100">{selectedDay}</strong>
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {submittedCount} / {totalStudentsForDay} Selesai
            </span>
          </div>

          {/* AUTO-FILTERED STUDENT NAME DROPDOWN */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Daftar Nama Siswa Piket ({selectedDay}):
            </label>
            {dailyStudents.length === 0 ? (
              <div className="p-3 rounded-2xl bg-slate-900 text-xs text-amber-300 border border-amber-500/30">
                Tidak ada jadwal piket pada hari {selectedDay}. Silakan pilih hari kerja (Senin - Jumat).
              </div>
            ) : availableStudents.length === 0 ? (
              <div className="p-3 rounded-2xl bg-emerald-950/60 text-xs text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Semua {totalStudentsForDay} siswa piket hari {selectedDay} sudah lengkap melakukan absensi!</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedStudentName}
                  onChange={(e) => setSelectedStudentName(e.target.value)}
                  className="w-full appearance-none bg-slate-900/90 text-slate-100 text-xs font-semibold rounded-2xl p-3.5 pr-10 border border-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Nama Siswa Piket {selectedDay} ({availableStudents.length} Tersisa) --</option>
                  {availableStudents.map((st) => (
                    <option key={st.id} value={st.name} className="bg-slate-900 text-slate-100">
                      {st.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* CHECKBOX WAJIB: [ ] Sudah Piket */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex items-start gap-3">
            <input
              type="checkbox"
              id="sudahPiketCheck"
              checked={alreadyClean}
              onChange={(e) => setAlreadyClean(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-md text-cyan-500 bg-slate-800 border-cyan-500/50 focus:ring-cyan-400 focus:ring-offset-slate-950 cursor-pointer"
            />
            <label htmlFor="sudahPiketCheck" className="text-xs font-semibold text-slate-200 cursor-pointer leading-snug">
              <span className="text-cyan-300 font-bold">[ Wajib Centang ]</span> Saya menyatakan sudah melaksanakan tugas piket kebersihan kelas X.10 hari ini.
            </label>
          </div>

          {/* CAMERA PROOF SECTION */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Foto Bukti Kebersihan Piket (Kamera HP):
            </label>

            {photoBase64 ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <img src={photoBase64} alt="Preview Bukti Piket" className="w-full h-44 object-cover" />
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-300 border border-cyan-500/40">
                  ✓ Foto Terambil
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="absolute bottom-2 right-2 bg-cyan-600/90 text-white p-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-lg active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  Ganti Foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="w-full py-4 px-4 rounded-2xl bg-slate-900/80 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all active:scale-98"
              >
                <div className="p-2.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
                  <Camera className="w-6 h-6" />
                </div>
                <span>Ambil Foto Bukti Kebersihan (Live Kamera HP)</span>
              </button>
            )}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Submission Alert */}
          {submitSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex flex-col items-center justify-center gap-1 animate-bounce text-center">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Absen Piket Berhasil Terkirim!</span>
              </div>
              <p className="text-[10px] text-emerald-300/90 font-medium">
                Bukti foto langsung masuk ke Admin (Wali Kelas / Ketua Kelas) dengan status Pending.
              </p>
            </div>
          )}

          {/* Info Realtime Admin Sync */}
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Foto piket yang Anda kirim akan langsung masuk secara real-time ke Admin untuk diverifikasi (ACC).</span>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || availableStudents.length === 0}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 ocean-glow active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Mengirim ke System...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Absen Piket Hari Ini
              </>
            )}
          </button>
        </form>
      </div>

      {/* TODAY'S ATTENDANCE SUMMARY LIST */}
      <div className="mt-5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          Daftar Absen Piket Hari {selectedDay} ({submittedCount}/{totalStudentsForDay})
        </h3>

        {todayRecords.length === 0 ? (
          <div className="ocean-glass rounded-2xl p-4 text-center text-slate-400 text-xs">
            Belum ada siswa yang absen piket untuk hari {selectedDay}.
          </div>
        ) : (
          <div className="space-y-2">
            {todayRecords.map((rec) => (
              <div
                key={rec.id}
                className="ocean-glass rounded-2xl p-3 border border-cyan-500/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={rec.photoUrl}
                    alt={rec.studentName}
                    className="w-11 h-11 rounded-xl object-cover border border-cyan-400/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{rec.studentName}</h4>
                    <p className="text-[10px] text-cyan-400">{rec.timestamp} • Sudah Piket ✓</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    rec.status === 'ACC'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : rec.status === 'Tolak'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={(photo) => {
            setPhotoBase64(photo);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* QUOTA COMPLETE NOTIFICATION POPUP */}
      {quotaPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm ocean-glass-card rounded-3xl p-6 border-2 border-emerald-400 text-center relative overflow-hidden shadow-[0_0_50px_rgba(52,211,153,0.3)]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto mb-3 flex items-center justify-center text-emerald-300 animate-bounce">
              <Mail className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-100 mb-1">
              Kuota Piket Lengkap! ({submittedCount}/{totalStudentsForDay})
            </h3>
            <p className="text-xs text-emerald-300 font-semibold mb-3">
              Seluruh siswa piket hari {selectedDay} telah melakukan absensi.
            </p>

            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-left text-xs text-slate-200 mb-4 space-y-1.5">
              <p className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Laporan Otomatis Terikirim
              </p>
              <p className="text-[11px] leading-relaxed text-slate-300">
                File Rekap PDF Piket Kebersihan X.10 hari ini telah berhasil dikompilasi &amp; dikirimkan ke email Wali Kelas (Pak Ervan, S.Pd.).
              </p>
            </div>

            <button
              onClick={() => setQuotaPopup(false)}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider ocean-glow"
            >
              Tutup Pemberitahuan
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <ClassFooter />
    </div>
  );
};
