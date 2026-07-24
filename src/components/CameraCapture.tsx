import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, SwitchCamera, Image } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoBase64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startStream = async (mode: 'environment' | 'user') => {
    setIsLoading(true);
    setCameraError(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Small delay to allow camera hardware to release previous stream lock
    await new Promise(resolve => setTimeout(resolve, 150));

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false
      });
    } catch (err1) {
      console.warn('First camera attempt failed, trying fallback constraints:', err1);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (err2) {
        console.error('All camera attempts failed:', err2);
        setCameraError('Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.');
        setIsLoading(false);
        return;
      }
    }

    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== 'AbortError') {
            console.warn('Video play notice:', playErr);
          }
        }
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startStream(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleTakeSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Flip horizontally if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
  };

  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleFileUploadFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-sm ocean-glass-card rounded-3xl p-4 text-center relative overflow-hidden border border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-slate-100">Kamera Bukti Piket</h3>
          </div>
          <button
            onClick={() => {
              if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-900 border border-cyan-500/30 flex items-center justify-center mb-4">
          {capturedPhoto ? (
            <img src={capturedPhoto} alt="Bukti Piket" className="w-full h-full object-cover" />
          ) : cameraError ? (
            <div className="p-4 text-center flex flex-col items-center gap-2">
              <p className="text-xs text-rose-300">{cameraError}</p>
              <label className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer">
                <Image className="w-4 h-4" />
                Pilih Foto dari Galeri HP
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadFallback}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
              />
              <div className="absolute bottom-3 right-3">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="p-2 rounded-full bg-slate-900/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md active:scale-95 transition-transform"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {capturedPhoto ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCapturedPhoto(null)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Jepret Ulang
            </button>
            <button
              type="button"
              onClick={() => {
                if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
                onCapture(capturedPhoto);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 ocean-glow-sm active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              Gunakan Foto
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <button
              type="button"
              disabled={isLoading || !!cameraError}
              onClick={handleTakeSnap}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 ocean-glow active:scale-95 transition-all disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              Ambil Foto Bukti Piket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
