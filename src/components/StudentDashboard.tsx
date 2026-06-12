import React, { useState, useRef } from 'react';
import { Student, StudyMaterial, SubjectMark, ExamType, ExamMark, Announcement } from '../types';
import { EXAMS_CONFIG } from '../data/seedData';
import { 
  Lock, 
  Unlock, 
  User, 
  BookOpen, 
  Award, 
  Calendar, 
  Clock, 
  Download, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Printer, 
  RefreshCw, 
  FileText,
  TrendingUp,
  FileCheck2,
  ChevronDown,
  TrendingDown,
  Megaphone
} from 'lucide-react';

interface StudentDashboardProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  studyMaterials: StudyMaterial[];
  isDarkMode?: boolean;
  announcements?: Announcement[];
}

export default function StudentDashboard({ 
  students, 
  onUpdateStudents, 
  studyMaterials,
  isDarkMode = false,
  announcements = []
}: StudentDashboardProps) {

  const [activePortalTab, setActivePortalTab] = useState<'progress' | 'attendance' | 'study_materials' | 'security' | 'notices'>('progress');
  const [authenticatedId, setAuthenticatedId] = useState<string | null>(null);
  
  // Login input states
  const [usernameInput, setUsernameInput] = useState('');
  const [pwdInput, setPwdInput] = useState('');
  const [pwdVisible, setPwdVisible] = useState(false);
  const [authError, setAuthError] = useState('');

  // Password generation states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Simulating download states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [printStatusText, setPrintStatusText] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);

  // Print ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Authenticate student session
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    // Find candidate by case-insensitive name or exact username
    const found = students.find(s => 
      s.username.toLowerCase().trim() === usernameInput.toLowerCase().trim() ||
      s.id.toLowerCase().trim() === usernameInput.toLowerCase().trim()
    );

    if (!found) {
      setAuthError('Access denied. Academic ID or Username not found.');
      return;
    }

    if (found.password === pwdInput.trim()) {
      setAuthenticatedId(found.id);
      setUsernameInput('');
      setPwdInput('');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Password verification failed.');
    }
  };

  const activeStudent = students.find(s => s.id === authenticatedId) || null;

  const handleLogout = () => {
    setAuthenticatedId(null);
    setSecuritySuccess('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Generate self password
  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setSecuritySuccess('Generated. Press Apply to save!');
  };

  const handleApplyPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess('');

    if (!activeStudent) return;
    if (!newPassword.trim()) {
      setAuthError('Password cannot be blank.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecuritySuccess('Passwords do not match.');
      return;
    }

    const updatedStudents = students.map(s => {
      if (s.id === activeStudent.id) {
        return {
          ...s,
          password: newPassword.trim()
        };
      }
      return s;
    });

    onUpdateStudents(updatedStudents);
    setNewPassword('');
    setConfirmPassword('');
    setSecuritySuccess('Password successfully updated and saved!');
  };

  // Filter study materials for student's class and enrolled subjects
  const filteredMaterials = activeStudent 
    ? studyMaterials.filter(mat => {
        const classMatch = mat.gradeClass.toLowerCase() === 'all' || mat.gradeClass.toLowerCase() === activeStudent.gradeClass.toLowerCase();
        const subjectMatch = mat.subject.toLowerCase() === 'all' || activeStudent.subjects.some(sub => sub.toLowerCase() === mat.subject.toLowerCase());
        return classMatch && subjectMatch;
      })
    : [];

  const handleTriggerMockDownload = (material: StudyMaterial) => {
    setDownloadingId(material.id);
    setTimeout(() => {
      setDownloadingId(null);
      const link = document.createElement("a");
      // Use the actual data URL if it looks like a valid Base64 PDF, otherwise download the fallback standard material PDF
      link.href = material.downloadUrl && material.downloadUrl !== '#' 
        ? material.downloadUrl 
        : `data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaidbXTUgMCBSIDIgMCBSXQoyIDAgb2JqJzw8L0tpZHNbMyAwIFJdL0NvdW55IDE+Pg0KMyAwIG9iaic8PC9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzIDQgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9Db250ZW50cyA2IDAgUj4+DQo0IDAgb2JqJzw8L0ZvbnQ8PC9GMSA1IDAgUj4+Pj4NCjUgMCBvYmo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+Pg0KNiAwIG9iaic8PC9MZW5ndGggNTY+PnN0cmVhbQ0KQlQKL0YxIDEyIFRmDQoxMDAgODAwIFRkDQooRGV2IE5hcmF5YW4gQWNhZGVteSAtIFN0dWR5IE1hdGVyaWFsKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+DQolRU9G`;
      link.download = material.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 800);
  };

  // Calculations for Marks Scorecard
  const calculateAggregateStats = (student: Student) => {
    let totalObtained = 0;
    let totalMax = 0;
    let totalExamsGraded = 0;
    let testPassed = 0;
    let testFailed = 0;

    student.marksBySubject.forEach(sub => {
      sub.exams.forEach(ex => {
        if (ex.obtainedScore !== undefined) {
          totalObtained += ex.obtainedScore;
          totalMax += ex.totalScore;
          totalExamsGraded++;
          
          if (ex.obtainedScore >= ex.passScore) {
            testPassed++;
          } else {
            testFailed++;
          }
        }
      });
    });

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    
    // Equivalent Grade
    let grade = 'N/A';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else if (totalMax > 0) grade = 'E (Needs Improvement)';

    return {
      percentage,
      totalObtained,
      totalMax,
      grade,
      testPassed,
      testFailed,
      totalExamsGraded
    };
  };

  // Calculation for Attendance
  const calculateAttendancePercentage = (student: Student) => {
    const records = student.attendance;
    if (records.length === 0) return 100;
    const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    return Math.round((presentCount / records.length) * 100);
  };

  // Print Functionality for Student Dashboard Transcript supporting 2 distinct report types
  const handlePrintTranscript = (reportType: 'summary' | 'recent' = 'summary') => {
    if (!activeStudent) return;

    const reportTypeName = reportType === 'recent' 
      ? 'Recent Attempted Assessments Statement' 
      : 'Comprehensive Academic Ledger Summary';

    setPrintStatusText(`Assembling ${reportTypeName}... If the print dialog is blocked, please click "Open in New Tab" at the top right of the screen.`);

    // Create or select the direct print layout div outside #root
    let printLayout = document.getElementById('direct-print-layout');
    if (!printLayout) {
      printLayout = document.createElement('div');
      printLayout.id = 'direct-print-layout';
      document.body.appendChild(printLayout);
    }

    // Prepare subject row items dynamically filtering based on reportType
    const subjectRows = activeStudent.marksBySubject.map(sub => {
      // Filter for 'recent' report type to only show attempted exams
      const examsToRender = reportType === 'recent'
        ? sub.exams.filter(ex => ex.obtainedScore !== undefined)
        : sub.exams;

      if (examsToRender.length === 0) {
        return '';
      }

      return examsToRender.map((ex, exIdx) => {
        const scoreObtained = ex.obtainedScore !== undefined ? ex.obtainedScore : 'Not Entered';
        const outcome = ex.obtainedScore !== undefined ? (ex.obtainedScore >= ex.passScore ? 'PASSED' : 'REMEDIAL RECD') : '-';
        const remarksStr = ex.remarks || '';
        return `
          <tr>
            ${exIdx === 0 ? `<td rowspan="${examsToRender.length}" style="font-weight: bold; vertical-align: middle; background-color: #fafafa; border: 1px solid #ddd; padding: 8px 10px;">${sub.subject}</td>` : ''}
            <td style="border: 1px solid #ddd; padding: 6px 10px;">${ex.examType}</td>
            <td style="border: 1px solid #ddd; padding: 6px 10px; text-align: center;">${ex.totalScore}</td>
            <td style="border: 1px solid #ddd; padding: 6px 10px; text-align: center;">${ex.passScore}</td>
            <td style="border: 1px solid #ddd; padding: 6px 10px; text-align: center; font-weight: bold; color: ${ex.obtainedScore !== undefined ? (ex.obtainedScore >= ex.passScore ? '#028A60' : '#ef4444') : '#888'};">${scoreObtained}</td>
            <td style="border: 1px solid #ddd; padding: 6px 10px; text-align: center; font-weight: bold; color: ${ex.obtainedScore !== undefined && ex.obtainedScore >= ex.passScore ? '#028A60' : '#ef4444'};">${outcome}</td>
            <td style="border: 1px solid #ddd; padding: 6px 10px; font-style: italic; font-size: 11px; max-width: 15rem; word-break: break-all;">${remarksStr}</td>
          </tr>
        `;
      }).join('');
    }).filter(rowHtml => rowHtml !== '').join('');

    // Attendance rate
    const records = activeStudent.attendance;
    const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const attPercentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 100;

    const reportHeadline = reportType === 'recent' 
      ? 'REGISTRATION OF RECENT ASSESSMENTS' 
      : 'SUBJECT-WISE ACADEMIC STANDING LEDGER';

    const cleanSubjectRows = subjectRows.trim() !== '' 
      ? subjectRows 
      : `<tr><td colspan="7" style="text-align: center; padding: 20px; font-style: italic; color: #777;">No active evaluation marks found matching this filter.</td></tr>`;

    const printHtmlContent = `
      <style>
        @media print {
          /* Hide standard screen workspace */
          #root, .toast, .no-print {
            display: none !important;
          }
          #direct-print-layout {
            display: block !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        @media screen {
          #direct-print-layout {
            display: none !important;
          }
        }
        
        /* High definition portrait page constraints */
        .print-page-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #111111;
          line-height: 1.35;
          font-size: 11px;
          padding: 8mm;
          background: #ffffff;
          box-sizing: border-box;
          text-align: left;
        }
        .header-container {
          text-align: center;
          border-bottom: 2px solid #028A60;
          padding-bottom: 6px;
          margin-bottom: 12px;
        }
        .header-title {
          margin: 0;
          font-size: 20px;
          font-style: italic;
          font-family: serif;
          font-weight: 900;
          color: #028A60;
        }
        .header-subtitle {
          margin: 2px 0 0;
          font-size: 9px;
          letter-spacing: 1.5px;
          font-weight: bold;
          text-transform: uppercase;
          color: #444;
        }
        .header-meta {
          margin: 1px 0 0;
          font-size: 10px;
          color: #666;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
          border: 1px solid #eee;
          padding: 8px 12px;
          background-color: #fafafa;
        }
        .info-item {
          margin: 2px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 12px;
        }
        th {
          background-color: #028A60;
          color: #ffffff;
          font-weight: bold;
          padding: 6px 8px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #016f4d;
          text-align: left;
        }
        td {
          padding: 4px 8px;
          border: 1px solid #ddd;
          font-size:  10.5px;
        }
        .text-center {
          text-align: center;
        }
        .font-bold {
          font-weight: bold;
        }
        .sign-container {
          display: flex;
          justify-content: space-between;
          margin-top: 35px;
        }
        .sign-line {
          border-top: 1px solid #666;
          width: 150px;
          text-align: center;
          padding-top: 4px;
          font-size: 10.5px;
          font-weight: bold;
          color: #444;
        }
        .footer-info {
          margin-top: 25px;
          text-align: center;
          font-size: 8.5px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          border-top: 1px solid #eee;
          padding-top: 8px;
        }
      </style>
      <div class="print-page-container">
        <div class="header-container">
          <h1 class="header-title">DEV NARAYAN ACADEMY</h1>
          <p class="header-subtitle">Your Education in DNA &bull; Coaching Centre Janakpur-11</p>
          <p class="header-meta">Est: 2080 B.S. | Director: Aatish Sah</p>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-item"><strong>Student Name:</strong> ${activeStudent.name}</div>
            <div class="info-item"><strong>Enrollment Number:</strong> ${activeStudent.id}</div>
            <div class="info-item"><strong>Portal Username:</strong> ${activeStudent.username}</div>
          </div>
          <div>
            <div class="info-item"><strong>Academic Level:</strong> ${activeStudent.gradeClass}</div>
            <div class="info-item"><strong>Attendance Register:</strong> ${attPercentage}% Present</div>
            <div class="info-item"><strong>Statement Date:</strong> ${new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        <h3 style="margin: 12px 0 6px; text-transform: uppercase; font-size: 11px; border-bottom: 2px solid #028A60; padding-bottom: 3px; color: #028A60; letter-spacing: 0.5px; font-weight: bold;">
          ${reportHeadline}
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Subject</th>
              <th style="width: 20%;">Exam Type</th>
              <th style="width: 10%; text-align: center;">Max</th>
              <th style="width: 10%; text-align: center;">Pass</th>
              <th style="width: 10%; text-align: center;">Obtained</th>
              <th style="width: 10%; text-align: center;">Status</th>
              <th style="width: 15%;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${cleanSubjectRows}
          </tbody>
        </table>

        <div class="sign-container">
          <div class="sign-line">Director Aatish Sah</div>
          <div class="sign-line">Coaching Registrar</div>
        </div>

        <div class="footer-info">
          Dev Narayan Academy &bull; Janakpur-11, Kishori Nagar &bull; Nepal
        </div>
      </div>
    `;

    printLayout.innerHTML = printHtmlContent;

    // Trigger printing once document body has updated
    setTimeout(() => {
      try {
        window.focus();
        window.print();
        setPrintStatusText('Print layout compiled successfully! Operating system printer window launched.');
      } catch (printErr) {
        console.warn('Sandbox blocked direct window printing.', printErr);
        setPrintStatusText('Print status initialized. Press Ctrl+P (PC) or Cmd+P (Mac) to complete printing if the overlay was blocked.');
      }
    }, 150);
  };

  // If student session is inactive
  if (!activeStudent) {
    return (
      <div id="student-login-box" className={`max-w-md mx-auto my-12 border rounded-lg shadow-xl overflow-hidden transition-colors duration-200 ${
        isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-8 text-center border-b transition-colors duration-200 ${
          isDarkMode ? 'bg-[#182033] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`w-14 h-14 border rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm transition-colors duration-200 ${
            isDarkMode ? 'bg-[#1c2336] border-[#02A875]' : 'bg-white border-[#028A60]'
          }`}>
            <User className={`w-6 h-6 ${isDarkMode ? 'text-[#02A875]' : 'text-[#028A60]'}`} />
          </div>
          <h3 className={`text-xl font-serif italic ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Student Portal Entry</h3>
          <p className={`text-xs uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dev Narayan Academy (DNA Classes)</p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {authError && (
            <div id="student-auth-failure" className={`p-3 border rounded text-xs flex items-center gap-2 transition-colors duration-200 ${
              isDarkMode ? 'bg-red-950/40 border-red-900 text-red-200' : 'bg-red-50 border-red-250 text-red-800'
            }`}>
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div>
            <label className={`block text-[10px] uppercase font-mono tracking-widest mb-1 ${
              isDarkMode ? 'text-slate-405' : 'text-slate-500'
            }`}>Enrollment ID or Username:</label>
            <input 
              type="text"
              required
              placeholder="e.g. aarav or DNA-2026-001"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className={`w-full rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 font-mono transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-[#1c2336] border-slate-800 text-white focus:border-[#02A875] focus:ring-[#02A875]' 
                  : 'bg-white border-slate-300 text-slate-800 focus:border-[#028A60] focus:ring-[#028A60]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[10px] uppercase font-mono tracking-widest mb-1 ${
              isDarkMode ? 'text-slate-405' : 'text-slate-500'
            }`}>Access Password:</label>
            <div className="relative">
              <input 
                type={pwdVisible ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={pwdInput}
                onChange={(e) => setPwdInput(e.target.value)}
                className={`w-full rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 font-mono pr-10 transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-[#1c2336] border-slate-800 text-white focus:border-[#02A875] focus:ring-[#02A875]' 
                    : 'bg-white border-slate-300 text-slate-800 focus:border-[#028A60] focus:ring-[#028A60]'
                }`}
              />
              <button
                type="button"
                onClick={() => setPwdVisible(!pwdVisible)}
                className={`absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {pwdVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#028A60] hover:bg-[#02A875] text-white font-bold text-xs uppercase tracking-widest rounded transition-colors font-mono cursor-pointer shadow-xs"
          >
            Authenticate Credentials
          </button>
        </form>
      </div>
    );
  }

  // Calculate metrics
  const stats = calculateAggregateStats(activeStudent);
  const attendancePercentage = calculateAttendancePercentage(activeStudent);

  return (
    <div id="student-portal-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-3">
      
      {/* LEFT COLUMN: Student Card & Navigation Menu */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Profile Card */}
        <div className={`p-5 rounded-lg text-center relative overflow-hidden shadow-xs border transition-colors duration-200 ${
          isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-[#028A60]"></div>
          
          <div className={`w-16 h-16 border-2 rounded-full flex items-center justify-center mx-auto text-3xl font-serif italic mb-3 transition-colors duration-200 ${
            isDarkMode ? 'bg-[#1c2336] border-[#02A875] text-[#02A875]' : 'bg-slate-50 border-[#028A60] text-slate-800'
          }`}>
            {activeStudent.name.charAt(0)}
          </div>
          
          <h3 className={`text-lg font-serif italic font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeStudent.name}</h3>
          <span className={`inline-block px-2.5 py-0.5 border text-[10px] rounded-full font-bold uppercase tracking-wider mt-1 select-none font-mono transition-colors duration-200 ${
            isDarkMode ? 'bg-[#1c2336] text-[#02A875] border-slate-800' : 'bg-slate-100 text-emerald-800 border-slate-200'
          }`}>
            {activeStudent.gradeClass}
          </span>

          <div className={`border-t mt-4 pt-4 space-y-2 text-xs font-mono text-left transition-colors duration-200 ${
            isDarkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>ENROLLMENT ID:</span>
              <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>{activeStudent.id}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>USERNAME:</span>
              <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-950'}`}>{activeStudent.username}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>ATTENDANCE LEVEL:</span>
              <span className={`font-bold ${attendancePercentage >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{attendancePercentage}%</span>
            </div>
          </div>

          <div className="mt-5 pt-1">
            <button
              onClick={handleLogout}
              className={`w-full py-2 border rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#1c2336] hover:bg-[#222b40] text-slate-300 border-slate-800' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              Sign Out Session
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className={`p-2 rounded-lg flex flex-col space-y-1 shadow-xs border transition-colors duration-200 ${
          isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={() => setActivePortalTab('progress')}
            className={`w-full text-left py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activePortalTab === 'progress' ? 'bg-[#028A60] text-white' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            Study Progress & Marks
          </button>

          <button
            onClick={() => setActivePortalTab('attendance')}
            className={`w-full text-left py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activePortalTab === 'attendance' ? 'bg-[#028A60] text-white' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Attendance Register
          </button>

          <button
            onClick={() => setActivePortalTab('study_materials')}
            className={`w-full text-left py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activePortalTab === 'study_materials' ? 'bg-[#028A60] text-white' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
          >
            <Download className="w-4 h-4" />
            Coaching Study Guides ({filteredMaterials.length})
          </button>

          <button
            onClick={() => setActivePortalTab('notices')}
            className={`w-full text-left py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activePortalTab === 'notices' ? 'bg-[#028A60] text-white' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Academy Notice Board ({announcements.filter(a => a.active).length})
          </button>

          <button
            onClick={() => setActivePortalTab('security')}
            className={`w-full text-left py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activePortalTab === 'security' ? 'bg-[#028A60] text-white' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
          >
            <Key className="w-4 h-4" />
            Key Passwords Generator
          </button>
        </div>

        {/* Dynamic Tip of the Day */}
        <div className="bg-white border border-slate-200 p-4 rounded-lg space-y-2 shadow-xs">
          <h4 className="text-[10px] font-mono tracking-widest text-[#028A60] uppercase font-bold">DNA Study Reminder:</h4>
          <p className="text-xs text-slate-500 italic leading-relaxed font-serif">
            Remember, "Self Evaluation Test (25M)" pass score is 10. Direct practice files can be downloaded from the "Coaching Study Guides" tab matching your curriculum!
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Panel */}
      <div className="lg:col-span-8">
        
        {/* WITHHELD GATEKEEPER CHECK */}
        {activePortalTab === 'progress' && activeStudent.isResultWithheld ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif text-slate-800 italic">Dossier Statement Withheld</h3>
            <p className="text-sm text-slate-650 max-w-md mx-auto leading-relaxed font-serif">
              Your academic course transcript results sheet has been flagged as <strong className="text-red-600 uppercase font-mono bg-red-50 px-2 py-0.5 border border-red-200 rounded">Withheld by Administration</strong>. Please check with Director Aatish Sah or clear outstanding dues at Janakpur DNA classes desk.
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Note: Attendance tracking registers and study material packets remain accessible. Toggle navigation tabs on the left column.
            </p>
          </div>
        ) : (
          <div>
            
            {/* PROGRESS TAB */}
            {activePortalTab === 'progress' && (
              <div className="space-y-6">
                
                {/* Visual Cover card */}
                <div className={`p-6 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs transition-colors duration-200 ${
                  isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <h2 className={`text-xl font-serif italic flex items-center gap-2 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      <TrendingUp className="w-5 h-5 text-[#028A60]" />
                      Marksheet & Diagnostic Tracker
                    </h2>
                    <p className={`text-xs font-serif ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Review evaluation standings across all subjects and exams.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 md:self-center">
                    <button
                      onClick={() => handlePrintTranscript('recent')}
                      className="py-1.5 px-3.5 bg-[#028A60] hover:bg-[#02A875] text-white rounded flex items-center gap-1.5 text-xs font-bold uppercase transition-colors shadow-sm cursor-pointer border border-[#016f4d]"
                      title="Print only academic assessments with score details"
                    >
                      <Printer className="w-4 h-4 shrink-0" />
                      Print Recent Exams
                    </button>

                    <button
                      onClick={() => handlePrintTranscript('summary')}
                      className={`py-1.5 px-3.5 rounded flex items-center gap-1.5 text-xs font-bold uppercase transition-colors shadow-sm cursor-pointer border ${
                        isDarkMode 
                          ? 'bg-[#1c2336] hover:bg-[#252f4a] text-slate-200 border-slate-800' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-705 border-slate-200'
                      }`}
                      title="Print comprehensive course summary ledger transcript"
                    >
                      <Printer className="w-4 h-4 shrink-0" />
                      Print Marks Summary
                    </button>
                  </div>
                </div>

                {/* Score Summary Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Performance Rate */}
                  <div className={`border p-4 rounded-lg flex items-center gap-3 shadow-xs transition-colors duration-250 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="p-2.5 bg-emerald-50 text-[#028A60] rounded border border-emerald-100 dark:border-emerald-930/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Aggregate Class Rating</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.percentage}%</span>
                        <span className="text-xs font-mono text-slate-500">Average</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Grade */}
                  <div className={`border p-4 rounded-lg flex items-center gap-3 shadow-xs transition-colors duration-250 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="p-2.5 bg-emerald-50 text-[#028A60] rounded border border-emerald-100 dark:border-emerald-930/30">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Grade Standing</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} font-serif italic`}>{stats.grade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics logs passed */}
                  <div className={`border p-4 rounded-lg flex items-center gap-3 shadow-xs transition-colors duration-250 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="p-2.5 bg-emerald-50 text-[#028A60] rounded border border-emerald-100 dark:border-emerald-930/30">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Tests Passed Rating</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-[#028A60]'}`}>{stats.testPassed}</span>
                        <span className="text-xs text-slate-500 font-mono">Passed / {stats.testFailed} Remedial</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 4.5 RECENTLY ATTEMPTED EVALUATIONS SECTION */}
                <div className={`p-5 rounded-lg border transition-all duration-350 ${
                  isDarkMode 
                    ? 'bg-[#131929] border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className={`text-sm font-serif italic font-black flex items-center gap-2 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      <FileCheck2 className="w-5 h-5 text-[#028A60]" />
                      Recently Attempted Assessments
                    </h3>
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-[#028A60]/10 text-[#028A60] rounded border border-[#028A60]/20">
                      Recent Grade Book Logs
                    </span>
                  </div>

                  {(() => {
                    const attemptsList: Array<ExamMark & { subjectName: string }> = [];
                    activeStudent.marksBySubject.forEach((sub) => {
                      sub.exams.forEach((ex) => {
                        if (ex.obtainedScore !== undefined) {
                          attemptsList.push({
                            ...ex,
                            subjectName: sub.subject
                          });
                        }
                      });
                    });

                    // Sort by dateEntered (descending), fallback to order
                    const sortedAttempts = attemptsList.sort((a, b) => {
                      const dA = a.dateEntered || '0000-00-00';
                      const dB = b.dateEntered || '0000-00-00';
                      return dB.localeCompare(dA);
                    }).slice(0, 4);

                    if (sortedAttempts.length === 0) {
                      return (
                        <div className={`p-8 text-center text-xs italic ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        } font-serif rounded border border-dashed ${
                          isDarkMode ? 'border-slate-800' : 'border-slate-200'
                        }`}>
                          No evaluation scores have been recorded in your workspace yet.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedAttempts.map((attempt, exId) => {
                          const passed = attempt.obtainedScore! >= attempt.passScore;
                          return (
                            <div 
                              id={`recent-attempt-${exId}`} 
                              key={exId} 
                              className={`p-4 border rounded transition-all duration-200 hover:scale-[1.01] ${
                                isDarkMode 
                                  ? 'bg-[#182035] border-slate-800 hover:border-slate-700' 
                                  : 'bg-slate-50 border-slate-200 hover:border-slate-350'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="px-2 py-0.5 rounded text-[8px] tracking-wide uppercase font-mono font-black bg-[#028A60]/10 text-[#028A60] border border-[#028A60]/20">
                                    {attempt.subjectName}
                                  </span>
                                  <h4 className={`text-xs font-serif italic font-bold mt-1.5 ${
                                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                                  }`}>
                                    {attempt.examType}
                                  </h4>
                                </div>
                                <span className={`text-[9px] font-mono font-bold uppercase rounded py-0.5 px-1.5 ${
                                  passed 
                                    ? 'bg-[#028A60]/10 text-[#028A60] border border-[#028A60]/20' 
                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}>
                                  {passed ? 'Passed ✓' : 'Remedial ⚠'}
                                </span>
                              </div>

                              <div className="mt-3 flex items-baseline justify-between flex-wrap gap-2">
                                <div className="flex items-baseline gap-1">
                                  <span className={`text-lg font-bold font-mono ${
                                    isDarkMode ? 'text-white' : 'text-slate-800'
                                  }`}>
                                    {attempt.obtainedScore}
                                  </span>
                                  <span className={`text-[10px] font-mono ${
                                    isDarkMode ? 'text-slate-500' : 'text-slate-450'
                                  }`}>
                                    /{attempt.totalScore}
                                  </span>
                                  <span className={`text-[9px] font-mono ml-2 py-0.2 px-1 bg-slate-150 rounded border dark:border-slate-800 dark:bg-slate-900 ${
                                    isDarkMode ? 'text-slate-450' : 'text-slate-550'
                                  }`}>
                                    Pass: {attempt.passScore}
                                  </span>
                                </div>

                                {attempt.dateEntered && (
                                  <span className="text-[9px] font-mono text-slate-400">
                                    Graded: {attempt.dateEntered}
                                  </span>
                                )}
                              </div>

                              {attempt.remarks && (
                                <p className={`mt-2 text-[11px] leading-relaxed font-serif italic p-2 rounded border ${
                                  isDarkMode 
                                    ? 'bg-slate-950 text-slate-400 border-slate-900' 
                                    : 'bg-white text-slate-500 border-slate-150'
                                }`}>
                                  "{attempt.remarks}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Subject Expandable detailed breakdown */}
                <div className="space-y-4">
                  {activeStudent.marksBySubject.length === 0 ? (
                    <div className={`p-8 text-center text-xs italic rounded shadow-xs border ${
                      isDarkMode ? 'bg-[#131929] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-450'
                    }`}>
                      No subjects are registered inside your candidate folio yet. Consult the administration.
                    </div>
                  ) : (
                    activeStudent.marksBySubject.map((sub, sIdx) => (
                      <div id={`student-sub-block-${sIdx}`} key={sIdx} className={`rounded-lg overflow-hidden shadow-xs border transition-colors duration-205 ${
                        isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        
                        <div className={`px-5 py-3 border-b flex justify-between items-center transition-colors duration-205 ${
                          isDarkMode ? 'bg-[#182033] border-slate-800' : 'bg-slate-50 border-slate-202'
                        }`}>
                          <h3 className={`font-serif italic text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{sub.subject}</h3>
                          <span className={`text-[10px] border px-2 py-0.5 rounded font-mono transition-colors duration-205 ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-202 text-slate-500'
                          }`}>
                            Enrolled Course
                          </span>
                        </div>

                        <div className="p-4 space-y-4">
                          {/* The 5 standard exams listed */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {sub.exams.map((ex, exIdx) => {
                              const scoreSet = ex.obtainedScore !== undefined;
                              const passed = scoreSet && ex.obtainedScore! >= ex.passScore;
                              
                              return (
                                <div id={`ex-block-${sIdx}-${exIdx}`} key={exIdx} className={`border rounded p-3 text-center space-y-1 relative shadow-2xs transition-colors duration-205 ${
                                  isDarkMode ? 'bg-[#182033]/85 border-slate-800' : 'bg-slate-50 border-slate-200'
                                }`}>
                                  {/* Badge passed/failed */}
                                  {scoreSet ? (
                                    <span className={`absolute top-2 right-2 rounded-full w-2 h-2 ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`} title={passed ? 'Passed' : 'Needs attention'} />
                                  ) : null}

                                  <span className={`block text-[10px] font-mono tracking-tight font-bold ${
                                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                  }`}>{ex.examType}</span>
                                  
                                  <div className="py-1">
                                    {scoreSet ? (
                                      <div className="flex items-baseline justify-center font-mono">
                                        <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{ex.obtainedScore}</span>
                                        <span className="text-xs text-slate-505">/{ex.totalScore}</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic block font-mono py-1">Pending</span>
                                    )}
                                  </div>

                                  <div className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center justify-center gap-1 border transition-colors duration-205 ${
                                    isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    <span>Pass: {ex.passScore}</span>
                                  </div>

                                  {scoreSet && (
                                    <span className={`block text-[9px] font-bold ${passed ? 'text-emerald-500 font-extrabold' : 'text-rose-500 font-extrabold'}`}>
                                      {passed ? 'Passed ✓' : 'Remedial ⚠'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Specific subject note remarks */}
                          {sub.exams.some(ex => ex.remarks) ? (
                            <div className={`p-2.5 rounded text-xs italic font-serif flex flex-col gap-1 border transition-colors duration-205 ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-405' : 'bg-slate-50 border-slate-150 text-slate-500'
                            }`}>
                              <span className={`font-sans text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#02A875]' : 'text-[#028A60]'}`}>📌 Subject Exam Remarks:</span>
                              <div className="space-y-1">
                                {sub.exams.filter(ex => ex.remarks).map(ex => (
                                  <p key={ex.examType} className="text-[11px] leading-relaxed">
                                    <strong className={`font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{ex.examType}:</strong> "{ex.remarks}"
                                  </p>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>

                      </div>
                    ))
                  )}
                </div>

                {/* Overall comments by Administrator / Home room teacher */}
                {activeStudent.generalRemarks && (
                  <div className={`p-5 rounded-lg space-y-2 shadow-xs border transition-colors duration-205 ${
                    isDarkMode ? 'bg-[#131929] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-805'
                  }`}>
                    <h3 className={`font-serif italic text-xs uppercase tracking-wider font-bold ${
                      isDarkMode ? 'text-[#02A875]' : 'text-[#028A60]'
                    }`}>Comprehensive Tutor Appraisals & Development Report:</h3>
                    <p className={`text-xs p-4 rounded border-l-4 font-serif italic border transition-colors duration-205 ${
                      isDarkMode 
                        ? 'bg-[#182035] text-slate-350 border-slate-800 border-l-emerald-500' 
                        : 'bg-slate-50 text-slate-650 border-slate-200 border-l-[#028A60]'
                    }`}>
                      "{activeStudent.generalRemarks}"
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* ATTENDANCE TAB */}
            {activePortalTab === 'attendance' && (
              <div className="space-y-6">
                
                <div className={`p-6 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-200 shadow-xs border ${
                  isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <h2 className={`text-xl font-serif italic flex items-center gap-2 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      <Calendar className="w-5 h-5 text-[#028A60]" />
                      Attendance Register History
                    </h2>
                    <p className={`text-xs font-serif ${isDarkMode ? 'text-slate-401' : 'text-slate-500'}`}>Inspect classroom logs and required minimum presence standing (80%).</p>
                  </div>

                  <div className={`px-4 py-2 border rounded flex items-center gap-2 shadow-2xs transition-colors duration-200 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-[#028A60]" />
                    <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Current Attendance: {attendancePercentage}%</span>
                  </div>
                </div>

                {/* Statistics Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`p-4 rounded text-center shadow-xs border transition-colors duration-200 ${
                    isDarkMode ? 'bg-[#131929] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
                  }`}>
                    <span className={`text-[9px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Evaluated Days</span>
                    <span className={`text-lg font-bold mt-1 block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{activeStudent.attendance.length}</span>
                  </div>

                  <div className={`p-4 rounded text-center shadow-xs border transition-colors duration-200 ${
                    isDarkMode ? 'bg-[#131929] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
                  }`}>
                    <span className={`text-[9px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Present Standing</span>
                    <span className="text-lg font-bold text-emerald-500 mt-1 block">
                      {activeStudent.attendance.filter(r => r.status === 'Present').length}
                    </span>
                  </div>

                  <div className={`p-4 rounded text-center shadow-xs border transition-colors duration-200 ${
                    isDarkMode ? 'bg-[#131929] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
                  }`}>
                    <span className={`text-[9px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Late Arrivals</span>
                    <span className="text-lg font-bold text-amber-500 mt-1 block">
                      {activeStudent.attendance.filter(r => r.status === 'Late').length}
                    </span>
                  </div>

                  <div className={`p-4 rounded text-center shadow-xs border transition-colors duration-200 ${
                    isDarkMode ? 'bg-[#131929] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
                  }`}>
                    <span className={`text-[9px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Absent Marksheets</span>
                    <span className="text-lg font-bold text-rose-500 mt-1 block">
                      {activeStudent.attendance.filter(r => r.status === 'Absent').length}
                    </span>
                  </div>
                </div>

                {/* Log Record Checklist Table */}
                <div className={`rounded-lg overflow-hidden border shadow-xs transition-colors duration-200 ${
                  isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-5 py-3 border-b text-[10px] font-bold uppercase tracking-widest font-mono transition-colors duration-200 ${
                    isDarkMode ? 'bg-[#182033] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-202 text-slate-500'
                  }`}>
                    Class Attendance Ledger Entries
                  </div>

                  {activeStudent.attendance.length === 0 ? (
                    <div className={`p-8 text-center text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-450'}`}>No attendance records found yet.</div>
                  ) : (
                    <div className={`divide-y transition-colors duration-200 ${
                      isDarkMode ? 'divide-slate-800 bg-[#131929]' : 'divide-slate-105 bg-white'
                    }`}>
                      {activeStudent.attendance.map((record, i) => (
                        <div key={i} className={`px-5 py-3.5 flex items-center justify-between transition-colors duration-205 leading-none text-xs ${
                          isDarkMode ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#028A60] shrink-0" />
                            <span className={`font-mono ${isDarkMode ? 'text-slate-350' : 'text-slate-800'}`}>{record.date}</span>
                          </div>
                          
                          <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-colors duration-200 ${
                            record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' :
                            record.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border-amber-500/15' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/15'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* STUDY MATERIALS DOWNLOAD HUB */}
            {activePortalTab === 'study_materials' && (
              <div className="space-y-6">
                
                <div className={`p-6 rounded-lg shadow-xs border transition-colors duration-200 ${
                  isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h2 className={`text-xl font-serif italic flex items-center gap-2 ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    <Download className="w-5 h-5 text-[#028A60]" />
                    Coaching Material Desk & Worksheets
                  </h2>
                  <p className={`text-xs font-serif mt-1 ${isDarkMode ? 'text-slate-401' : 'text-slate-500'}`}>Download reference books, formula worksheets, and papers matching your registered courses.</p>
                </div>

                <div className="space-y-3">
                  {filteredMaterials.length === 0 ? (
                    <div className={`p-12 text-center rounded-lg space-y-2 shadow-xs border transition-colors duration-200 ${
                      isDarkMode ? 'bg-[#131929] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-450'
                    }`}>
                      <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                      <h4 className="font-serif italic text-slate-800 text-sm">No Material Entries Loaded</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto font-mono">No study packages match your course roster or class grade presently. Administrative uploads will render here.</p>
                    </div>
                  ) : (
                    filteredMaterials.map((material) => (
                      <div id={`material-file-row-${material.id}`} key={material.id} className={`p-4 rounded-lg flex items-center justify-between gap-4 border transition-colors duration-200 shadow-xs hover:border-[#028A60]/50 ${
                        isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        
                        <div className="space-y-1 min-w-0">
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className={`text-[9px] font-mono font-bold uppercase border px-2 py-0.5 rounded leading-none select-none ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-[#02A875]' : 'bg-slate-100 border-slate-202 text-[#028A60]'
                            }`}>
                              {material.subject}
                            </span>
                            <span className={`text-[9px] font-mono select-none ${isDarkMode ? 'text-slate-450' : 'text-slate-400'}`}>Class: {material.gradeClass}</span>
                          </div>

                          <h4 className={`font-serif italic text-sm font-semibold truncate ${
                            isDarkMode ? 'text-slate-200' : 'text-[#2c3e50] text-[#1c2336]'
                          }`} title={material.title}>
                            {material.title}
                          </h4>
                          
                          <p className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            File: <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{material.fileName}</span> ({material.fileSize})
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                          <button
                            onClick={() => setPreviewMaterial(material)}
                            className={`py-2 px-3 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs leading-none ${
                              isDarkMode 
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            See PDF
                          </button>

                          <button
                            onClick={() => handleTriggerMockDownload(material)}
                            disabled={downloadingId === material.id}
                            className={`py-2 px-4 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs leading-none ${
                              downloadingId === material.id
                                ? isDarkMode ? 'bg-slate-900 text-slate-500 border border-slate-850' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                : 'bg-[#028A60] hover:bg-[#02A875] text-white'
                            }`}
                          >
                            {downloadingId === material.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Obtaining...
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                Download File
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* SECURITY/PASSWORD TAB (Student self generation) */}
            {activePortalTab === 'security' && (
              <div className="space-y-6">
                
                <div className={`p-6 rounded-lg border shadow-xs transition-colors duration-200 ${
                  isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h2 className={`text-xl font-serif italic flex items-center gap-2 ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    <Key className="w-5 h-5 text-[#028A60]" />
                    Candidate Credentials self Generation
                  </h2>
                  <p className={`text-xs font-serif mt-1 ${isDarkMode ? 'text-slate-401' : 'text-slate-500'}`}>Change your profile access password or automatically generate a secure randomized password code.</p>
                </div>

                <form onSubmit={handleApplyPasswordChange} className={`p-6 rounded-lg border space-y-4 max-w-md transition-colors duration-200 shadow-xs ${
                  isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  
                  {securitySuccess && (
                    <div id="security-session-feedback" className={`p-3 border text-xs font-bold rounded transition-colors duration-200 ${
                      isDarkMode ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-205 text-[#028A60]'
                    }`}>
                      {securitySuccess}
                    </div>
                  )}

                  <div className={`p-3 border text-xs space-y-1 rounded mb-2 shadow-2xs transition-colors duration-200 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`block font-bold text-[10px] font-mono uppercase ${isDarkMode ? 'text-[#02A875]' : 'text-[#028A60]'}`}>🔑 Current Account Details</span>
                    <p className={`leading-normal ${isDarkMode ? 'text-slate-350' : 'text-slate-600'}`}>
                      ID Number: <strong className={`font-mono ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{activeStudent.id}</strong><br/>
                      Default Username: <strong className={`font-mono ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{activeStudent.username}</strong><br/>
                      Current Password Code: <strong className={`font-mono ${isDarkMode ? 'text-[#02A875]' : 'text-emerald-800'}`}>{activeStudent.password}</strong>
                    </p>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>New Password Code:</label>
                    <input 
                      type="text"
                      required
                      placeholder="Type custom secret key..."
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setSecuritySuccess('');
                      }}
                      className={`w-full border rounded py-2 px-3 text-xs focus:outline-none focus:border-[#028A60] shadow-2xs transition-colors duration-200 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>Confirm Password Code:</label>
                    <input 
                      type="text"
                      required
                      placeholder="Verify custom secret key..."
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setSecuritySuccess('');
                      }}
                      className={`w-full border rounded py-2 px-3 text-xs focus:outline-none focus:border-[#028A60] shadow-2xs transition-colors duration-200 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    <button
                      type="submit"
                      className="py-2 px-4 bg-[#028A60] hover:bg-[#02A875] text-white text-xs font-mono font-bold uppercase rounded cursor-pointer transition-colors shadow-2xs animate-fade-in"
                    >
                      Apply Password Update
                    </button>

                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className={`py-2 px-4 bg-transparent border rounded cursor-pointer transition-colors shadow-2xs text-xs font-mono font-bold uppercase ${
                        isDarkMode 
                          ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-205'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Generate Secure Key
                    </button>
                  </div>

                  <p className={`text-[10px] font-mono leading-normal pt-2 ${isDarkMode ? 'text-slate-450' : 'text-slate-500'}`}>
                    * Once changed, your credentials are saved to local persistent lockers. Make sure to record it safely before signing out of your tablet device.
                  </p>

                </form>

              </div>
            )}

            {/* ACADEMY NOTICES TAB (Notice board is visible to students) */}
            {activePortalTab === 'notices' && (
              <div className="space-y-6">
                
                <div className={`p-6 rounded-lg border shadow-xs transition-colors duration-200 ${
                  isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h2 className={`text-xl font-serif italic flex items-center gap-2 ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    <Megaphone className="w-5 h-5 text-[#028A60]" />
                    Official Academy Gazetted Notices
                  </h2>
                  <p className={`text-xs font-serif mt-1 ${isDarkMode ? 'text-slate-401' : 'text-slate-500'}`}>Official updates, holiday alerts, test schedules or events broadcasted direct from DNA Administration register.</p>
                </div>

                <div className="space-y-4">
                  {announcements.filter(a => a.active).length === 0 ? (
                    <div className={`p-12 text-center rounded-lg border font-serif italic text-xs ${
                      isDarkMode ? 'bg-[#131929] border-slate-800 text-slate-450' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      No active announcement notices on the physical bulletin board. Check back later!
                    </div>
                  ) : (
                    announcements.filter(a => a.active).map(ann => (
                      <div 
                        key={ann.id} 
                        className={`p-5 rounded-lg border transition-all space-y-2.5 ${
                          isDarkMode 
                            ? 'bg-[#131929] border-slate-800 hover:border-[#028A60]/40' 
                            : 'bg-white border-slate-200 hover:border-[#028A60]/40'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 select-none">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded ${
                              ann.priority === 'high' 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                : ann.priority === 'medium' 
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                  : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                            }`}>
                              {ann.priority} Priority
                            </span>
                            <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded ${
                              isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'
                            }`}>
                              {ann.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-450">Issued: {ann.date}</span>
                        </div>

                        <h3 className={`font-serif italic font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>
                          {ann.title}
                        </h3>

                        <p className={`text-xs leading-relaxed whitespace-pre-wrap font-serif ${isDarkMode ? 'text-slate-350' : 'text-slate-600'}`}>
                          {ann.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* REPLICA BLOCK FOR TRANSCRIPT PRINT ONLY */}
      <div className="hidden">
        <div ref={printAreaRef}>
          {/* Managed by dynamic inline generator above */}
        </div>
      </div>

      {/* Real-time PDF Viewer Lightbox / Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`w-full max-w-4xl h-[85vh] flex flex-col rounded-lg border shadow-2xl overflow-hidden transition-colors duration-200 ${
            isDarkMode ? 'bg-[#0f1422] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-4 flex items-center justify-between border-b transition-colors duration-200 ${
              isDarkMode ? 'border-slate-800 bg-[#141a2c]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="space-y-0.5">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className={`text-[9px] font-mono font-bold uppercase border px-2 py-0.5 rounded leading-none select-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-[#02A875]' : 'bg-slate-100 border-slate-202 text-[#028A60]'
                  }`}>
                    {previewMaterial.subject}
                  </span>
                  <span className={`text-[9px] font-mono select-none ${isDarkMode ? 'text-slate-450' : 'text-slate-400'}`}>
                    Grade: {previewMaterial.gradeClass}
                  </span>
                </div>
                <h3 className="font-serif italic font-bold text-sm truncate max-w-xs sm:max-w-md md:max-w-2xl" title={previewMaterial.title}>
                  {previewMaterial.title}
                </h3>
              </div>
              
              <button 
                onClick={() => setPreviewMaterial(null)}
                className={`py-1 px-3 rounded font-mono text-xs font-bold uppercase border transition-colors cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-350 hover:text-white' 
                    : 'border-slate-300 hover:bg-slate-100 text-slate-650 hover:text-slate-850'
                }`}
                title="Close Viewer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body: Active PDF Frame */}
            <div className="flex-1 bg-[#0b0e17] p-2 relative flex items-center justify-center min-h-0">
              {previewMaterial.downloadUrl && previewMaterial.downloadUrl !== '#' ? (
                <object
                  data={previewMaterial.downloadUrl}
                  type="application/pdf"
                  className="w-full h-full rounded border-0"
                >
                  <iframe 
                    src={previewMaterial.downloadUrl} 
                    className="w-full h-full rounded border-0 bg-white" 
                    title="PDF Reader Frame"
                  />
                </object>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <FileText className="w-11 h-11 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-xs font-serif italic text-slate-400">Loading document streams...</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-3.5 flex items-center justify-between border-t text-[10px] font-mono transition-colors duration-200 ${
              isDarkMode ? 'border-slate-800 bg-[#131929] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}>
              <span className="truncate max-w-sm sm:max-w-md">File: {previewMaterial.fileName} ({previewMaterial.fileSize})</span>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewMaterial.downloadUrl;
                  link.download = previewMaterial.fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="py-1.5 px-3 bg-[#028A60] hover:bg-[#02A875] text-white font-bold rounded cursor-pointer transition-colors text-[10px]"
              >
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Dynamic Feedback Toast for Sandbox Printer Status */}
      {printStatusText && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm border p-4 rounded-lg shadow-xl animate-fade-in flex flex-col gap-2 transition-colors duration-200 ${
          isDarkMode ? 'bg-[#182035] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-1.5">
            <span className={`block text-[10px] font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#02A875]' : 'text-[#028A60]'}`}>🖨️ Document Printing</span>
            <button 
              onClick={() => setPrintStatusText('')}
              className={`font-mono text-xs cursor-pointer font-bold shrink-0 transition-colors ${
                isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Close Notification"
            >
              ✕
            </button>
          </div>
          <p className={`text-xs leading-relaxed font-serif italic ${isDarkMode ? 'text-slate-350' : 'text-slate-600'}`}>
            "{printStatusText}"
          </p>
          <div className="flex justify-end pt-1">
            <button 
              onClick={() => setPrintStatusText('')}
              className={`text-[10px] font-mono uppercase px-2 py-1 rounded cursor-pointer leading-normal font-bold border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-650 border-slate-200'
              }`}
            >
              Dismiss Status
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
