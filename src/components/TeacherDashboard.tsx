import React, { useState } from 'react';
import { Student, Announcement, Teacher, StudyMaterial, SubjectMark, ExamMark, ExamType } from '../types';
import { EXAMS_CONFIG, CLASS_PRESETS, DEFAULT_SUBJECTS } from '../data/seedData';
import { 
  LucideIcon,
  Plus, 
  Trash2, 
  Save, 
  ListPlus, 
  Megaphone, 
  GraduationCap, 
  ChevronRight, 
  ClipboardList, 
  AlertCircle,
  TrendingUp,
  X,
  BookOpen,
  MessageSquare,
  Check,
  Eye,
  EyeOff,
  User,
  Lock,
  Key,
  Download,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  CheckCircle,
  HelpCircle,
  FolderPlus
} from 'lucide-react';

interface TeacherDashboardProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  announcements: Announcement[];
  onUpdateAnnouncements: (updated: Announcement[]) => void;
  teachers: Teacher[];
  onUpdateTeachers: (updated: Teacher[]) => void;
  studyMaterials: StudyMaterial[];
  onUpdateStudyMaterials: (updated: StudyMaterial[]) => void;
}

export default function TeacherDashboard({ 
  students, 
  onUpdateStudents, 
  announcements, 
  onUpdateAnnouncements,
  teachers,
  onUpdateTeachers,
  studyMaterials,
  onUpdateStudyMaterials
}: TeacherDashboardProps) {

  // Login states
  const [authenticatedTeacherId, setAuthenticatedTeacherId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [pwdInput, setPwdInput] = useState('');
  const [pwdVisible, setPwdVisible] = useState(false);
  const [authError, setAuthError] = useState('');

  // Tab controls
  const [activeTab, setActiveTab] = useState<'grades_entry' | 'attendance' | 'student_remarks' | 'study_materials' | 'announcements' | 'security'>('grades_entry');

  // Attendance entry states
  const [attendanceClass, setAttendanceClass] = useState<string>('Class 10');
  const [attendanceDate, setAttendanceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [attendanceFeedback, setAttendanceFeedback] = useState<string>('');

  // Grades entry filter states
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Compulsory Mathematics');
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('Weekly Test');

  // We keep a temporary dictionary of score modifications before saving
  const [tempScores, setTempScores] = useState<Record<string, { obtainedScore?: number; remarks?: string }>>({});
  const [gradeSaveFeedback, setGradeSaveFeedback] = useState('');

  // Selected student for single remarks editing
  const [selectedStudentForRemarksId, setSelectedStudentForRemarksId] = useState<string | null>(null);
  const [studentRemarksComment, setStudentRemarksComment] = useState('');

  // Study materials manager state
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialGrade, setNewMaterialGrade] = useState('Class 10');
  const [newMaterialSubject, setNewMaterialSubject] = useState('Compulsory Mathematics');
  const [newMaterialFileName, setNewMaterialFileName] = useState('');
  const [newMaterialFileSize, setNewMaterialFileSize] = useState('1.5 MB');
  const [materialFeedback, setMaterialFeedback] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [deletingStudyMaterialId, setDeletingStudyMaterialId] = useState<string | null>(null);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);

  // Announcement state
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [annCategory, setAnnCategory] = useState<'Academics' | 'Events' | 'Holiday' | 'Sports' | 'General'>('General');
  const [annDate, setAnnDate] = useState(new Date().toISOString().split('T')[0]);

  // Teacher self password generation states
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [confirmTeacherPassword, setConfirmTeacherPassword] = useState('');
  const [teacherSecurityFeedback, setTeacherSecurityFeedback] = useState('');

  // Handle teacher credentials confirmation
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const found = teachers.find(t => t.username.toLowerCase().trim() === usernameInput.toLowerCase().trim());
    if (!found) {
      setAuthError('Instructor username not recognized.');
      return;
    }

    if (found.password === pwdInput.trim()) {
      setAuthenticatedTeacherId(found.id);
      setUsernameInput('');
      setPwdInput('');
    } else {
      setAuthError('Key phrase denied. Check your password.');
    }
  };

  const activeTeacher = teachers.find(t => t.id === authenticatedTeacherId) || null;

  const handleTeacherLogout = () => {
    setAuthenticatedTeacherId(null);
    setTeacherSecurityFeedback('');
    setNewTeacherPassword('');
    setConfirmTeacherPassword('');
  };

  // 1. DATA FINDER HELPERS FOR THE GRADING SYSTEMS
  // Get active student roster in the selected class
  const classStudents = students.filter(s => s.gradeClass === selectedClass);

  // Auto discover the list of active subject options inside the class or default ones
  const activeSubjectOptions = Array.from(new Set([
    ...DEFAULT_SUBJECTS,
    ...students.flatMap(s => s.subjects)
  ]));

  // Find exact exam configuration (totalScore, passScore)
  const examConfig = EXAMS_CONFIG[selectedExamType] || { totalScore: 100, passScore: 40 };

  // Helper inside the entry table to see current mark
  const getStudentExamMark = (student: Student, subject: string, exType: ExamType): ExamMark | null => {
    const subMark = student.marksBySubject.find(sm => sm.subject.toLowerCase() === subject.toLowerCase());
    if (!subMark) return null;
    return subMark.exams.find(ex => ex.examType === exType) || null;
  };

  // Helper to construct a template for the 5 exams of a subject
  const createBlankExamsTemplate = (): ExamMark[] => {
    return [
      { examType: 'Self Evaluation Test', totalScore: 25, passScore: 10 },
      { examType: 'Weekly Test', totalScore: 25, passScore: 10 },
      { examType: 'Monthly Test', totalScore: 40, passScore: 18 },
      { examType: 'Terminal', totalScore: 50, passScore: 20 },
      { examType: 'Scholarship Exam', totalScore: 75, passScore: 30 }
    ];
  };

  // 2. LOGIC FOR ENTRY SHEET FIELD CHANGES
  const handleTempScoreChange = (studentId: string, valueStr: string) => {
    setGradeSaveFeedback('');
    let val: number | undefined = undefined;
    if (valueStr.trim() !== '') {
      val = Math.max(0, Math.min(examConfig.totalScore, parseInt(valueStr) || 0));
    }
    setTempScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        obtainedScore: val
      }
    }));
  };

  const handleTempRemarkChange = (studentId: string, remark: string) => {
    setGradeSaveFeedback('');
    setTempScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: remark
      }
    }));
  };

  // Commit all grid modifications to global applet state
  const handleCommitGradesLedgerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGradeSaveFeedback('');

    // Map through students and update the targets
    const updatedStudents = students.map(stu => {
      // Check if student belongs to the active class
      if (stu.gradeClass !== selectedClass) return stu;

      // Verify if there is temp score changes for this student
      const change = tempScores[stu.id];
      const currentScore = getStudentExamMark(stu, selectedSubject, selectedExamType);

      // If no change entered and student already has a mark, we don't modify it. 
      // If there's an edit, we apply it.
      if (!change && currentScore) return stu;

      // Ensure subject mark exists inside candidate profiles
      let subjectMarkIndex = stu.marksBySubject.findIndex(sm => sm.subject.toLowerCase() === selectedSubject.toLowerCase());
      let newMarksBySubject = [...stu.marksBySubject];

      if (subjectMarkIndex === -1) {
        // Construct new subject column with default 5 exam sheets
        const newCol: SubjectMark = {
          subject: selectedSubject,
          exams: createBlankExamsTemplate()
        };
        newMarksBySubject.push(newCol);
        subjectMarkIndex = newMarksBySubject.length - 1;
      }

      // Inside the subject, update specific exam marks
      const targetExams = newMarksBySubject[subjectMarkIndex].exams.map(ex => {
        if (ex.examType === selectedExamType) {
          return {
            ...ex,
            totalScore: examConfig.totalScore,
            passScore: examConfig.passScore,
            obtainedScore: change && change.obtainedScore !== undefined ? change.obtainedScore : ex.obtainedScore,
            remarks: change && change.remarks !== undefined ? change.remarks : ex.remarks,
            dateEntered: new Date().toISOString().split('T')[0]
          };
        }
        return ex;
      });

      newMarksBySubject[subjectMarkIndex] = {
        ...newMarksBySubject[subjectMarkIndex],
        exams: targetExams
      };

      return {
        ...stu,
        marksBySubject: newMarksBySubject
      };
    });

    onUpdateStudents(updatedStudents);
    setTempScores({}); // Clear buffer
    setGradeSaveFeedback('SUCCESS: Subject grades ledger committed and published to students portal!');
  };

  // Populate input buffer fields with existing scores
  const handleLoadClassroomScoresIntoGrid = () => {
    const loadedTemp: Record<string, { obtainedScore?: number; remarks?: string }> = {};
    classStudents.forEach(stu => {
      const existing = getStudentExamMark(stu, selectedSubject, selectedExamType);
      if (existing) {
        loadedTemp[stu.id] = {
          obtainedScore: existing.obtainedScore,
          remarks: existing.remarks || ''
        };
      }
    });
    setTempScores(loadedTemp);
    setGradeSaveFeedback('Loaded existing database scores into active grid cells!');
  };

  // 3. STUDENT REMARKS & HOUSEKEEPING
  const handleSelectStudentForRemarks = (student: Student) => {
    setSelectedStudentForRemarksId(student.id);
    setStudentRemarksComment(student.generalRemarks || '');
  };

  const handleSaveStudentGeneralRemarks = () => {
    if (!selectedStudentForRemarksId) return;

    const updated = students.map(s => {
      if (s.id === selectedStudentForRemarksId) {
        return {
          ...s,
          generalRemarks: studentRemarksComment
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setSelectedStudentForRemarksId(null);
    setStudentRemarksComment('');
    alert('General tutor appraisals record updated successfully!');
  };

  // 1B. INSTRUCTOR ATTENDANCE SESSION ENTRY
  const handleSaveAttendance = (draft: Record<string, 'Present' | 'Absent' | 'Late'>) => {
    const updatedStudents = students.map(student => {
      if (student.gradeClass !== attendanceClass) return student;
      const status = draft[student.id] || 'Present';
      
      const existingIndex = student.attendance.findIndex(a => a.date === attendanceDate);
      const newAttendance = [...student.attendance];
      
      if (existingIndex >= 0) {
        newAttendance[existingIndex] = { ...newAttendance[existingIndex], status };
      } else {
        newAttendance.push({ date: attendanceDate, status });
      }
      
      return {
        ...student,
        attendance: newAttendance
      };
    });
    onUpdateStudents(updatedStudents);
    setAttendanceFeedback(`SUCCESS: Attendance saved and published successfully for ${attendanceClass} on ${attendanceDate}!`);
    setTimeout(() => {
      setAttendanceFeedback('');
    }, 5000);
  };

  // 4. STUDY MATERIALS MANAGEMENT
  const handleFileChange = (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMaterialFeedback('ERROR: Only PDF files (.pdf) are permitted.');
      return;
    }
    
    // Check filesize to avoid LocalStorage running out (recommend <= 2.5MB)
    if (file.size > 2.5 * 1024 * 1024) {
      setMaterialFeedback('ERROR: PDF exceeds 2.5 MB. Select a smaller PDF to remain inside offline storage constraints.');
      return;
    }

    setUploadedFile(file);
    setNewMaterialFileName(file.name);
    
    // Auto-formulate a clean title if not already entered
    if (!newMaterialTitle.trim()) {
      const cleanName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setNewMaterialTitle(cleanName);
    }

    // Determine readable file size
    const sizeInKB = file.size / 1024;
    if (sizeInKB < 1024) {
      setNewMaterialFileSize(`${Math.round(sizeInKB)} KB`);
    } else {
      setNewMaterialFileSize(`${(sizeInKB / 1024).toFixed(1)} MB`);
    }

    // Read file via FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedBase64(e.target.result as string);
        setMaterialFeedback('PDF file registered successfully! Ready to publish.');
      }
    };
    reader.onerror = () => {
      setMaterialFeedback('ERROR: Failed to read file content.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAddStudyMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    setMaterialFeedback('');

    if (!newMaterialTitle.trim()) {
      setMaterialFeedback('Please write down the material title.');
      return;
    }

    if (!uploadedBase64) {
      setMaterialFeedback('Please select or drag-and-drop a PDF file to upload.');
      return;
    }

    const finalFileName = newMaterialFileName.trim() 
      ? (newMaterialFileName.trim().toLowerCase().endsWith('.pdf') ? newMaterialFileName.trim() : `${newMaterialFileName.trim()}.pdf`)
      : 'Untitled_Worksheet.pdf';

    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: newMaterialTitle.trim(),
      gradeClass: newMaterialGrade,
      subject: newMaterialSubject,
      fileName: finalFileName,
      fileSize: newMaterialFileSize || '1.1 MB',
      downloadUrl: uploadedBase64,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    onUpdateStudyMaterials([newMaterial, ...studyMaterials]);
    setNewMaterialTitle('');
    setNewMaterialFileName('');
    setUploadedFile(null);
    setUploadedBase64('');
    setMaterialFeedback('Study guide published! Students of ' + newMaterialGrade + ' can now access it in their cabinets.');
  };

  const handleDeleteStudyMaterial = (id: string) => {
    onUpdateStudyMaterials(studyMaterials.filter(m => m.id !== id));
  };

  // 5. SCHOOL BOARD BULLETIN NOTICES HANDLERS
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

  // 6. PASSWORD REGENT DESK (Self password change for instructor)
  const handleApplyTeacherPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherSecurityFeedback('');

    if (!activeTeacher) return;
    if (!newTeacherPassword.trim()) {
      setTeacherSecurityFeedback('Password can not be blank.');
      return;
    }

    if (newTeacherPassword !== confirmTeacherPassword) {
      setTeacherSecurityFeedback('Verifying pass-codes failed. Match check failed.');
      return;
    }

    const updatedTeachers = teachers.map(t => {
      if (t.id === activeTeacher.id) {
        return {
          ...t,
          password: newTeacherPassword.trim()
        };
      }
      return t;
    });

    onUpdateTeachers(updatedTeachers);
    setNewTeacherPassword('');
    setConfirmTeacherPassword('');
    setTeacherSecurityFeedback('Password updated correctly! Store it safely.');
  };

  const handleGenerateTeacherSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#@$%';
    let pass = '';
    for (let i = 8; i < 15; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTeacherPassword(pass);
    setConfirmTeacherPassword(pass);
    setTeacherSecurityFeedback('Code generated. Apply password change to save!');
  };

  // If teacher is not logged in
  if (!activeTeacher) {
    return (
      <div id="teacher-login-viewport" className="max-w-md mx-auto my-12 bg-[#0E0E0E] border border-[#1F1F1F] rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 bg-[#151515] text-center border-b border-[#222]">
          <div className="w-14 h-14 bg-[#0A0A0A] border border-[#028A60] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#028A60]" />
          </div>
          <h3 className="text-xl font-serif text-white italic">Intructors Portal Key</h3>
          <p className="text-xs text-[#888] uppercase tracking-widest mt-1">Dev Narayan Academy (DNA Classes)</p>
        </div>

        <form onSubmit={handleTeacherLogin} className="p-6 space-y-4">
          {authError && (
            <div id="teacher-auth-failure" className="p-3 bg-red-950/20 border border-red-900/40 rounded text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Instructor Key Name (Username):</label>
            <input 
              type="text"
              required
              placeholder="e.g. aatish"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-[#070707] border border-[#222] rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-[#028A60] focus:ring-1 focus:ring-[#028A60] font-mono animate-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Instructor Gate Phrase (Password):</label>
            <div className="relative">
              <input 
                type={pwdVisible ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={pwdInput}
                onChange={(e) => setPwdInput(e.target.value)}
                className="w-full bg-[#070707] border border-[#222] rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-[#028A60] focus:ring-1 focus:ring-[#028A60] font-mono pr-10"
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
            className="w-full py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-bold text-xs uppercase tracking-widest rounded transition-colors font-mono cursor-pointer"
          >
            Authenticate Instructor Session
          </button>
        </form>
      </div>
    );
  }

  // Calculate stats for current class & subject filter
  const currentExamTotalMaxScoreSum = classStudents.length * examConfig.totalScore;
  let currentExamObtainedSum = 0;
  let currentExamGradesEntered = 0;
  let currentExamGradesPass = 0;

  classStudents.forEach(s => {
    // Check if score changed or exists
    const tempChange = tempScores[s.id];
    const scoreVal = tempChange && tempChange.obtainedScore !== undefined 
      ? tempChange.obtainedScore 
      : getStudentExamMark(s, selectedSubject, selectedExamType)?.obtainedScore;

    if (scoreVal !== undefined) {
      currentExamObtainedSum += scoreVal;
      currentExamGradesEntered++;
      if (scoreVal >= examConfig.passScore) {
        currentExamGradesPass++;
      }
    }
  });

  const averageClassExamPercentage = currentExamGradesEntered > 0
    ? Math.round((currentExamObtainedSum / (currentExamGradesEntered * examConfig.totalScore)) * 100)
    : 0;

  return (
    <div id="teacher-portal-space" className="space-y-6 my-4">
      
      {/* Tab Control Ribbon */}
      <div id="teacher-tab-ribbon" className="bg-[#0D0D0D] rounded-lg border border-[#1A1A1A] p-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('grades_entry')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'grades_entry'
                ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded'
                : 'text-gray-400 hover:text-white hover:bg-[#141414] rounded'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Classwise Grades entry Worksheet
          </button>

          <button
            onClick={() => {
              setActiveTab('attendance');
              setAttendanceFeedback('');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded'
                : 'text-gray-400 hover:text-white hover:bg-[#141414] rounded'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Classroom Attendance Register
          </button>

          <button
            onClick={() => setActiveTab('student_remarks')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'student_remarks'
                ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded'
                : 'text-gray-400 hover:text-white hover:bg-[#141414] rounded'
            }`}
          >
            <User className="w-4 h-4" />
            Tutor Appraisals remarks
          </button>

          <button
            onClick={() => setActiveTab('study_materials')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'study_materials'
                ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded'
                : 'text-gray-400 hover:text-white hover:bg-[#141414] rounded'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Publish Study Resources
          </button>
          
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded'
                : 'text-gray-400 hover:text-white hover:bg-[#141414] rounded'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Notice Announcements Board
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold rounded'
                : 'text-gray-400 hover:text-white hover:bg-[#141414] rounded'
            }`}
          >
            <Key className="w-4 h-4" />
            Instructor Keys
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 self-end md:self-center pl-2 md:pl-0">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden lg:inline-block font-bold">
            Hi, {activeTeacher.name} •
          </span>
          <button
            onClick={handleTeacherLogout}
            className="py-1 px-3 bg-[#111] hover:bg-[#222] border border-[#222] hover:border-red-900/50 hover:text-red-400 text-gray-400 rounded text-xs tracking-wider transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* TAB CONTAINER BODY */}

      {/* 1. GRADES ENTRY SHEET TAB */}
      {activeTab === 'grades_entry' && (
        <div className="space-y-6">
          
          {/* Controls filtering bar */}
          <form onSubmit={handleCommitGradesLedgerSubmit} className="bg-[#0D0D0D] border border-[#1A1A1A] p-5 rounded-lg space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block">Classwise & Subjectwise Matrix Filter Dashboard:</span>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Class selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">Class Selection:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setTempScores({});
                    setGradeSaveFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 rounded text-xs text-white uppercase tracking-wider font-mono outline-none"
                >
                  {CLASS_PRESETS.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Subject selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">Subject Selection:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setTempScores({});
                    setGradeSaveFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 rounded text-xs text-white uppercase tracking-wider font-mono outline-none"
                >
                  {activeSubjectOptions.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Exam type selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">Exam Type Category (5 Types):</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => {
                    setSelectedExamType(e.target.value as ExamType);
                    setTempScores({});
                    setGradeSaveFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 rounded text-xs text-white uppercase tracking-wider font-mono outline-none"
                >
                  <option value="Self Evaluation Test">Self Evaluation Test (25/10)</option>
                  <option value="Weekly Test">Weekly Test (25/10)</option>
                  <option value="Monthly Test">Monthly Test (40/18)</option>
                  <option value="Terminal">Terminal Exam (50/20)</option>
                  <option value="Scholarship Exam">Scholarship Exam (75/30)</option>
                </select>
              </div>

              {/* Quick load sync button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleLoadClassroomScoresIntoGrid}
                  className="w-full py-2 bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] border border-[#2A2A2A] rounded text-xs font-mono transition-colors uppercase cursor-pointer block"
                >
                  Pull DB Scores Grid
                </button>
              </div>

            </div>

            {/* Exam specifications notice banner */}
            <div className="bg-[#141414] p-3 rounded.md border border-[#222] flex items-center justify-between flex-wrap gap-2 text-xs">
              <p className="text-gray-400 font-mono">
                🔍 Grading System: <span className="text-white font-bold">{selectedExamType}</span> holds <strong className="text-[#028A60]">{examConfig.totalScore} Full Marks</strong> and <strong className="text-amber-500">{examConfig.passScore} Passing Limit</strong>.
              </p>
              
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-500 bg-[#0A0A0A] px-2 py-0.5 rounded">
                <span>Class Average Stand:</span>
                <span className="text-white font-bold">{averageClassExamPercentage}%</span>
              </div>
            </div>

            {/* ERROR FEEDBACK BANNER */}
            {gradeSaveFeedback && (
              <div id="grades-commit-alert" className="p-3 bg-emerald-950/20 border border-emerald-900 text-[#028A60] rounded text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{gradeSaveFeedback}</span>
              </div>
            )}

            {/* Entry List Table */}
            <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0A0A0A]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#141414] border-b border-[#222] text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                    <th className="py-3 px-4 font-bold">Enrollment ID</th>
                    <th className="py-3 px-4 font-bold">Candidate Name</th>
                    <th className="py-3 px-4 text-center font-bold">Grade ({examConfig.totalScore}M)</th>
                    <th className="py-3 px-4 font-bold">Status Badge</th>
                    <th className="py-3 px-4 font-bold">Questions Feedback Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C1C]">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-gray-500 italic font-serif">
                        No students are currently registered inside {selectedClass}. Enroll pupils from the Admin console first.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map(student => {
                      // Lookup temp values else DB values
                      const existingMarkVal = getStudentExamMark(student, selectedSubject, selectedExamType);
                      const tState = tempScores[student.id];
                      
                      const computedScore = tState && tState.obtainedScore !== undefined 
                        ? tState.obtainedScore 
                        : existingMarkVal?.obtainedScore;

                      const computedRemarks = tState && tState.remarks !== undefined 
                        ? tState.remarks 
                        : (existingMarkVal?.remarks || '');

                      const stateLoaded = computedScore !== undefined;
                      const hasPassed = stateLoaded && (computedScore! >= examConfig.passScore);

                      return (
                        <tr id={`grid-row-${student.id}`} key={student.id} className="hover:bg-[#111] transition-colors">
                          
                          {/* ID */}
                          <td className="py-3 px-4 font-mono text-[11px] text-[#028A60] font-bold">
                            {student.id}
                          </td>

                          {/* Candidate Title */}
                          <td className="py-3 px-4 text-xs font-serif italic text-white font-semibold">
                            {student.name}
                          </td>

                          {/* Obtained score input */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input 
                                id={`obtained-score-v-${student.id}`}
                                type="number"
                                placeholder="--"
                                min={0}
                                max={examConfig.totalScore}
                                value={computedScore === undefined ? '' : computedScore}
                                onChange={(e) => handleTempScoreChange(student.id, e.target.value)}
                                className="w-14 text-center py-1 bg-[#050505] border border-[#222] hover:border-gray-700 text-white font-mono font-bold text-xs rounded focus:outline-none focus:border-[#028A60]"
                              />
                              <span className="text-gray-600 text-xs">/{examConfig.totalScore}</span>
                            </div>
                          </td>

                          {/* Status validation checker */}
                          <td className="py-3 px-4 text-xs">
                            {stateLoaded ? (
                              <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-extrabold ${
                                hasPassed 
                                  ? 'bg-[#028A60]/10 text-[#028A60] border border-[#028A60]/30' 
                                  : 'bg-red-950/20 text-red-400 border border-red-900/40'
                              }`}>
                                {hasPassed ? `Passed ✓` : `Failed ⚠`}
                              </span>
                            ) : (
                              <span className="text-gray-600 italic font-mono text-[10px] select-none">No Entry</span>
                            )}
                          </td>

                          {/* Personal subject feedback remark */}
                          <td className="py-3 px-4">
                            <input 
                              id={`subject-remarks-v-${student.id}`}
                              type="text"
                              placeholder="Type score feedback..."
                              value={computedRemarks}
                              onChange={(e) => handleTempRemarkChange(student.id, e.target.value)}
                              className="w-full text-xs py-1 px-2.5 bg-[#050505] border border-[#222] hover:border-gray-700 text-gray-300 placeholder:text-gray-700 rounded focus:outline-none focus:border-[#02a875]"
                            />
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Commit bar button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={classStudents.length === 0}
                className="py-2.5 px-6 rounded bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] disabled:bg-[#1C1C1C] disabled:text-gray-500 disabled:cursor-not-allowed text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Commit & Publish Marks Ledger
              </button>
            </div>

          </form>

        </div>
      )}

      {/* 1C. INSTRUCTOR SESSION CLASSROOM ATTENDANCE LEDGER */}
      {activeTab === 'attendance' && (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1A1A1A] pb-4 gap-4">
            <div>
              <h3 className="text-xl font-serif italic text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#028A60]" />
                Daily Attendance Register Ledger
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Select a class grade and calendar date to maintain classroom attendance status records.</p>
            </div>
          </div>

          {/* Controls filter block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#070707] p-4 rounded border border-[#151515]">
            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">Classroom Filter:</label>
              <select
                value={attendanceClass}
                onChange={(e) => {
                  setAttendanceClass(e.target.value);
                  setAttendanceFeedback('');
                }}
                className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs text-white rounded font-mono focus:border-[#028A60] outline-none"
              >
                {CLASS_PRESETS.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">Calendar Date Selector:</label>
              <input
                type="date"
                value={attendanceDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setAttendanceDate(e.target.value);
                  setAttendanceFeedback('');
                }}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {
                    console.warn("Native calendar picker showPicker() not supported", err);
                  }
                }}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-1.5 text-xs text-white rounded font-mono focus:border-[#028A60] outline-none cursor-pointer"
              />
            </div>
          </div>

          {attendanceFeedback && (
            <div className="p-3 bg-[#028A60]/10 border border-[#028A60]/30 text-[#028A60] text-xs font-mono font-bold rounded animate-none">
              {attendanceFeedback}
            </div>
          )}

          {/* Embedded Interactive Editor */}
          <AttendanceRegisterEditor
            key={`${attendanceClass}-${attendanceDate}-${students.length}`}
            students={students}
            attendanceClass={attendanceClass}
            attendanceDate={attendanceDate}
            onSave={handleSaveAttendance}
          />
        </div>
      )}

      {/* 2. GENERAL HOUSEKEEPING APPRECIALS REMARKS */}
      {activeTab === 'student_remarks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-4 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block mb-2">Classroom Students:</span>
            
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              
              {/* Select target class */}
              <div className="mb-4">
                <label className="text-[10px] font-mono text-gray-500 block mb-1">Class Filter:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#222] px-2.5 py-1.5 text-xs text-white"
                >
                  {CLASS_PRESETS.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {classStudents.map(stu => (
                <button
                  key={stu.id}
                  onClick={() => handleSelectStudentForRemarks(stu)}
                  className={`w-full text-left p-3 rounded border text-xs focus:outline-none transition-all cursor-pointer ${
                    selectedStudentForRemarksId === stu.id 
                      ? 'border-[#028A60] bg-[#141414] text-white' 
                      : 'border-[#1F1F1F] bg-[#070707] hover:bg-[#111] text-gray-400'
                  }`}
                >
                  <p className="font-serif italic font-bold text-white mb-0.5">{stu.name}</p>
                  <p className="font-mono text-[9px] text-[#028A60]">ID: {stu.id}</p>
                  
                  {stu.generalRemarks ? (
                    <p className="text-[10px] font-serif text-gray-500 truncate italic mt-1 bg-[#070707] p-1 border-l-2 border-gray-600">
                      "{stu.generalRemarks}"
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-605 italic mt-1 font-mono">No feedback logged yet.</p>
                  )}
                </button>
              ))}

              {classStudents.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-8">Select another class directory above.</p>
              )}

            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedStudentForRemarksId ? (
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 space-y-4">
                <span className="text-[10px] font-mono tracking-widest text-[#028A60] uppercase block">Editing Comprehensive House Remarks</span>
                
                <h3 className="text-base font-serif italic text-white">
                  Student Name: <strong className="text-white hover:underline">{students.find(s => s.id === selectedStudentForRemarksId)?.name}</strong>
                </h3>

                <p className="text-xs text-gray-500">
                  Write developmental feedback, behaviour logs, study habits guidance, and diagnostics advice. This renders inside the student report ledger on login.
                </p>

                <textarea
                  rows={6}
                  value={studentRemarksComment}
                  onChange={(e) => setStudentRemarksComment(e.target.value)}
                  placeholder="Provide counseling and developmental appraisals remarks..."
                  className="w-full bg-[#070707] border border-[#222] focus:border-[#028A60] py-3 px-4 text-xs font-serif italic text-[#E2E2E2] leading-relaxed rounded outline-none"
                />

                <div className="flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForRemarksId(null)}
                    className="py-1.5 px-4 rounded border border-[#222] hover:bg-[#111] text-gray-400 hover:text-white text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveStudentGeneralRemarks}
                    className="py-1.5 px-5 rounded bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Commit appraisals Update
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-12 text-center rounded-lg">
                <User className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h4 className="font-serif italic text-white text-sm">Tutor Appraisal Section</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed font-serif italic">
                  Select an active candidate directory from the roster columns on the left to write comprehensive appraisals statements.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. STUDY MATERIALS PROVISION DESK */}
      {activeTab === 'study_materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 space-y-4 h-fit">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block">Publish New Study Guide booklet:</span>
            
            <form onSubmit={handleAddStudyMaterial} className="space-y-4">
              
              {materialFeedback && (
                <div id="material-creation-feedback" className="p-3 bg-emerald-950/25 border border-emerald-900 text-[#028A60] text-xs font-mono font-bold rounded">
                  {materialFeedback}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Booklet/Practice Title:</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Quadrants Heights and Coordinates Formula Worksheet"
                  value={newMaterialTitle}
                  onChange={(e) => {
                    setNewMaterialTitle(e.target.value);
                    setMaterialFeedback('');
                  }}
                  className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white placeholder:text-gray-700 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Target Class */}
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Target Class Grade:</label>
                  <select
                    value={newMaterialGrade}
                    onChange={(e) => setNewMaterialGrade(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white"
                  >
                    <option value="All">All Grades (1 to 12)</option>
                    {CLASS_PRESETS.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Target Subject */}
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Associated Subject:</label>
                  <select
                    value={newMaterialSubject}
                    onChange={(e) => setNewMaterialSubject(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222] py-2 px-3 text-xs text-white font-mono"
                  >
                    <option value="All">All Subject Units</option>
                    {activeSubjectOptions.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* PDF Document File Uploader (Supports Drag & Drop & Selection) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Upload Worksheets / Guide Booklet (.pdf):</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                    dragActive 
                      ? 'border-[#028A60] bg-[#028A60]/5' 
                      : uploadedFile 
                        ? 'border-emerald-700/60 bg-emerald-950/5' 
                        : 'border-[#222] hover:border-gray-700 bg-[#050505]'
                  }`}
                >
                  <input 
                    type="file" 
                    id="pdf-file-upload-input"
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="cursor-pointer block space-y-2">
                    <label htmlFor="pdf-file-upload-input" className="cursor-pointer block">
                      <UploadCloud className={`w-8 h-8 mx-auto transition-colors ${uploadedFile ? 'text-emerald-500' : 'text-gray-500'}`} />
                    </label>
                    {uploadedFile ? (
                      <div className="space-y-1">
                        <p className="text-xs text-white font-mono font-bold truncate px-2">{uploadedFile.name}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">({newMaterialFileSize} • PDF Document Locked)</p>
                        <label htmlFor="pdf-file-upload-input" className="text-[9px] text-[#028A60] font-mono underline hover:text-white cursor-pointer select-none">
                          Replace Workbook PDF
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-300 font-serif italic">Drag & drop workbook PDF here</p>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                          or <label htmlFor="pdf-file-upload-input" className="underline hover:text-white cursor-pointer select-none">browse files</label>
                        </p>
                        <p className="text-[9px] text-[#028A60] font-mono">Recommended size limit: under 2.5 MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="space-y-1 bg-[#141414] p-3 rounded-lg border border-[#222] text-[11px] font-mono">
                  <div className="flex justify-between text-gray-400">
                    <span>Selected File:</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadedBase64('');
                        setNewMaterialFileName('');
                      }} 
                      className="text-red-400 hover:text-red-300 cursor-pointer text-xs"
                    >
                      Remove File
                    </button>
                  </div>
                  <p className="text-white truncate mt-0.5">{newMaterialFileName}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] text-xs font-mono font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Upload & Publish Material Guide
              </button>

            </form>
          </div>

          {/* Directory lists */}
          <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] block select-none">Active Classroom Materials directory ({studyMaterials.length}):</span>
            
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {studyMaterials.map(mat => (
                <div key={mat.id} className="p-4 bg-[#141414] border border-[#222] rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex gap-1.5 items-center flex-wrap select-none">
                      <span className="text-[8px] font-mono font-bold bg-[#0A0A0A] text-[#028A60] border border-[#333] px-1.5 py-0.5 rounded leading-none uppercase">
                        {mat.subject}
                      </span>
                      <span className="text-[9px] text-[#A0A0A0] font-mono">{mat.gradeClass}</span>
                    </div>

                    <h4 className="text-xs font-serif font-bold italic text-white">{mat.title}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">
                      File: {mat.fileName} • {mat.fileSize} • Issued {mat.uploadDate}
                    </p>
                  </div>

                  {deletingStudyMaterialId === mat.id ? (
                    <div className="flex items-center gap-1.5 font-mono text-[9px] bg-red-950/30 border border-red-900/55 p-1.5 rounded shrink-0">
                      <span className="text-red-400 font-bold uppercase select-none">Delete?</span>
                      <button
                        onClick={() => {
                          handleDeleteStudyMaterial(mat.id);
                          setDeletingStudyMaterialId(null);
                        }}
                        className="px-1.5 py-0.5 bg-red-800 text-white rounded hover:bg-red-700 cursor-pointer text-[10px] leading-tight"
                        title="Yes, delete"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingStudyMaterialId(null)}
                        className="px-1.5 py-0.5 bg-slate-800 text-slate-350 rounded hover:bg-slate-700 cursor-pointer text-[10px] leading-tight"
                        title="Cancel"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingStudyMaterialId(mat.id)}
                      className="p-1.5 rounded-none border border-transparent hover:border-red-900/60 hover:bg-red-950/20 text-red-400 transition-all cursor-pointer"
                      title="Delete Study Booklet File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {studyMaterials.length === 0 && (
                <p className="text-xs text-gray-650 italic text-center py-12">No online reference booklets are index uploaded yet.</p>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 4. SCHOOL ANNOUNCEMENTS DESK */}
      {activeTab === 'announcements' && (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-lg space-y-6">
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
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-[#0D0D0D] border border-gray-800 rounded-lg p-6 max-w-lg w-full space-y-4">
                
                <div className="flex justify-between items-center border-b border-[#222] pb-3 select-none">
                  <h4 className="font-serif italic text-white text-sm">Add New Academy Notice Bulletin</h4>
                  <button onClick={() => setShowAddAnnModal(false)} className="text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
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
                      className="w-full bg-[#0A0A0A] border border-[#222] py-2 px-3 text-white focus:outline-none"
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
                      className="w-full bg-[#0A0A0A] border border-[#222] py-2 px-3 text-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase text-gray-400 mb-1">Bulletin Priority:</label>
                      <select
                        value={annPriority}
                        onChange={(e) => setAnnPriority(e.target.value as any)}
                        className="w-full bg-[#0A0A0A] border border-[#222] py-1.5 px-2 text-white"
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
                        className="w-full bg-[#0A0A0A] border border-[#222] py-1.5 px-2 text-white font-mono"
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
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase ${
                      ann.priority === 'high' ? 'bg-rose-950/25 text-rose-455 border border-rose-900/40' :
                      ann.priority === 'medium' ? 'bg-amber-955/25 text-amber-500 border border-amber-900/40' :
                      'bg-[#028A60]/10 text-[#028A60] border border-[#028A60]/20'
                    }`}>
                      {ann.priority} Priority
                    </span>
                    <span className="bg-[#0A0A0A] border border-[#222] text-gray-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase">
                      {ann.category}
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono">Date: {ann.date}</span>
                  </div>

                  <h4 className="text-sm font-serif italic text-white font-semibold">{ann.title}</h4>
                  <p className="text-xs text-gray-400 leading-normal">{ann.content}</p>
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

      {/* 5. PASSWORDS & SECURITY SELF GENERATOR TAB */}
      {activeTab === 'security' && (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-lg max-w-lg space-y-4">
          <h2 className="text-xl font-serif italic text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-[#028A60]" />
            Instructor Keys Passwords Self-Generation
          </h2>
          <p className="text-xs text-gray-400">Manage your active password passphrase logic or generate a modern randomized key.</p>

          <form onSubmit={handleApplyTeacherPassword} className="space-y-4 pt-2">
            
            {teacherSecurityFeedback && (
              <div id="teacher-security-feedback" className="p-3 bg-emerald-950/20 border border-emerald-900 text-[#028A60] text-xs font-mono font-bold rounded">
                {teacherSecurityFeedback}
              </div>
            )}

            <div className="bg-[#141414] p-3 border border-[#222] rounded text-xs font-mono space-y-1">
              <span className="block text-[#028A60] font-bold text-[9px] uppercase tracking-wider">🔒 Current Session details</span>
              <p className="text-gray-400">
                Instructor Register Name: <strong className="text-white font-serif italic">{activeTeacher.name}</strong><br/>
                Assigned Username: <strong className="text-white">{activeTeacher.username}</strong><br/>
                Active Pass-phrase Key: <strong className="text-[#02A875]">{activeTeacher.password}</strong>
              </p>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-gray-400 font-mono tracking-wider mb-1.5">New Pass-key Code:</label>
              <input 
                type="text"
                required
                placeholder="Type new Instructor Passphrase..."
                value={newTeacherPassword}
                onChange={(e) => {
                  setNewTeacherPassword(e.target.value);
                  setTeacherSecurityFeedback('');
                }}
                className="w-full bg-[#070707] border border-[#222] text-xs py-2 px-3 text-white outline-none rounded focus:border-[#028A60]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-gray-400 font-mono tracking-wider mb-1.5">Verify Pass-key Code:</label>
              <input 
                type="text"
                required
                placeholder="Verify new Instructor Passphrase..."
                value={confirmTeacherPassword}
                onChange={(e) => {
                  setConfirmTeacherPassword(e.target.value);
                  setTeacherSecurityFeedback('');
                }}
                className="w-full bg-[#070707] border border-[#222] text-xs py-2 px-3 text-white outline-none rounded focus:border-[#028A60]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-1 text-xs">
              <button
                type="submit"
                className="py-2 px-4 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] font-mono font-bold uppercase rounded cursor-pointer"
              >
                Apply Gate Passphrase
              </button>

              <button
                type="button"
                onClick={handleGenerateTeacherSecurePassword}
                className="py-2 px-4 bg-transparent hover:bg-[#111] border border-[#222] text-gray-300 font-mono uppercase rounded cursor-pointer"
              >
                Generate Secure Key Phrases
              </button>
            </div>

            <p className="text-[10px] text-gray-500 font-serif italic leading-relaxed pt-2">
              Note: Instructors usernames can only be customized inside the Admin Deck dashboard. Make sure to record key phrases carefully before signing out.
            </p>

          </form>
        </div>
      )}

    </div>
  );
}

// ==========================================
// INTERACTIVE SESSION ATTENDANCE DRAFT COMPONENT
// ==========================================
interface AttendanceRegisterEditorProps {
  key?: string;
  students: Student[];
  attendanceClass: string;
  attendanceDate: string;
  onSave: (records: Record<string, 'Present' | 'Absent' | 'Late'>) => void;
  isDarkMode?: boolean;
}

function AttendanceRegisterEditor({
  students,
  attendanceClass,
  attendanceDate,
  onSave,
  isDarkMode = false
}: AttendanceRegisterEditorProps) {
  const classStudents = students.filter(s => s.gradeClass === attendanceClass);

  const [draft, setDraft] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>(() => {
    const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    classStudents.forEach(s => {
      const existing = s.attendance.find(a => a.date === attendanceDate);
      initial[s.id] = existing ? existing.status : 'Present';
    });
    return initial;
  });

  const handleMarkAllStatus = (status: 'Present' | 'Absent' | 'Late') => {
    const nextDraft = { ...draft };
    classStudents.forEach(s => {
      nextDraft[s.id] = status;
    });
    setDraft(nextDraft);
  };

  const handleSingleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setDraft(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  return (
    <div className="space-y-4">
      {/* Batch control shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0A] border border-[#1A1A1A] p-3 rounded">
        <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Batch Shortcuts:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleMarkAllStatus('Present')}
            className="px-2.5 py-1 bg-[#028A60]/10 border border-[#028A60]/40 text-[#028A60] hover:bg-[#028A60]/20 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
          >
            Mark All Present ✔
          </button>
          <button
            type="button"
            onClick={() => handleMarkAllStatus('Late')}
            className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500/20 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
          >
            Mark All Late ⏳
          </button>
          <button
            type="button"
            onClick={() => handleMarkAllStatus('Absent')}
            className="px-2.5 py-1 bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500/20 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
          >
            Mark All Absent ✖
          </button>
        </div>
      </div>

      {/* Table block */}
      <div className="overflow-x-auto w-full border border-[#1A1A1A] bg-[#0A0A0A] rounded-lg">
        <table className="w-full text-left border-collapse font-mono text-xs text-slate-300">
          <thead>
            <tr className="bg-[#111] border-b border-[#1A1A1A] text-gray-400 uppercase text-[9px] font-bold tracking-wider">
              <th className="p-3">ID / Roll No</th>
              <th className="p-3">Student Full Name</th>
              <th className="p-3">Subjects Enrolled</th>
              <th className="p-3 text-center">Attendance Session Status Selector</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151515]">
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-xs text-gray-500 italic font-serif">
                  No students registered inside {attendanceClass}. Enroll pupils from the Admin console first.
                </td>
              </tr>
            ) : (
              classStudents.map(student => {
                const currentVal = draft[student.id] || 'Present';
                return (
                  <tr key={student.id} className="hover:bg-[#111]/40 transition-colors">
                    <td className="p-3 text-gray-400 font-bold">{student.id}</td>
                    <td className="p-3 text-white font-medium">{student.name}</td>
                    <td className="p-3 text-gray-500 text-[10px] truncate max-w-xs animate-none" title={student.subjects.join(', ')}>
                      {student.subjects.join(', ')}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex rounded p-0.5 bg-[#070707] border border-[#222]">
                        <button
                          type="button"
                          onClick={() => handleSingleStatusChange(student.id, 'Present')}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase font-mono transition-all rounded ${
                            currentVal === 'Present'
                              ? 'bg-[#028A60] text-[#0A0A0A] font-extrabold shadow'
                              : 'text-gray-400 hover:text-white cursor-pointer'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSingleStatusChange(student.id, 'Late')}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase font-mono transition-all rounded ${
                            currentVal === 'Late'
                              ? 'bg-amber-500 text-slate-900 font-extrabold shadow'
                              : 'text-gray-400 hover:text-white cursor-pointer'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSingleStatusChange(student.id, 'Absent')}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase font-mono transition-all rounded ${
                            currentVal === 'Absent'
                              ? 'bg-red-500 text-white font-extrabold shadow'
                              : 'text-gray-400 hover:text-white cursor-pointer'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {classStudents.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="px-6 py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] text-xs font-bold font-mono uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer"
          >
            ✔ Complete & Publish Attendance Ledger
          </button>
        </div>
      )}
    </div>
  );
}
