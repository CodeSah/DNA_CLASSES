import React, { useState, useEffect } from 'react';
import { Student, Announcement, Teacher, StudyMaterial } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_TEACHERS, 
  INITIAL_MATERIALS 
} from './data/seedData';
import AnnouncementsBanner from './components/AnnouncementsBanner';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import SchoolHomepage from './components/SchoolHomepage';
import { 
  GraduationCap, 
  Settings, 
  Lock, 
  Unlock, 
  RefreshCw, 
  HelpCircle, 
  FileCheck2, 
  Eye, 
  CheckCircle,
  Clock,
  Home,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('gva_dark_mode_dna');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gva_dark_mode_dna', String(isDarkMode));
    } catch (e) {}
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load/Save students
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem('gva_students_dna');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading students from localStorage", e);
    }
    return INITIAL_STUDENTS;
  });

  // Load/Save announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const stored = localStorage.getItem('gva_announcements_dna');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading announcements from localStorage", e);
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  // Load/Save teachers
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const stored = localStorage.getItem('gva_teachers_dna');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading teachers from localStorage", e);
    }
    return INITIAL_TEACHERS;
  });

  // Load/Save study materials
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const stored = localStorage.getItem('gva_study_materials_dna');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading materials from localStorage", e);
    }
    return INITIAL_MATERIALS;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'student' | 'teacher' | 'admin'>('home');

  // Application Device Simulation Mode: 'responsive' | 'android' | 'ios' | 'desktop'
  const [simulationMode, setSimulationMode] = useState<'responsive' | 'android' | 'ios' | 'desktop'>('responsive');

  // Sync edits to localStorage
  useEffect(() => {
    localStorage.setItem('gva_students_dna', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('gva_announcements_dna', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('gva_teachers_dna', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('gva_study_materials_dna', JSON.stringify(studyMaterials));
  }, [studyMaterials]);

  const handleResetToSeeds = () => {
    if (confirm("Reset current database ledger back to initial school presets? All manual grading and candidate updates will be overwritten.")) {
      setStudents(INITIAL_STUDENTS);
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      setTeachers(INITIAL_TEACHERS);
      setStudyMaterials(INITIAL_MATERIALS);
      setActiveTab('home');
      alert("Portal successfully re-seeded with pristine default records!");
    }
  };

  // Simulated device header wrap
  const renderSimulationWrapper = (child: React.ReactNode) => {
    if (simulationMode === 'responsive') {
      return <div className="w-full">{child}</div>;
    }

    if (simulationMode === 'android') {
      return (
        <div className="flex justify-center my-3 select-none">
          {/* Android Shell */}
          <div className="w-[390px] h-[780px] bg-[#111111] border-[12px] border-[#222222] rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-[#2a2a2a]/20">
            {/* Notch Speaker */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-50 flex items-center justify-center">
              <span className="w-8 h-1.5 bg-[#222] rounded-full"></span>
            </div>

            {/* Android Status Bar */}
            <div className="h-7 bg-[#000000] text-gray-400 px-6 flex items-center justify-between text-[10px] uppercase font-mono z-40 shrink-0">
              <span>12:45 PM</span>
              <div className="flex items-center gap-1.5">
                <span>📶 5G</span>
                <span>🔋 97%</span>
              </div>
            </div>

            {/* Simulated Workspace Screen */}
            <div className={`flex-1 overflow-y-auto px-3 py-4 text-xs font-sans scrollbar-thin transition-colors duration-200 ${
              isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'
            }`}>
              {child}
            </div>

            {/* Android Bottom Navigation Pillar */}
            <div className="h-10 bg-black flex items-center justify-around text-gray-500 text-sm z-45 shrink-0 border-t border-gray-900">
              <button className="hover:text-white" onClick={() => setActiveTab('home')}>◀</button>
              <button className="hover:text-white" onClick={() => setActiveTab('student')}>●</button>
              <button className="hover:text-white" onClick={() => setActiveTab('teacher')}>■</button>
            </div>
          </div>
        </div>
      );
    }

    if (simulationMode === 'ios') {
      return (
        <div className="flex justify-center my-3 select-none">
          {/* iOS iPhone Shell */}
          <div className="w-[390px] h-[780px] bg-[#0A0A0A] border-[14px] border-[#1C1C1E] rounded-[44px] shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-[#444]/10">
            {/* iPhone Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-1.5 bg-[#111] rounded-full ml-auto mr-1.5"></div>
            </div>

            {/* iOS Status Bar */}
            <div className="h-8 bg-black text-white px-7 flex items-center justify-between text-[10px] font-sans font-bold z-40 shrink-0">
              <span>12:45</span>
              <div className="flex items-center gap-1">
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Screen Inner */}
            <div className={`flex-1 overflow-y-auto px-3.5 py-4 text-xs font-sans scrollbar-thin transition-colors duration-200 ${
              isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'
            }`}>
              {child}
            </div>

            {/* iOS Bottom bar indicator */}
            <div className="h-8 bg-black flex items-center justify-center z-45 shrink-0">
              <span className="w-28 h-1 bg-white/40 rounded-full"></span>
            </div>
          </div>
        </div>
      );
    }

    // MacBook Desktop style
    return (
      <div className="w-full bg-[#141414] border border-[#222222] rounded-lg shadow-2xl my-4 overflow-hidden relative flex flex-col">
        {/* Desktop window controls bar */}
        <div className="h-10 bg-[#090909] border-b border-[#222] px-4 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
          </div>
          <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase font-black">
            💻 Dev Narayan Academy Desktop application (MacOS Client Simulator)
          </span>
          <span className="text-xs text-[#028A60] font-mono">100% Online</span>
        </div>

        <div className={`flex-1 p-5 overflow-auto transition-colors duration-250 ${
          isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'
        }`}>
          {child}
        </div>
      </div>
    );
  };

  return (
    <div id="school-portal-root" className={`min-h-screen flex flex-col font-sans leading-normal selection:bg-[#028A60] selection:text-white transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100 dark' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* 1. BROADCASTING NEWS GAZZETE */}
      <AnnouncementsBanner announcements={announcements} />
 
      {/* 2. BRANDING BANNER HERO */}
      <header id="main-portal-header" className={`border-b border-slate-200 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#131929] text-white' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 border-2 border-[#028A60] hover:border-[#02A875] flex items-center justify-center bg-emerald-50 text-[#028A60] shrink-0 transition-colors select-none">
              <GraduationCap className="w-6.5 h-6.5 text-[#028A60]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-emerald-50 text-[#028A60] px-2 py-0.5 border border-emerald-250 border-emerald-200 font-bold font-mono">
                  ESTD: 2080 B.S.
                </span>
                <span className="flex items-center gap-1 text-[9px] text-[#02A875] font-bold font-mono bg-white px-1.5 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> DB PERSIST ACTIVE
                </span>
              </div>
              <h1 className={`text-xl font-serif italic font-black tracking-tight mt-0.5 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Dev Narayan Academy (DNA Classes)
              </h1>
              <p className={`text-[10px] uppercase tracking-widest leading-none mt-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Janakpur-11, Kishori Nagar • Directed by Aatish Sah • "Your Education in DNA"
              </p>
            </div>
          </div>

          {/* SIMULATION MODE DECK SELECTORS FOR CLIENTS */}
          <div className={`border p-1 flex items-center gap-1 text-[11px] font-mono leading-none rounded transition-colors duration-200 ${
            isDarkMode ? 'bg-[#1a2236] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className={`px-2 text-[10px] font-bold uppercase select-none hidden sm:inline-block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>📱 Simulator Mode:</span>
            
            <button
              onClick={() => setSimulationMode('responsive')}
              className={`py-1.5 px-3 uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                simulationMode === 'responsive' ? 'bg-[#028A60] text-white font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Web App
            </button>

            <button
              onClick={() => setSimulationMode('android')}
              className={`py-1.5 px-3 uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                simulationMode === 'android' ? 'bg-[#028A60] text-white font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android
            </button>

            <button
              onClick={() => setSimulationMode('ios')}
              className={`py-1.5 px-3 uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                simulationMode === 'ios' ? 'bg-[#028A60] text-white font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              iOS app
            </button>

            <button
              onClick={() => setSimulationMode('desktop')}
              className={`py-1.5 px-3 uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                simulationMode === 'desktop' ? 'bg-[#028A60] text-white font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>

          </div>

        </div>
      </header>

      {/* 3. CORE ROLES NAVIGATION PANEL */}
      <nav id="role-selector-bar" className={`border-b transition-colors duration-300 py-2.5 ${
        isDarkMode ? 'bg-[#0b0f19] border-slate-850' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div id="roles-tabs-control" className={`flex p-0.5 rounded border transition-colors duration-200 ${
            isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
          } w-full sm:w-auto font-mono text-center`}>
            
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                activeTab === 'home' 
                  ? (isDarkMode ? 'bg-[#1d273d] text-white border-b-2 border-[#028A60]' : 'bg-slate-100 text-slate-900 border-b-2 border-[#028A60]') 
                  : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#028A60]" />
              School Home
            </button>

            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                activeTab === 'student' 
                  ? (isDarkMode ? 'bg-[#1d273d] text-white border-b-2 border-[#028A60]' : 'bg-slate-100 text-slate-900 border-b-2 border-[#028A60]') 
                  : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#028A60]" />
              Student Portal
            </button>

            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                activeTab === 'teacher' 
                  ? (isDarkMode ? 'bg-[#1d273d] text-white border-b-2 border-[#028A60]' : 'bg-slate-100 text-slate-900 border-b-2 border-[#028A60]') 
                  : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Teacher Cockpit
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                activeTab === 'admin' 
                  ? (isDarkMode ? 'bg-[#1d273d] text-white border-b-2 border-red-605' : 'bg-slate-100 text-slate-900 border-b-2 border-red-600') 
                  : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-red-500" />
              Admin Console
            </button>

          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4 text-xs font-semibold text-slate-500 font-mono leading-none flex-wrap">
            <p className={`flex items-center gap-1.5 font-serif italic text-sm ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Clock className="w-4 h-4 text-[#028A60]" />
              Evaluation: SEE Preparatory
            </p>

            <div className="flex items-center gap-3.5 flex-wrap">
              {/* EYE CARE LIGHT/DARK OPTION SWITCH */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-3xs ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900 text-yellow-400 hover:text-yellow-300 hover:bg-slate-850' 
                    : 'border-slate-200 bg-white text-slate-600 hover:text-[#028A60] hover:bg-slate-50'
                }`}
                title="Toggle Eye-Care Light/Dark Mode"
              >
                {isDarkMode ? '☀ Light View' : '🌙 Dark View'}
              </button>

              <button
                onClick={handleResetToSeeds}
                className="flex items-center gap-1 text-[#028A60] hover:text-[#02A875] transition-colors py-1 cursor-pointer font-bold uppercase text-[10px]"
                title="Wipe database changes and reseed samples"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset DB Seed Samples
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* 4. MAIN CENTRAL CONTENT AREA CHUNKS */}
      <main id="main-workspace-section" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {renderSimulationWrapper(
          <div>
            
            {/* HOMEPAGE VIEW */}
            {activeTab === 'home' && (
              <SchoolHomepage 
                onNavigate={(tab) => setActiveTab(tab)}
                announcements={announcements} 
              />
            )}

            {/* STUDENT PORTAL CARD */}
            {activeTab === 'student' && (
              <div id="active-student-portal-area">
                <div className={`mb-4 p-4 border flex items-center justify-between flex-wrap gap-2 text-xs rounded shadow-sm transition-colors duration-200 ${
                  isDarkMode ? 'bg-[#131929] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <div>
                    <h3 className={`uppercase tracking-wider font-semibold flex items-center gap-1.5 font-mono select-none ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      <span className="w-1.5 h-3 bg-[#028A60]"></span>
                      Student Assessment Desk
                    </h3>
                    <p className={`font-serif italic mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter credentials passcode to track attendance, scores, and files download.</p>
                  </div>
                  <span className="text-[9px] bg-[#028A60]/10 text-[#028A60] font-mono font-bold border border-[#028A60]/30 px-2 py-0.5 select-none leading-none rounded">
                    READ-PERSISTENT
                  </span>
                </div>

                <StudentDashboard 
                  students={students} 
                  onUpdateStudents={setStudents}
                  studyMaterials={studyMaterials}
                  isDarkMode={isDarkMode}
                  announcements={announcements}
                />
              </div>
            )}

            {/* TEACHER DASHBOARD PORTAL */}
            {activeTab === 'teacher' && (
              <div id="active-teacher-portal-area">
                <div className="mb-4 bg-white p-4 border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs rounded">
                  <div>
                    <h3 className="font-serif italic text-slate-800 font-semibold flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-3 bg-emerald-500"></span>
                      🔐 Authorized Instructors grading ledger desk
                    </h3>
                    <p className="text-slate-500 font-mono mt-0.5">Manage class-wise testing grades matrix, announce gazette notices, and release study worksheets.</p>
                  </div>
                </div>

                <TeacherDashboard 
                  students={students}
                  onUpdateStudents={setStudents}
                  announcements={announcements}
                  onUpdateAnnouncements={setAnnouncements}
                  teachers={teachers}
                  onUpdateTeachers={setTeachers}
                  studyMaterials={studyMaterials}
                  onUpdateStudyMaterials={setStudyMaterials}
                />
              </div>
            )}

            {/* CENTRAL ADMINISTRATIVE DECK CONSOLE */}
            {activeTab === 'admin' && (
              <div id="active-admin-console-area">
                <div className="mb-4 bg-white p-4 border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs rounded">
                  <div>
                    <h3 className="font-mono text-slate-800 font-black uppercase flex items-center gap-1.5 select-none text-red-500">
                      <span className="w-1.5 h-3 bg-red-600 rounded"></span>
                      ⚙ Secure Administration command cockpit
                    </h3>
                    <p className="text-slate-500 font-serif italic mt-0.5">Control grade withholding states, enroll student credentials, and allocate study courses dynamically.</p>
                  </div>
                </div>

                <AdminDashboard 
                  students={students}
                  onUpdateStudents={setStudents}
                  teachers={teachers}
                  onUpdateTeachers={setTeachers}
                  announcements={announcements}
                  onUpdateAnnouncements={setAnnouncements}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* 5. FOOTER LOGS */}
      <footer id="main-portal-footer" className={`border-t transition-colors duration-300 py-8 text-center select-none shrink-0 ${
        isDarkMode ? 'bg-[#131929] border-slate-850 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className={`max-w-7xl mx-auto px-4 text-[9px] uppercase tracking-[0.3em] font-mono ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <p>DEV NARAYAN ACADEMY (DNA Classes) Administration ledger cockpit • Janakpur-11, Kishori Nagar • Established 2080 B.S.</p>
          <p className="mt-2 text-slate-400">
            Engineered with React 19 + Tailwind CSS + full device emulator mock system. Certified secure sandbox server.
          </p>
          <p className="mt-3 text-[#028A60] dark:text-[#02A875] font-bold text-[10px] tracking-widest uppercase">
            ★ DEVELOPED BY KHUSHI KUMARI SAH ★
          </p>
        </div>
      </footer>

    </div>
  );
}
