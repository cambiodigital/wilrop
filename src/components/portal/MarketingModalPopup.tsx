'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { usePortalNavigation } from '@/hooks/use-portal-navigation';

const STORAGE_KEY = 'wilrop_marketing_modal_dismissed';

interface ModalData {
  active: boolean;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  ctaType: string;
  timerEnabled: boolean;
  timerLabel: string;
  timerEnd: string | null;
  position: string;
  delayMs: number;
}

function getTimeRemaining(endTime: string) {
  const total = new Date(endTime).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);

  return { total, days, hours, minutes, seconds };
}

function TimerDisplay({ endTime, label }: { endTime: string; label: string }) {
  const [time, setTime] = useState(getTimeRemaining(endTime));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const remaining = getTimeRemaining(endTime);
      setTime(remaining);
      if (remaining.total <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endTime]);

  if (time.total <= 0) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
      <p className="text-[10px] text-amber-600 uppercase tracking-wider font-semibold mb-1.5">
        {label}
      </p>
      <div className="flex items-center justify-center gap-2">
        {time.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-amber-700 font-mono leading-none">
              {pad(time.days)}
            </span>
            <span className="text-[9px] text-amber-500 mt-0.5">DÍAS</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-amber-700 font-mono leading-none">
            {pad(time.hours)}
          </span>
          <span className="text-[9px] text-amber-500 mt-0.5">HRS</span>
        </div>
        <span className="text-amber-400 font-bold text-lg">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-amber-700 font-mono leading-none">
            {pad(time.minutes)}
          </span>
          <span className="text-[9px] text-amber-500 mt-0.5">MIN</span>
        </div>
        <span className="text-amber-400 font-bold text-lg">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-amber-700 font-mono leading-none">
            {pad(time.seconds)}
          </span>
          <span className="text-[9px] text-amber-500 mt-0.5">SEG</span>
        </div>
      </div>
    </div>
  );
}

export default function MarketingModalPopup() {
  const pathname = usePathname();
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { navigate } = usePortalNavigation();

  // Check if modal was recently dismissed (within 24h)
  const wasRecentlyDismissed = useCallback(() => {
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (!dismissedAt) return false;
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      return elapsed < 24 * 60 * 60 * 1000; // 24 hours
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Don't show in protected role-based panels
    if (pathname.startsWith('/admin') || pathname.startsWith('/reseller') || pathname.startsWith('/subagent')) {
      setLoading(false);
      return;
    }

    // Check if recently dismissed
    if (wasRecentlyDismissed()) {
      setLoading(false);
      return;
    }

    // Fetch modal config
    const fetchModal = async () => {
      try {
        const res = await fetch('/api/marketing-modal');
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();

        if (!data.active) {
          setLoading(false);
          return;
        }

        setModalData(data);

        // Show after delay
        const delay = data.delayMs || 3000;
        setTimeout(() => {
          setVisible(true);
        }, delay);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchModal();
  }, [pathname, wasRecentlyDismissed]);

  const handleClose = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // localStorage not available
    }
  }, []);

  const handleCta = useCallback(() => {
    if (!modalData) return;
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }

    if (modalData.ctaType === 'navigate' && modalData.ctaLink) {
      navigate(modalData.ctaLink);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (modalData.ctaType === 'link' && modalData.ctaLink) {
      window.open(modalData.ctaLink, '_blank', 'noopener,noreferrer');
    }
  }, [modalData, navigate]);

  // Don't render anything if no data or not visible
  if (!modalData || !visible) return null;

  const isBottomRight = modalData.position === 'bottom-right';
  const isBottomLeft = modalData.position === 'bottom-left';

  // Position classes for bottom corners
  const positionClass = isBottomRight
    ? 'fixed bottom-6 right-6 z-[100]'
    : isBottomLeft
      ? 'fixed bottom-6 left-6 z-[100]'
      : 'fixed inset-0 z-[100] flex items-center justify-center';

  const overlayClass = modalData.position === 'center'
    ? 'absolute inset-0 bg-black/50 backdrop-blur-sm'
    : '';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={modalData.position === 'center' ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={modalData.position === 'center' ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={positionClass}
        >
          {/* Backdrop overlay for center position */}
          {overlayClass && (
            <motion.div
              className={overlayClass}
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          {/* Modal card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
            className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${
              modalData.position === 'center'
                ? 'max-w-md w-[calc(100%-2rem)] mx-4'
                : 'max-w-sm w-[calc(100%-2rem)]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            {modalData.imageUrl && (
              <div className="relative h-48 sm:h-52">
                <img
                  src={modalData.imageUrl}
                  alt={modalData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {modalData.subtitle && (
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="inline-block bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {modalData.subtitle}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              {!modalData.imageUrl && modalData.subtitle && (
                <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
                  {modalData.subtitle}
                </span>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                {modalData.title}
              </h3>

              {modalData.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {modalData.description}
                </p>
              )}

              {/* Timer */}
              {modalData.timerEnabled && modalData.timerEnd && (
                <div className="mb-4">
                  <TimerDisplay endTime={modalData.timerEnd} label={modalData.timerLabel} />
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handleCta}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-[0.98]"
              >
                {modalData.ctaText}
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-3">
                Puedes cerrar este aviso
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
