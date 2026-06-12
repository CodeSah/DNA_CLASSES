import { Student, Announcement, Teacher, StudyMaterial, SubjectMark, ExamMark } from '../types';

export const EXAMS_CONFIG = {
  'Self Evaluation Test': { totalScore: 25, passScore: 10 },
  'Weekly Test': { totalScore: 25, passScore: 10 },
  'Monthly Test': { totalScore: 40, passScore: 18 },
  'Terminal': { totalScore: 50, passScore: 20 },
  'Scholarship Exam': { totalScore: 75, passScore: 30 }
} as const;

export const DEFAULT_SUBJECTS = [
  'Compulsory Mathematics',
  'Optional Mathematics',
  'Science'
];

export const CLASS_PRESETS = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 'TCH-001', name: 'Aatish Sah (Director)', username: 'aatish', password: 'teacher123' },
  { id: 'TCH-002', name: 'Janak Kishor (Senior Maths Instructor)', username: 'janak', password: 'math123' },
  { id: 'TCH-003', name: 'Dr. S. K. Yadav (Science Coach)', username: 'skyadav', password: 'science123' }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'SEE Preparation Super-30 Batch Open!',
    content: 'Registration is now open for our Class 10 super-intensive SEE revision cohort. Includes free practice sheet booklets, daily self-evaluation drills, and 3 mock terminal tests. Contact Director Aatish Sah to secure partial fee waiver discount coupons.',
    date: '2026-05-28',
    priority: 'high',
    category: 'Academics',
    active: true,
  },
  {
    id: 'ann-2',
    title: 'Class 11 & 12 Physics Mechanics Visual Lab Sessions',
    content: 'Director Aatish Sah will host special laboratory visualizations on projectile mechanisms, rotational dynamics, and organic synthesis. Recommended for pupils prepping for engineering tests.',
    date: '2026-05-26',
    priority: 'medium',
    category: 'Academics',
    active: true,
  },
  {
    id: 'ann-3',
    title: 'DNA Cash Scholarship Board Assessment Date',
    content: 'The major Monthly Diagnostic Scholarship Exam will take place next Wednesday. Candidates scoring more than 90% or above 68/75 will receive course vouchers & stationery packages.',
    date: '2026-05-24',
    priority: 'high',
    category: 'Events',
    active: true,
  }
];

// Helper to generate empty/default exam slots for a subject
export function generateDefaultExams(subjectName: string): ExamMark[] {
  return [
    { examType: 'Self Evaluation Test', totalScore: 25, passScore: 10, obtainedScore: undefined },
    { examType: 'Weekly Test', totalScore: 25, passScore: 10, obtainedScore: undefined },
    { examType: 'Monthly Test', totalScore: 40, passScore: 18, obtainedScore: undefined },
    { examType: 'Terminal', totalScore: 50, passScore: 20, obtainedScore: undefined },
    { examType: 'Scholarship Exam', totalScore: 75, passScore: 30, obtainedScore: undefined }
  ];
}

// Generate full subject marks with prefilled values for testing
export function createPrefabSubjectMarks(subject: string, scores: { self?: number, weekly?: number, monthly?: number, term?: number, scholar?: number }): SubjectMark {
  return {
    subject,
    exams: [
      { examType: 'Self Evaluation Test', totalScore: 25, passScore: 10, obtainedScore: scores.self, remarks: scores.self && scores.self >= 10 ? 'Passed with solid grasp.' : 'Needs revision.' },
      { examType: 'Weekly Test', totalScore: 25, passScore: 10, obtainedScore: scores.weekly, remarks: scores.weekly && scores.weekly >= 10 ? 'Good calculation speed.' : 'Equations practice needed.' },
      { examType: 'Monthly Test', totalScore: 40, passScore: 18, obtainedScore: scores.monthly, remarks: scores.monthly && scores.monthly >= 18 ? 'Passed nicely.' : 'Poor formulas execution.' },
      { examType: 'Terminal', totalScore: 50, passScore: 20, obtainedScore: scores.term, remarks: scores.term && scores.term >= 20 ? 'Strong analytical proofing.' : 'Failed, needs intensive remedial sessions.' },
      { examType: 'Scholarship Exam', totalScore: 75, passScore: 30, obtainedScore: scores.scholar, remarks: scores.scholar && scores.scholar >= 30 ? 'Scholarship eligible performance.' : 'Work hard next diagnostic.' }
    ]
  };
}

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'DNA-2026-001',
    username: 'aarav',
    name: 'Aarav Sharma',
    gradeClass: 'Class 10',
    password: 'password123',
    subjects: ['Compulsory Mathematics', 'Optional Mathematics', 'Science'],
    marksBySubject: [
      createPrefabSubjectMarks('Compulsory Mathematics', { self: 22, weekly: 20, monthly: 35, term: 44, scholar: 68 }),
      createPrefabSubjectMarks('Optional Mathematics', { self: 24, weekly: 21, monthly: 32, term: 45, scholar: 70 }),
      createPrefabSubjectMarks('Science', { self: 19, weekly: 18, monthly: 28, term: 38, scholar: 52 })
    ],
    attendance: [
      { date: '2026-05-20', status: 'Present' },
      { date: '2026-05-21', status: 'Present' },
      { date: '2026-05-22', status: 'Late' },
      { date: '2026-05-25', status: 'Present' },
      { date: '2026-05-26', status: 'Present' },
      { date: '2026-05-27', status: 'Absent' },
      { date: '2026-05-28', status: 'Present' }
    ],
    isResultWithheld: false,
    generalRemarks: 'Aarav is an outstanding student with a magnificent conceptual core in quadratic proofs and geometrical deductions. Keeps active classroom presence.'
  },
  {
    id: 'DNA-2026-002',
    username: 'priya',
    name: 'Priya Thapa',
    gradeClass: 'Class 10',
    password: 'password123',
    subjects: ['Compulsory Mathematics', 'Optional Mathematics', 'Science'],
    marksBySubject: [
      createPrefabSubjectMarks('Compulsory Mathematics', { self: 18, weekly: 17, monthly: 30, term: 39, scholar: 55 }),
      createPrefabSubjectMarks('Optional Mathematics', { self: 15, weekly: 19, monthly: 27, term: 34 }),
      createPrefabSubjectMarks('Science', { self: 20, weekly: 22, monthly: 34, term: 42, scholar: 64 })
    ],
    attendance: [
      { date: '2026-05-20', status: 'Present' },
      { date: '2026-05-21', status: 'Present' },
      { date: '2026-05-22', status: 'Present' },
      { date: '2026-05-25', status: 'Present' },
      { date: '2026-05-26', status: 'Late' },
      { date: '2026-05-27', status: 'Present' },
      { date: '2026-05-28', status: 'Present' }
    ],
    isResultWithheld: false,
    generalRemarks: 'Priya executes calculation sheets with great accuracy. Her physics formulas are very neat. Keeps perfect homework registers.'
  },
  {
    id: 'DNA-2026-003',
    username: 'rohan',
    name: 'Rohan Chaudhary',
    gradeClass: 'Class 11',
    password: 'password123',
    subjects: ['Compulsory Mathematics', 'Optional Mathematics', 'Science'],
    marksBySubject: [
      createPrefabSubjectMarks('Compulsory Mathematics', { self: 8, weekly: 12, monthly: 15, term: 18, scholar: 25 }), // Fails some tests
      createPrefabSubjectMarks('Optional Mathematics', { self: 12, weekly: 11, monthly: 19, term: 22, scholar: 31 }),
      createPrefabSubjectMarks('Science', { self: 15, weekly: 14, monthly: 22, term: 28, scholar: 41 })
    ],
    attendance: [
      { date: '2026-05-20', status: 'Present' },
      { date: '2026-05-21', status: 'Absent' },
      { date: '2026-05-22', status: 'Absent' },
      { date: '2026-05-25', status: 'Present' },
      { date: '2026-05-26', status: 'Present' },
      { date: '2026-05-27', status: 'Late' },
      { date: '2026-05-28', status: 'Present' }
    ],
    isResultWithheld: true, // Withheld for outstanding fees
    generalRemarks: 'Rohan is creative but frequently misses classes or self-evaluation test slots. He needs to catch up significantly on algebraic vectors.'
  }
];

const SAMPLE_PDF = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaidbXTUgMCBSIDIgMCBSXQoyIDAgb2JqJzw8L0tpZHNbMyAwIFJdL0NvdW50IDE+Pg0KMyAwIG9iaic8PC9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzIDQgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9Db250ZW50cyA2IDAgUj4+DQo0IDAgb2JqJzw8L0ZvbnQ8PC9GMSA1IDAgUj4+Pj4NCjUgMCBvYmo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+Pg0KNiAwIG9iaic8PC9MZW5ndGggNTY+PnN0cmVhbQ0KQlQKL0YxIDEyIFRmDQoxMDAgODAwIFRkDQooRGV2IE5hcmF5YW4gQWNhZGVteSAtIFN0dWR5IE1hdGVyaWFsKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+DQolRU9G";

export const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Trigonometry Identities and Height/Distance Cheat Sheet',
    gradeClass: 'Class 10',
    subject: 'Compulsory Mathematics',
    fileName: 'Class10_Trig_FormulaBooklet.pdf',
    fileSize: '1.2 MB',
    downloadUrl: SAMPLE_PDF,
    uploadDate: '2026-05-26'
  },
  {
    id: 'mat-2',
    title: 'Class 10 Vector & Coordinate Geometry Board Formula Card',
    gradeClass: 'Class 10',
    subject: 'Optional Mathematics',
    fileName: 'Class10_OptMath_VectorFormulae.pdf',
    fileSize: '950 KB',
    downloadUrl: SAMPLE_PDF,
    uploadDate: '2026-05-25'
  },
  {
    id: 'mat-3',
    title: 'Class 11 Optics Refraction & Wave Theory Solved Practice Pack',
    gradeClass: 'Class 11',
    subject: 'Science',
    fileName: 'Class11_Science_OpticsRefraction.pdf',
    fileSize: '3.4 MB',
    downloadUrl: SAMPLE_PDF,
    uploadDate: '2026-05-24'
  },
  {
    id: 'mat-4',
    title: 'Organic Chemistry Reactions and Poly-Mechanisms Guide',
    gradeClass: 'Class 12',
    subject: 'Science',
    fileName: 'Class12_Science_OrganicChemistryGuide.pdf',
    fileSize: '2.8 MB',
    downloadUrl: SAMPLE_PDF,
    uploadDate: '2026-05-20'
  },
  {
    id: 'mat-5',
    title: 'HSEB Calculus Derivative Practice Core Worksheet',
    gradeClass: 'Class 12',
    subject: 'Compulsory Mathematics',
    fileName: 'Calculus_Differentiation_Drills.pdf',
    fileSize: '1.8 MB',
    downloadUrl: SAMPLE_PDF,
    uploadDate: '2026-05-18'
  }
];
