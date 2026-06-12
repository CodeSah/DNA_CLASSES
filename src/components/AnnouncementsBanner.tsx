import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { 
  Megaphone, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Award, 
  Calendar, 
  AlertCircle, 
  Bell, 
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnnouncementsBannerProps {
  announcements: Announcement[];
}

export default function AnnouncementsBanner({ announcements }: AnnouncementsBannerProps) {
  const activeAnnouncements = announcements.filter(a => a.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);

  useEffect(() => {
    if (activeAnnouncements.length <= 1 || isPaused || showAllModal) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 6000); // cycle every 6 seconds

    return () => clearInterval(interval);
  }, [activeAnnouncements.length, isPaused, showAllModal]);

  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[currentIndex];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" id="high-priority-icon" />
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border border-amber-300',
          icon: <Bell className="w-5 h-5 text-amber-600 shrink-0" id="med-priority-icon" />
        };
      default:
        return {
          bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800',
          badge: 'bg-slate-200 text-slate-700 border border-slate-300',
          icon: <Volume2 className="w-5 h-5 text-slate-600 shrink-0" id="low-priority-icon" />
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academics':
        return <FileText className="w-3.5 h-3.5 mr-1 inline text-[#8E795E]" />;
      case 'Events':
        return <Megaphone className="w-3.5 h-3.5 mr-1 inline text-[#8E795E]" />;
      case 'Holiday':
        return <Calendar className="w-3.5 h-3.5 mr-1 inline text-[#8E795E]" />;
      case 'Sports':
        return <Award className="w-3.5 h-3.5 mr-1 inline text-[#8E795E]" />;
      default:
        return <Bell className="w-3.5 h-3.5 mr-1 inline text-[#8E795E]" />;
    }
  };

  const currentStyle = getPriorityStyle(current.priority);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
  };

  return (
    <div id="school-announcements-region" className="w-full">
      {/* Alert Ribbon Cover */}
      <div 
        id="announcement-banner-container"
        className={`border-b transition-colors duration-200 cursor-pointer ${currentStyle.bg}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => setSelectedNotice(current)}
      >
        <div id="announcement-banner-inner" className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {currentStyle.icon}
            
            <div className="flex items-center space-x-2 shrink-0">
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest ${currentStyle.badge}`}>
                {current.priority === 'high' ? 'Urgent' : 'Notice'}
              </span>
              <span className="bg-white text-slate-850 px-2 py-0.5 rounded-sm text-xs font-medium border border-slate-205 flex items-center select-none shadow-xs text-slate-800">
                {getCategoryIcon(current.category)}
                {current.category}
              </span>
            </div>

            <div className="relative overflow-hidden flex-1 min-w-0 h-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-medium truncate pr-4 text-slate-900 flex items-center"
                >
                  <span className="font-serif italic text-emerald-800 mr-2 shrink-0 font-bold">{current.title}:</span>
                  <span className="font-serif italic text-slate-600 truncate">{current.content}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div id="banner-controls" className="flex items-center space-x-3 shrink-0 ml-4 font-mono text-xs">
            <span className="text-slate-500 hidden sm:inline mr-2 uppercase tracking-tight">
              📅 {current.date}
            </span>
            
            <button 
              id="view-all-notices-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowAllModal(true);
              }}
              className="text-slate-755 hover:text-slate-950 text-slate-705 font-semibold bg-white px-3 py-1 rounded border border-slate-200 transition-all text-xs mr-2 shrink-0 uppercase tracking-wider cursor-pointer"
            >
              See All ({activeAnnouncements.length})
            </button>

            {activeAnnouncements.length > 1 && (
              <div id="arrows-nav-group" className="flex items-center space-x-1.5 border-l border-slate-205 pl-3">
                <button 
                  id="arr-prev-notice"
                  onClick={handlePrev}
                  className="p-1 rounded hover:bg-slate-200 text-slate-503 hover:text-slate-952 focus:outline-none transition-colors"
                  title="Previous Notice"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-slate-510 select-none min-w-[2.5rem] text-center font-mono">
                  {currentIndex + 1} / {activeAnnouncements.length}
                </span>
                <button 
                  id="arr-next-notice"
                  onClick={handleNext}
                  className="p-1 rounded hover:bg-slate-200 text-slate-503 hover:text-slate-952 focus:outline-none transition-colors"
                  title="Next Notice"
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Notice Detail */}
      <AnimatePresence>
        {selectedNotice && (
          <div id="notice-detail-dialog" className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNotice(null)}
                className="fixed inset-0 bg-slate-950/65 transition-opacity"
              />

              {/* Centering element */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              {/* Modal Card */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="inline-block align-bottom bg-white dark:bg-[#131929] rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-slate-200 dark:border-slate-800"
              >
                <div className="bg-slate-50 dark:bg-[#182033] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-emerald-600" />
                    School Bulletin Board
                  </h3>
                  <button 
                    id="close-notice-detail-btn"
                    onClick={() => setSelectedNotice(null)}
                    className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="px-6 py-6 bg-white dark:bg-[#131929]">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                      selectedNotice.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-250' :
                      selectedNotice.priority === 'medium' ? 'font-mono bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {selectedNotice.priority} priority
                    </span>
                    <span className="bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded text-xs font-medium border border-slate-200 dark:bg-[#1c2336] dark:text-slate-300 dark:border-slate-750 flex items-center">
                      {getCategoryIcon(selectedNotice.category)}
                      {selectedNotice.category}
                    </span>
                    <span className="text-slate-400 text-xs ml-auto font-mono">
                      Posted: {selectedNotice.date}
                    </span>
                  </div>

                  <h4 className="text-xl font-serif italic text-slate-900 dark:text-white mb-3 leading-snug">
                    {selectedNotice.title}
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-[#1c2336] p-4 rounded border border-slate-202 dark:border-slate-800 font-serif italic text-slate-600 dark:text-slate-300">
                    {selectedNotice.content}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#182033] px-6 py-3.5 border-t border-slate-202 dark:border-slate-800 flex justify-end">
                  <button 
                    id="ack-notice-btn"
                    onClick={() => setSelectedNotice(null)}
                    className="px-5 py-2 bg-[#028A60] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#02A875] transition-colors cursor-pointer rounded"
                  >
                    Acknowledge
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: All Notices Noticeboard Dashboard */}
      <AnimatePresence>
        {showAllModal && (
          <div id="all-notices-board-dialog" className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAllModal(false)}
                className="fixed inset-0 bg-slate-950/65 transition-opacity"
              />

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="inline-block align-bottom bg-white dark:bg-[#131929] rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-205 dark:border-slate-800"
              >
                <div className="bg-slate-50 dark:bg-[#182033] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm uppercase tracking-widest font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-[#028A60]" />
                      School Announcements Archive
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-serif italic">Stay informed with latest updates from teachers & administration</p>
                  </div>
                  <button 
                    id="close-all-notices-btn"
                    onClick={() => setShowAllModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950">
                  {activeAnnouncements.map((ann) => {
                    const style = getPriorityStyle(ann.priority);
                    return (
                      <div 
                        id={`archive-announcement-${ann.id}`}
                        key={ann.id} 
                        className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#028A60]/50 transition-all flex flex-col bg-white dark:bg-[#182033] shadow-xs"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${style.badge}`}>
                            {ann.priority}
                          </span>
                          <span className="bg-slate-100 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-205 dark:border-slate-850 flex items-center">
                            {getCategoryIcon(ann.category)}
                            {ann.category}
                          </span>
                          <span className="text-slate-400 text-[11px] font-mono ml-auto">
                            📅 {ann.date}
                          </span>
                        </div>
                        <h4 className="font-serif italic font-bold text-slate-900 dark:text-slate-100 text-base mb-1">{ann.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-serif italic">{ann.content}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-50 dark:bg-[#182033] px-6 py-4 border-t border-slate-202 dark:border-slate-800 flex justify-end">
                  <button 
                    id="close-archive-panel-btn"
                    onClick={() => setShowAllModal(false)}
                    className="px-4 py-2 border border-slate-202 dark:border-slate-855 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
                  >
                    Close Board
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
