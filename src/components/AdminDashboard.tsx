import React, { useState } from 'react';
import { Student, Teacher, ExamMark, SubjectMark, Announcement } from '../types';
import { CLASS_PRESETS, DEFAULT_SUBJECTS } from '../data/seedData';
import { 
  Building,
  UserPlus, 
  Trash2, 
  Save, 
  Settings, 
  GraduationCap, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Plus, 
  Check, 
  X,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  BookOpen,
  Eye,
  EyeOff,
  Briefcase,
  Sliders,
  Sparkles,
  Users,
  AlertCircle,
  Megaphone
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  teachers: Teacher[];
  onUpdateTeachers: (updated: Teacher[]) => void;
  announcements: Announcement[];
  onUpdateAnnouncements: (updated: Announcement[]) => void;
}

export default function AdminDashboard({
  students,
  onUpdateStudents,
  teachers,
  onUpdateTeachers,
  announcements,
  onUpdateAnnouncements
}: AdminDashboardProps) {

  // Login authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [pwdVisible, setPwdVisible] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Active sub tab inside Admin Console
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'withhold_control' | 'students_enrolment' | 'subjects_customizer' | 'teachers_management' | 'notice_board'>('withhold_control');

  // Notice board (announcements) states in Admin panel
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [annCategory, setAnnCategory] = useState<'Academics' | 'Events' | 'Holiday' | 'Sports' | 'General'>('General');
  const [annDate, setAnnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);

  // Add new student form states
  const [enrollNo, setEnrollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [customUsername, setCustomUsername] = useState('');
  const [initialPassword, setInitialPassword] = useState('password123');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([...DEFAULT_SUBJECTS]);
  const [extraSubjectInput, setExtraSubjectInput] = useState('');
  const [enrolmentFeedback, setEnrolmentFeedback] = useState('');

  // Course customizer filter helper
  const [chosenSubjectStudentId, setChosenSubjectStudentId] = useState<string | null>(null);
  const [newCourseCustomInput, setNewCourseCustomInput] = useState('');

  // Add new teacher form states
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('teacher123');
  const [teacherFeedback, setTeacherFeedback] = useState('');

  // Change existing student username/credentials overlay
  const [editingCredsStudentId, setEditingCredsStudentId] = useState<string | null>(null);
  const [editingStudentUsername, setEditingStudentUsername] = useState('');
  const [editingStudentPassword, setEditingStudentPassword] = useState('');

  // Classwise withhold selector help
  const [bulkClassTarget, setBulkClassTarget] = useState('Class 10');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (adminUsername.trim().toLowerCase() === 'admin' && adminPassword.trim() === 'aatish@2111') {
      setIsAdminAuthenticated(true);
      setErrorText('');
    } else {
      setErrorText('Invalid admin credentials. Access Denied.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
  };

  // Helper blanks
  const createBlankExamsTemplate = (): ExamMark[] => {
    return [
      { examType: 'Self Evaluation Test', totalScore: 25, passScore: 10 },
      { examType: 'Weekly Test', totalScore: 25, passScore: 10 },
      { examType: 'Monthly Test', totalScore: 40, passScore: 18 },
      { examType: 'Terminal', totalScore: 50, passScore: 20 },
      { examType: 'Scholarship Exam', totalScore: 75, passScore: 30 }
    ];
  };

  // 1. ADD NEW STUDENT
  const handleEnrollStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolmentFeedback('');

    if (!enrollNo.trim() || !studentName.trim() || !customUsername.trim()) {
      setEnrolmentFeedback('ERROR: All red-marked parameters are required!');
      return;
    }

    const trimmedEnroll = enrollNo.trim().toUpperCase();
    if (students.some(s => s.id === trimmedEnroll)) {
      setEnrolmentFeedback('ERROR: Student Registration Enrollment No already active.');
      return;
    }

    const trimmedUser = customUsername.trim().toLowerCase();
    if (students.some(s => s.username === trimmedUser)) {
      setEnrolmentFeedback('ERROR: Custom Username already allocated to another candidate.');
      return;
    }

    // Map subjects checked to SubjectMark arrays
    const finalMarksBySubject: SubjectMark[] = selectedSubjects.map(subName => ({
      subject: subName,
      exams: createBlankExamsTemplate()
    }));

    const newStudent: Student = {
      id: trimmedEnroll,
      username: trimmedUser,
      name: studentName.trim(),
      gradeClass: studentClass,
      password: initialPassword.trim() || 'password123',
      subjects: [...selectedSubjects],
      marksBySubject: finalMarksBySubject,
      attendance: [
        { date: new Date().toISOString().split('T')[0], status: 'Present' }
      ],
      isResultWithheld: false,
      generalRemarks: 'Candidate enrolled on DNA ledger.'
    };

    onUpdateStudents([...students, newStudent]);
    setEnrollNo('');
    setStudentName('');
    setCustomUsername('');
    setInitialPassword('password123');
    setSelectedSubjects([...DEFAULT_SUBJECTS]);
    setEnrolmentFeedback(`SUCCESS: Candidate Profile for ${newStudent.name} is online!`);
  };

  const handleAddCheckboxSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleAddExtraConceptSubject = () => {
    const raw = extraSubjectInput.trim();
    if (!raw) return;
    if (selectedSubjects.includes(raw)) return;
    setSelectedSubjects([...selectedSubjects, raw]);
    setExtraSubjectInput('');
  };

  // 2. COURSE CUSTOMIZER: ADD OR REMOVE SUBJECTS RETROACTIVELY
  const selectedCourseStudent = students.find(s => s.id === chosenSubjectStudentId) || null;

  const handleAddRetroSubject = () => {
    if (!chosenSubjectStudentId || !newCourseCustomInput.trim()) return;
    const student = students.find(s => s.id === chosenSubjectStudentId);
    if (!student) return;

    const rawSub = newCourseCustomInput.trim();
    if (student.subjects.map(s => s.toLowerCase()).includes(rawSub.toLowerCase())) {
      alert('This subject is already listed on this student course roster!');
      return;
    }

    const updated = students.map(s => {
      if (s.id === chosenSubjectStudentId) {
        // Construct new entry with empty marks sheet
        const subjectEntry: SubjectMark = {
          subject: rawSub,
          exams: createBlankExamsTemplate()
        };
        return {
          ...s,
          subjects: [...s.subjects, rawSub],
          marksBySubject: [...s.marksBySubject, subjectEntry]
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setNewCourseCustomInput('');
  };

  const handleRemoveRetroSubject = (subName: string) => {
    if (!chosenSubjectStudentId) return;
    if (confirm(`Are you sure you want to drop course "${subName}" from this pupil? Evaluation marks for this class will be cleared!`)) {
      const updated = students.map(s => {
        if (s.id === chosenSubjectStudentId) {
          return {
            ...s,
            subjects: s.subjects.filter(sub => sub !== subName),
            marksBySubject: s.marksBySubject.filter(sm => sm.subject !== subName)
          };
        }
        return s;
      });
      onUpdateStudents(updated);
    }
  };

  // 3. WITHHOLD & PUBLICATION DESK CONTROLS
  const handleToggleSingleWithhold = (id: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return {
          ...s,
          isResultWithheld: !s.isResultWithheld
        };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  const handleBulkClassroomWithhold = (withhold: boolean) => {
    const updated = students.map(s => {
      if (s.gradeClass === bulkClassTarget) {
        return {
          ...s,
          isResultWithheld: withhold
        };
      }
      return s;
    });
    onUpdateStudents(updated);
    alert(`Bulk Operation: All student marks sheets for ${bulkClassTarget} changed to: ${withhold ? 'WITHHELD' : 'PUBLISHED'}.`);
  };

  // Delete student completely
  const handleDeleteStudent = (id: string) => {
    if (confirm('AUTHORIZATION ALERT: Delete this student enrollment folder permanently? All marksheets, attendance registers, and credentials will be dropped!')) {
      onUpdateStudents(students.filter(s => s.id !== id));
      if (chosenSubjectStudentId === id) setChosenSubjectStudentId(null);
    }
  };

  // 4. TEACHERS ACCOUNTS MANAGEMENT
  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherFeedback('');

    if (!newTeacherName.trim() || !newTeacherUsername.trim()) {
      setTeacherFeedback('ERROR: Name and instructor usernames are required parameters!');
      return;
    }

    const trimmedUser = newTeacherUsername.trim().toLowerCase();
    if (teachers.some(t => t.username === trimmedUser)) {
      setTeacherFeedback('ERROR: This instructor username is already allocated.');
      return;
    }

    const tId = `TCH-${Date.now().toString().slice(-4)}`;
    const newTch: Teacher = {
      id: tId,
      name: newTeacherName.trim(),
      username: trimmedUser,
      password: newTeacherPassword.trim() || 'teacher123'
    };

    onUpdateTeachers([...teachers, newTch]);
    setNewTeacherName('');
    setNewTeacherUsername('');
    setNewTeacherPassword('teacher123');
    setTeacherFeedback(`SUCCESS: Master Instructor profile registered for ${newTch.name}!`);
  };

  const handleDeleteTeacher = (id: string) => {
    if (teachers.length <= 1) {
      alert('ERROR: Cannot remove the last instructor. School requires active administrators.');
      return;
    }
    if (confirm('Verify deletion? Dropping teacher accounts stops their login abilities.')) {
      onUpdateTeachers(teachers.filter(t => t.id !== id));
    }
  };

  // 5. ANNOUNCEMENT NOTICE BOARD HANDLERS
  const handleCreateAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert("Please provide the Notice Title and Content body description.");
      return;
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
      category: annCategory,
      date: annDate,
      active: true
    };

    onUpdateAnnouncements([newAnn, ...announcements]);
    setShowAddAnnModal(false);

    // Reset fields
    setAnnTitle('');
    setAnnContent('');
    setAnnPriority('medium');
    setAnnCategory('General');
  };

  const handleToggleAnnouncementActive = (id: string) => {
    onUpdateAnnouncements(announcements.map(ann => {
      if (ann.id === id) return { ...ann, active: !ann.active };
      return ann;
    }));
  };

  const handleDeleteAnnouncement = (id: string) => {
    onUpdateAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  // Save student modifications for credential adjustments
  const handleSaveStudentCredentialsOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCredsStudentId) return;

    if (!editingStudentUsername.trim()) {
      alert('Username cannot be blank.');
      return;
    }

    // Check duplicate username
    const exists = students.some(s => s.id !== editingCredsStudentId && s.username.toLowerCase() === editingStudentUsername.trim().toLowerCase());
    if (exists) {
      alert('This username is already allocated to another student candidate.');
      return;
    }

    const updated = students.map(s => {
      if (s.id === editingCredsStudentId) {
        return {
          ...s,
          username: editingStudentUsername.trim().toLowerCase(),
          password: editingStudentPassword.trim() || s.password
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setEditingCredsStudentId(null);
  };

  const handleOpenCredentialsEditor = (student: Student) => {
    setEditingCredsStudentId(student.id);
    setEditingStudentUsername(student.username);
    setEditingStudentPassword(student.password);
  };

  if (!isAdminAuthenticated) {
    return (
      <div id="admin-login-viewport" className="max-w-md mx-auto my-12 bg-[#0E0E0E] border border-red-950/40 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 bg-[#151515] text-center border-b border-red-950/20">
          <div className="w-14 h-14 bg-[#0A0A0A] border border-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#028A60]" />
          </div>
          <h3 className="text-xl font-serif text-white italic">Administrative Command gate</h3>
          <p className="text-xs text-amber-500 font-mono tracking-widest mt-1">DNA Secure Console Gateway</p>
        </div>

        <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
          {errorText && (
            <div id="admin-auth-failure" className="p-3 bg-red-950/20 border border-red-900 rounded text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Administrative Logon Username:</label>
            <input 
              type="text"
              required
              placeholder="e.g. admin"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full bg-[#070707] border border-[#222] rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-[#028A60] font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Central Security Passphrase Code:</label>
            <div className="relative">
              <input 
                type={pwdVisible ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-[#070707] border border-[#222] rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-[#028A60] font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setPwdVisible(!pwdVisible)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-white"
              >
                {pwdVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-widest rounded transition-colors font-mono cursor-pointer"
          >
            Authenticate Admin Credentials
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-4" id="admin-control-desk">
      
      {/* Upper Tab Control selectors */}
      <div className="bg-[#0D0D0D] p-2 border border-[#1A1A1A] rounded-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveAdminSubTab('withhold_control')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminSubTab === 'withhold_control' ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded' : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Result Publication Controller
          </button>

          <button
            onClick={() => setActiveAdminSubTab('students_enrolment')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminSubTab === 'students_enrolment' ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded' : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Admissions Enrollment
          </button>

          <button
            onClick={() => setActiveAdminSubTab('subjects_customizer')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminSubTab === 'subjects_customizer' ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded' : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Subject Customizer
          </button>

          <button
            onClick={() => setActiveAdminSubTab('teachers_management')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminSubTab === 'teachers_management' ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded' : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Users className="w-4 h-4" />
            Teacher Roster Portal
          </button>

          <button
            onClick={() => setActiveAdminSubTab('notice_board')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminSubTab === 'notice_board' ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded' : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Notice Board Control
          </button>
        </div>

        <button
          onClick={handleAdminLogout}
          className="py-1 px-3 bg-[#111] hover:bg-[#222] border border-[#222] hover:border-amber-900/50 hover:text-amber-500 text-gray-400 rounded text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap"
        >
          Exit Admin Console
        </button>
      </div>

      {/* 1. RESULT WITHHOLDING / BULK CONTROLLER SHEET */}
      {activeAdminSubTab === 'withhold_control' && (
        <div className="space-y-6">
          
          {/* Master quick info banner */}
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-serif italic text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#028A60]" />
                Authorized Grade Release & Ledger Settings Desk
              </h3>
              <p className="text-xs text-gray-400">Lock, withhold, or immediately broadcast student report card sheets.</p>
            </div>

            <div className="flex gap-2 text-xs font-mono select-none">
              <span className="px-3 py-1 bg-[#028A60]/10 text-[#028A60] border border-[#028A60]/20 rounded font-bold">
                Published: {students.filter(s => !s.isResultWithheld).length}
              </span>
              <span className="px-3 py-1 bg-red-950/20 text-red-400 border border-red-900/40 rounded font-bold">
                Withheld: {students.filter(s => s.isResultWithheld).length}
              </span>
            </div>
          </div>

          {/* Bulk release widget */}
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">Bulk Class Grade Releases Controller:</h4>
                <p className="text-[10px] text-gray-500">Enable or block grades for select classes globally in single-click actions.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={bulkClassTarget}
                onChange={(e) => setBulkClassTarget(e.target.value)}
                className="bg-[#050505] border border-[#222] py-1 px-2.5 text-xs text-white"
              >
                {CLASS_PRESETS.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleBulkClassroomWithhold(false)}
                className="py-1 px-3.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-mono text-[10px] font-bold uppercase rounded cursor-pointer leading-loose"
              >
                Publish All results
              </button>

              <button
                type="button"
                onClick={() => handleBulkClassroomWithhold(true)}
                className="py-1 px-3.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/40 font-mono text-[10px] font-bold uppercase rounded cursor-pointer leading-loose"
              >
                Withhold All results
              </button>
            </div>
          </div>

          {/* Detailed ledger roster */}
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1A1A1A] bg-[#141414] text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
              Independent student evaluation dossiers releasing indices
            </div>

            <div className="divide-y divide-[#1F1F1F]">
              {students.map(s => (
                <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#111] transition-colors">
                  
                  <div className="space-y-0.5 font-mono">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif italic font-extrabold text-white text-sm">{s.name}</span>
                      <span className="text-[9px] bg-[#141414] text-[#028A60] border border-[#222] px-2 rounded-full">{s.gradeClass}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      ID: <strong className="text-white">{s.id}</strong> • Username: <strong className="text-white">{s.username}</strong> • Password: <strong className="text-emerald-500">{s.password}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    
                    {/* Secure override for passwords / username change */}
                    <button
                      onClick={() => handleOpenCredentialsEditor(s)}
                      className="py-1 px-2 border border-[#22s] hover:border-gray-600 bg-[#141414] hover:bg-[#1c1c1c] text-gray-400 hover:text-white text-[10px] font-mono rounded"
                    >
                      Override Login credentials
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wide">Status:</span>
                      
                      <button
                        onClick={() => handleToggleSingleWithhold(s.id)}
                        className={`flex items-center gap-1 py-1.5 px-3 rounded text-[10px] font-mono font-bold uppercase cursor-pointer border transition-all ${
                          s.isResultWithheld
                            ? 'bg-red-950/20 text-red-400 border border-red-900/40'
                            : 'bg-[#028A60]/10 text-[#028A60] border border-[#028A60]/20'
                        }`}
                      >
                        {s.isResultWithheld ? (
                          <>
                            <Lock className="w-3 h-3" />
                            Withheld (Locked)
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            Released (Published)
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteStudent(s.id)}
                      className="p-1.5 bg-[#0A0A0A] border border-[#222] hover:border-red-900/50 hover:bg-red-950/20 text-red-455 rounded cursor-pointer"
                      title="Expunge Student Ledger Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Credentials Editor Modal Overlay */}
          {editingCredsStudentId && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <form onSubmit={handleSaveStudentCredentialsOverride} className="bg-[#0D0D0D] border border-gray-800 p-6 rounded-lg max-w-sm w-full space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#222] pb-3">
                  <h4 className="font-serif italic text-white text-sm">Override student Account</h4>
                  <button type="button" onClick={() => setEditingCredsStudentId(null)}>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div>
                  <label className="block text-[9px] text-[#A0A0A0] uppercase mb-1">Set customized username:</label>
                  <input 
                    type="text"
                    required
                    value={editingStudentUsername}
                    onChange={(e) => setEditingStudentUsername(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-white focus:outline-none focus:border-[#028A60]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-[#A0A0A0] uppercase mb-1">Override Password value:</label>
                  <input 
                    type="text"
                    required
                    value={editingStudentPassword}
                    onChange={(e) => setEditingStudentPassword(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-white focus:outline-none focus:border-[#028A60]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCredsStudentId(null)}
                    className="px-3 py-1.5 border border-[#222] text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-bold uppercase rounded"
                  >
                    Apply Override
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* 2. ADMISSIONS ENROLLMENT HUB */}
      {activeAdminSubTab === 'students_enrolment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-lg h-fit space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block select-none">Admissions Candidate Enrollment Deck</span>
            
            <form onSubmit={handleEnrollStudentSubmit} className="space-y-4">
              
              {enrolmentFeedback && (
                <div id="enrolment-feedback" className={`p-3 text-xs font-mono font-bold border rounded ${
                  enrolmentFeedback.startsWith('SUCCESS') 
                    ? 'bg-emerald-950/20 border-emerald-900 text-[#028A60]' 
                    : 'bg-red-950/20 border-red-900 text-red-450'
                }`}>
                  {enrolmentFeedback}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Unique Enrollment No [ID] <span className="text-red-500">*</span>:</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. DNA-2026-004"
                  value={enrollNo}
                  onChange={(e) => {
                    setEnrollNo(e.target.value);
                    setEnrolmentFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs font-mono text-white placeholder:text-gray-700 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Candidate Full Name <span className="text-red-500">*</span>:</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Sanjeev Shrestha"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setEnrolmentFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white placeholder:text-gray-700 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Allocated Grade Class:</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white rounded font-mono outline-none"
                  >
                    {CLASS_PRESETS.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Account Password:</label>
                  <input 
                    type="text"
                    required
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white font-mono rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Set customized Username <span className="text-red-500">*</span>:</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. sanjeev"
                  value={customUsername}
                  onChange={(e) => {
                    setCustomUsername(e.target.value);
                    setEnrolmentFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs font-mono text-white placeholder:text-gray-700 rounded focus:outline-none"
                />
              </div>

              {/* Checkbox selector for Subjects */}
              <div className="space-y-1.5 pt-1.5">
                <label className="block text-[10px] uppercase font-mono text-gray-400">Map Candidate Study subjects:</label>
                
                <div className="grid grid-cols-1 gap-2 bg-[#050505] p-3 border border-[#222] rounded text-xs select-none">
                  {DEFAULT_SUBJECTS.map(sub => {
                    const isChecked = selectedSubjects.includes(sub);
                    return (
                      <label key={sub} className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAddCheckboxSubject(sub)}
                          className="rounded border-[#333] text-[#028A60] focus:ring-0"
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}

                  {selectedSubjects.filter(x => !DEFAULT_SUBJECTS.includes(x)).map(sub => (
                    <label key={sub} className="flex items-center gap-2 cursor-pointer text-[#02A875]">
                      <input 
                        type="checkbox"
                        checked={true}
                        onChange={() => handleAddCheckboxSubject(sub)}
                        className="rounded border-[#333] text-[#028A60] focus:ring-0"
                      />
                      <span>{sub} (Customized)</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Extra Subject field input */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Add other course..."
                  value={extraSubjectInput}
                  onChange={(e) => setExtraSubjectInput(e.target.value)}
                  className="flex-1 bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white rounded focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddExtraConceptSubject}
                  className="py-2 px-4 bg-[#141414] hover:bg-[#1E1E1E] text-[#028A60] border border-[#333] rounded text-xs font-mono font-bold uppercase transition"
                >
                  Append
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-widest rounded transition-colors cursor-pointer"
              >
                Enroll Candidate Docket
              </button>

            </form>
          </div>

          <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#1A1A1A] p-5 rounded-lg space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block select-none">Active Student register database ({students.length}):</span>
            
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {students.map(s => (
                <div key={s.id} className="p-4 bg-[#141414] border border-[#222] rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-serif font-bold italic text-white">{s.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Roll/ID: {s.id} • Class: {s.gradeClass} • Username: {s.username}
                    </p>
                    <p className="text-[10px] text-gray-400 font-serif italic max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      Roster: {s.subjects.join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteStudent(s.id)}
                    className="p-1.5 rounded border border-transparent hover:border-red-900/60 hover:bg-red-950/20 text-red-400 transition-all cursor-pointer"
                    title="Expunge Student Profile permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* 3. DYNAMIC SUBJECTS CUSTOMIZER (Add or remove subjects on the fly) */}
      {activeAdminSubTab === 'subjects_customizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-4 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block select-none">Course Database Customizer</span>
            
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              
              {students.map(stu => (
                <button
                  key={stu.id}
                  onClick={() => setChosenSubjectStudentId(stu.id)}
                  className={`w-full text-left p-3.5 rounded border text-xs text-gray-400 transition-all select-none hover:bg-[#111] cursor-pointer ${
                    chosenSubjectStudentId === stu.id ? 'border-[#028A60] bg-[#141414]' : 'border-[#1F1F1F] bg-[#070707]'
                  }`}
                >
                  <p className="font-serif italic font-extrabold text-white mb-0.5">{stu.name}</p>
                  <p className="font-mono text-[9px] text-[#028A60] mb-1">ID: {stu.id} • Class Grade: {stu.gradeClass}</p>
                  <p className="text-[10px] text-gray-500 truncate font-sans">
                    Subjects ({stu.subjects.length}): {stu.subjects.join(', ')}
                  </p>
                </button>
              ))}

            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedCourseStudent ? (
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 space-y-6">
                
                <div className="border-b border-[#222] pb-3 select-none">
                  <span className="text-[9px] font-mono tracking-widest text-[#028A60] uppercase block">Retroactive Subjects customizer manager</span>
                  <h3 className="text-base font-serif italic text-white mt-1">
                    Student Name: <strong className="text-white">{selectedCourseStudent.name}</strong>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Class: {selectedCourseStudent.gradeClass} | Unique Roll ID: {selectedCourseStudent.id}
                  </p>
                </div>

                {/* Sub list */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-mono text-gray-500 block font-bold">Currently Enrolled Study Courses:</h4>
                  
                  <div className="space-y-2 select-none">
                    {selectedCourseStudent.subjects.map(subName => (
                      <div key={subName} className="p-3 bg-[#141414] border border-[#222] rounded flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#028A60]" />
                          <span className="text-white font-semibold">{subName}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveRetroSubject(subName)}
                          className="py-1 px-2 hover:bg-red-950/25 border border-transparent hover:border-red-900 border-none text-red-400 rounded cursor-pointer font-mono text-[10px]"
                        >
                          Clear Subject
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Append on the fly */}
                <div className="space-y-2 pt-3 border-t border-[#222]">
                  <label className="text-[10px] uppercase font-mono text-gray-400 block font-bold">Add Course on the Fly:</label>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. Nepali or English Lit..."
                      value={newCourseCustomInput}
                      onChange={(e) => setNewCourseCustomInput(e.target.value)}
                      className="flex-1 bg-[#070707] border border-[#222] focus:border-[#028A60] py-2 px-3 text-xs text-white rounded outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleAddRetroSubject}
                      className="py-1.5 px-4 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-mono text-xs font-bold uppercase rounded cursor-pointer"
                    >
                      Allocate Course
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-12 text-center rounded-lg">
                <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h4 className="font-serif italic text-white text-sm">Course Customizer</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed font-serif italic">
                  Select a candidate folder from the registry columns on the left to add or remove specific courses instantly.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. TEACHERS ROSTER PORTAL */}
      {activeAdminSubTab === 'teachers_management' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-lg h-fit space-y-4 animate-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block select-none font-bold">Register Master Instructor Profile</span>
            
            <form onSubmit={handleAddTeacherSubmit} className="space-y-4">
              
              {teacherFeedback && (
                <div id="teacher-feedback-alert" className={`p-3 text-xs font-mono font-bold border rounded ${
                  teacherFeedback.startsWith('SUCCESS') 
                    ? 'bg-emerald-950/20 border-emerald-900 text-[#028A60]' 
                    : 'bg-red-950/20 border-red-900 text-red-450'
                }`}>
                  {teacherFeedback}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Instructor Full Name:</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sah"
                  value={newTeacherName}
                  onChange={(e) => {
                    setNewTeacherName(e.target.value);
                    setTeacherFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white placeholder:text-gray-700 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Assigned Instructor Username:</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. ramesh"
                  value={newTeacherUsername}
                  onChange={(e) => {
                    setNewTeacherUsername(e.target.value);
                    setTeacherFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs font-mono text-white placeholder:text-gray-700 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Session Entrance Password (Key):</label>
                <input 
                  type="text"
                  required
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs font-mono text-white rounded focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-widest rounded transition-colors cursor-pointer"
              >
                Index Teacher Profile
              </button>

            </form>
          </div>

          <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#1A1A1A] p-5 rounded-lg space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block select-none">Active Instructor Registry:</span>
            
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {teachers.map(t => (
                <div key={t.id} className="p-4 bg-[#141414] border border-[#222] rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-serif font-bold italic text-white">{t.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">
                      ID: {t.id} • Username: <strong className="text-white">{t.username}</strong> • Password Code: <strong className="text-[#02A875]">{t.password}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteTeacher(t.id)}
                    className="p-1.5 rounded border border-transparent hover:border-red-900/60 hover:bg-red-950/20 text-red-00 cursor-pointer transition-all"
                    title="Clear Instructor details permanently"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {activeAdminSubTab === 'notice_board' && (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-lg space-y-6 animate-none">
          <div className="flex flex-wrap items-center justify-between border-b border-[#1A1A1A] pb-4 gap-4">
            <div>
              <h3 className="text-xl font-serif italic text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#028A60]" />
                Notice Bulletins Administration Board
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">Control notifications that scroll inside the main header at the top of the student dashboard.</p>
            </div>

            <button
              onClick={() => setShowAddAnnModal(true)}
              className="px-4 py-2 bg-[#028A60] hover:bg-[#02A875] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer uppercase tracking-wider rounded"
            >
              <Plus className="w-4 h-4 whitespace-nowrap" />
              Upload New Notice Board
            </button>
          </div>

          {/* New notice model backdrop */}
          {showAddAnnModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
              <div className="bg-[#0D0D0D] border border-gray-800 rounded-lg p-6 max-w-lg w-full space-y-4">
                
                <div className="flex justify-between items-center border-b border-[#222] pb-3 select-none">
                  <h4 className="font-serif italic text-white text-sm">Add New Academy Notice Bulletin</h4>
                  <button onClick={() => setShowAddAnnModal(false)} className="text-gray-500 hover:text-white">
                    <X className="w-5 h-5 animate-none" />
                  </button>
                </div>

                <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-4 text-xs font-mono">
                  
                  <div>
                    <label className="block text-[9px] uppercase text-gray-400 mb-1">Headline Bulletin Title:</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Mock Examination Boards Schedules"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#222] py-2 px-3 text-white focus:outline-none placeholder:text-gray-700 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase text-gray-400 mb-1">Notice Body Content:</label>
                    <textarea 
                      rows={4}
                      required
                      placeholder="Type details for students..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#222] py-2 px-3 text-white focus:outline-none leading-relaxed placeholder:text-gray-700 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase text-gray-400 mb-1">Bulletin Priority:</label>
                      <select
                        value={annPriority}
                        onChange={(e) => setAnnPriority(e.target.value as any)}
                        className="w-full bg-[#0A0A0A] border border-[#222] py-1.5 px-2 text-white font-mono rounded"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase text-gray-400 mb-1">Bulletin Category:</label>
                      <select
                        value={annCategory}
                        onChange={(e) => setAnnCategory(e.target.value as any)}
                        className="w-full bg-[#0A0A0A] border border-[#222] py-1.5 px-2 text-white font-mono rounded"
                      >
                        <option value="Academics">Academics</option>
                        <option value="Events">Events</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Sports">Sports</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] text-xs font-bold uppercase rounded transition-colors cursor-pointer"
                  >
                    Commit & Broadcast Bulletin
                  </button>

                </form>

              </div>
            </div>
          )}

          {/* Announcements list */}
          <div className="space-y-3">
            {announcements.map(ann => (
              <div 
                key={ann.id} 
                className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  ann.active ? 'border-[#028A60]/40 bg-[#141414]' : 'border-[#1A1A1A] bg-[#0A0A0A] opacity-65'
                }`}
              >
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2 select-none">
                    <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded ${
                      ann.priority === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      ann.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {ann.priority} Priority
                    </span>
                    <span className="bg-[#0A0A0A] border border-[#222] text-gray-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase">
                      {ann.category}
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono">Date: {ann.date}</span>
                  </div>

                  <h4 className="text-sm font-serif italic text-white font-semibold">{ann.title}</h4>
                  <p className="text-xs text-slate-400 leading-normal">{ann.content}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => handleToggleAnnouncementActive(ann.id)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold cursor-pointer border transition-all ${
                      ann.active 
                        ? 'bg-[#028A60]/10 text-[#028A60] border-[#028A60]/40 hover:bg-[#028A60]/20' 
                        : 'bg-[#141414] text-[#8888aa] border-[#222] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    {ann.active ? '● Active: Online' : '○ Disabled: Paused'}
                  </button>

                  {deletingAnnouncementId === ann.id ? (
                    <div className="flex items-center gap-1.5 font-mono text-[9px] bg-red-950/30 border border-red-900/55 p-1.5 rounded shrink-0">
                      <span className="text-red-400 font-bold uppercase select-none">Delete?</span>
                      <button
                        onClick={() => {
                          handleDeleteAnnouncement(ann.id);
                          setDeletingAnnouncementId(null);
                        }}
                        className="px-1.5 py-0.5 bg-red-800 text-white rounded hover:bg-red-700 cursor-pointer text-[10px] leading-tight"
                        title="Yes, delete notice"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingAnnouncementId(null)}
                        className="px-1.5 py-0.5 bg-slate-800 text-slate-350 rounded hover:bg-slate-700 cursor-pointer text-[10px] leading-tight"
                        title="Cancel"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingAnnouncementId(ann.id)}
                      className="p-1.5 rounded border border-[#222] bg-[#0A0A0A] text-red-400 hover:text-white hover:bg-red-950/25 cursor-pointer transition-colors"
                      title="Delete Notice Bulletin permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <p className="text-xs text-gray-500 italic text-center py-12">No announcement notices published in ledger archive.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
