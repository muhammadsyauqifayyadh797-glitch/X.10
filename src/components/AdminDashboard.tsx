import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Trash2, Mail, Calendar, FileText, Info, LogOut, Search, Eye, AlertTriangle, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { AttendanceRecord, ApprovalStatus, DayOfWeek } from '../types';
import { API_URL } from '../data/piketSchedule';
import { ClassFooter } from './ClassFooter';

interface AdminDashboardProps {
  adminName: string;
  adminTitle: string;
  attendanceRecords: AttendanceRecord[];
  onUpdateStatus: (id: string, status: ApprovalStatus, rejectionReason?: string) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminName,
  adminTitle,
  attendanceRecords,
  onUpdateStatus,
  onResetData,
  onLogout
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayOfWeek | 'Semua'>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Pending' | 'ACC' | 'Tolak'>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Reject Modal State
  const [rejectRecordId, setRejectRecordId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Foto kurang jelas / tugas piket belum bersih');

  // Reset Data Modal State
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Filter records
  const filteredRecords = attendanceRecords.filter(r => {
    const matchDay = selectedDayFilter === 'Semua' || r.day === selectedDayFilter;
    const matchStatus = statusFilter === 'Semua' || r.status === statusFilter;
    const matchSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDay && matchStatus && matchSearch;
  });

  const handleConfirmReject = () => {
    if (!rejectRecordId) return;
    onUpdateStatus(rejectRecordId, 'Tolak', rejectReason);
    setRejectRecordId(null);
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);

    try {
      const payload = {
        action: 'reset_data',
        requestedBy: adminName,
        timestamp: new Date().toISOString()
      };

      fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        console.log('Reset command sent to Google Apps Script');
      })
      .catch(err => console.warn('Reset sync warning:', err));
    } catch (err) {
      console.warn('Reset error:', err);
    }

    setTimeout(() => {
      onResetData();
      setIsResetting(false);
      setShowResetConfirm(false);
      setResetSuccessMsg('Data piket berhasil dikosongkan & laporan rekap PDF telah dikirim ke Email Wali Kelas!');
      setTimeout(() => setResetSuccessMsg(null), 4000);
    }, 1200);
  };

  // Stats calculation
  const totalCount = attendanceRecords.length;
  const accCount = attendanceRecords.filter(r => r.status === 'ACC').length;
  const pendingCount = attendanceRecords.filter(r => r.status === 'Pending').length;
  const tolakCount = attendanceRecords.filter(r => r.status === 'Tolak').length;

  return (
    <div className="min-h-screen pb-12 pt-4 px-3 max-w-md mx-auto relative z-10">
      {/* Top Bar Admin Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-300 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 tracking-wide truncate max-w-[200px]">{adminName}</h1>
            <p className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{adminTitle}</span>
              <span className="text-[10px] text-cyan-300 font-bold">· MAN 1 Kota Makassar</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-rose-300 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
      </div>

      {/* SYSTEM INFO BANNER */}
      <div className="ocean-glass-card rounded-3xl p-4 mb-4 border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0 mt-0.5">
            <Info className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider mb-0.5">Sistem Otomatisasi Jadwal:</h3>
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              🌊 "Sistem otomatis mengirim rekap PDF ke Email dan mengosongkan data setiap hari Senin jam 00:00 WITA"
            </p>
          </div>
        </div>
      </div>

      {/* PENDING NOTIFICATION BANNER */}
      {pendingCount > 0 && (
        <div 
          onClick={() => setStatusFilter('Pending')}
          className="ocean-glass-card rounded-3xl p-3.5 mb-4 border-2 border-amber-400/80 bg-amber-950/40 cursor-pointer hover:bg-amber-900/50 transition-all flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(251,191,36,0.2)] animate-pulse"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-xs shrink-0">
              {pendingCount}
            </div>
            <div>
              <p className="text-xs font-black text-amber-200">Ada Bukti Piket Murid Menunggu ACC!</p>
              <p className="text-[10px] text-amber-300/80 font-medium">Klik di sini untuk meninjau foto & setujui (ACC)</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 whitespace-nowrap">
            Tinjau ({pendingCount})
          </span>
        </div>
      )}

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        <button 
          type="button"
          onClick={() => setStatusFilter('Semua')}
          className={`p-2.5 rounded-2xl border text-center transition-all ${statusFilter === 'Semua' ? 'bg-cyan-950/90 border-cyan-400 ring-1 ring-cyan-400' : 'bg-slate-900/80 border-cyan-500/20'}`}
        >
          <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
          <p className="text-sm font-black text-slate-100">{totalCount}</p>
        </button>

        <button 
          type="button"
          onClick={() => setStatusFilter('ACC')}
          className={`p-2.5 rounded-2xl border text-center transition-all ${statusFilter === 'ACC' ? 'bg-emerald-950/90 border-emerald-400 ring-1 ring-emerald-400' : 'bg-emerald-950/60 border-emerald-500/30'}`}
        >
          <p className="text-[10px] text-emerald-400 font-bold uppercase">ACC</p>
          <p className="text-sm font-black text-emerald-300">{accCount}</p>
        </button>

        <button 
          type="button"
          onClick={() => setStatusFilter('Pending')}
          className={`p-2.5 rounded-2xl border text-center transition-all ${statusFilter === 'Pending' ? 'bg-amber-950/90 border-amber-400 ring-1 ring-amber-400' : 'bg-amber-950/60 border-amber-500/30'}`}
        >
          <p className="text-[10px] text-amber-400 font-bold uppercase">Pending</p>
          <p className="text-sm font-black text-amber-300">{pendingCount}</p>
        </button>

        <button 
          type="button"
          onClick={() => setStatusFilter('Tolak')}
          className={`p-2.5 rounded-2xl border text-center transition-all ${statusFilter === 'Tolak' ? 'bg-rose-950/90 border-rose-400 ring-1 ring-rose-400' : 'bg-rose-950/60 border-rose-500/30'}`}
        >
          <p className="text-[10px] text-rose-400 font-bold uppercase">Ditolak</p>
          <p className="text-sm font-black text-rose-300">{tolakCount}</p>
        </button>
      </div>

      {/* ACTION CONTROLS & FILTER */}
      <div className="ocean-glass-card rounded-3xl p-4 mb-4 border border-cyan-500/30 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa piket..."
            className="w-full bg-slate-900/90 text-slate-100 text-xs font-semibold rounded-2xl py-2.5 pl-9 pr-3 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          />
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Day Filter Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {(['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDayFilter === day
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar pt-0.5">
          {(['Semua', 'Pending', 'ACC', 'Tolak'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? st === 'ACC'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : st === 'Pending'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : st === 'Tolak'
                    ? 'bg-rose-500 text-white font-black'
                    : 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              Status: {st}
            </button>
          ))}
        </div>

        {/* TOMBOL MERAH: RESET DATA */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.3)] active:scale-95 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Reset Data (Kirim PDF ke Email &amp; Dikosongkan)
        </button>
      </div>

      {resetSuccessMsg && (
        <div className="p-3.5 mb-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {/* STUDENT ATTENDANCE RECORDS LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center justify-between px-1">
          <span>Daftar Bukti Absen Siswa ({filteredRecords.length})</span>
          {selectedDayFilter !== 'Semua' && <span>Filter: Hari {selectedDayFilter}</span>}
        </h3>

        {filteredRecords.length === 0 ? (
          <div className="ocean-glass rounded-3xl p-6 text-center text-slate-400 text-xs">
            Tidak ada data bukti absen piket yang cocok.
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="ocean-glass-card rounded-3xl p-4 border border-cyan-500/25 space-y-3 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setSelectedPhoto(rec.photoUrl)}
                    className="relative cursor-pointer group"
                  >
                    <img
                      src={rec.photoUrl}
                      alt={rec.studentName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/40 group-hover:border-cyan-300 transition-colors"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5 text-cyan-300" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-100">{rec.studentName}</h4>
                    <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Piket {rec.day} • {rec.timestamp}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-medium">✓ Sudah Piket Kebersihan</p>
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

              {rec.rejectionReason && (
                <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/30 text-[11px] text-rose-300">
                  <strong>Alasan Penolakan:</strong> {rec.rejectionReason}
                </div>
              )}

              {/* ACTION BUTTONS: ACC & TOLAK */}
              <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onUpdateStatus(rec.id, 'ACC')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    rec.status === 'ACC'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACC / Setujui
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRejectRecordId(rec.id);
                    setRejectReason('Foto bukti piket kurang jelas / lokasi belum bersih sepenuhnya.');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    rec.status === 'Tolak'
                      ? 'bg-rose-600 text-white shadow-md font-black'
                      : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Tolak
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FULL PHOTO PREVIEW MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-sm ocean-glass-card rounded-3xl p-4 border border-cyan-500/30 text-center relative overflow-hidden">
            <img src={selectedPhoto} alt="Foto Bukti Piket" className="w-full h-80 object-cover rounded-2xl mb-3 border border-cyan-400/40" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {rejectRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-sm ocean-glass-card rounded-3xl p-5 border border-rose-500/40 relative">
            <h3 className="text-sm font-black text-rose-300 mb-2 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              Konfirmasi Penolakan Absen
            </h3>

            <p className="text-xs text-slate-300 mb-3">
              Masukkan alasan penolakan agar siswa piket dapat memperbaiki tugas kebersihan.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-xs p-3 rounded-2xl border border-rose-500/30 focus:outline-none focus:border-rose-400 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectRecordId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md"
              >
                Tolak Absen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-sm ocean-glass-card rounded-3xl p-5 border-2 border-rose-500 text-center relative overflow-hidden shadow-[0_0_40px_rgba(225,29,72,0.3)]">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 mx-auto mb-3 flex items-center justify-center text-rose-400 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-100 mb-1">
              Reset Data Piket Kebersihan?
            </h3>

            <p className="text-xs text-rose-300 font-semibold mb-3">
              Semua data absen &amp; foto bukti piket akan dikosongkan.
            </p>

            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-left text-xs text-slate-300 mb-4 space-y-1">
              <p className="flex items-center gap-1.5 text-rose-200 font-bold">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                Kirim Laporan PDF ke Email:
              </p>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Sistem akan secara otomatis menyusun seluruh rekapitulasi absen minggu ini ke file PDF dan mengirimkannya ke email Wali Kelas (Pak Ervan, S.Pd.).
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleExecuteReset}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg uppercase tracking-wide flex items-center justify-center gap-1.5"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Reset &amp; Kirim PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <ClassFooter />
    </div>
  );
};
