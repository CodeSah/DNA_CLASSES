import { Student, SubjectMark, ExamMark } from '../types';

/**
 * Robust CSV parser that handles:
 * 1. Double quotes around fields with commas
 * 2. Case-insensitive header mapping
 * 3. Raw scores (e.g., 90) or fractional scores (e.g., 90/100)
 * 4. Flexible subject columns scaled to the 5 designated exam types
 */
export function parseCSVToStudents(csvText: string): Student[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("The CSV file is empty or does not have at least a header row and one data row.");
  }

  // Parse a single line respecting double quotes
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
       const char = line[i];
       if (char === '"') {
         inQuotes = !inQuotes;
       } else if (char === ',' && !inQuotes) {
         result.push(current.trim());
         current = '';
       } else {
         current += char;
       }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
  const studentsList: Student[] = [];

  // Find index of essential columns
  const idIdx = headers.findIndex(h => h.includes('id') || h.includes('roll') || h.includes('candidate') || h.includes('enrolment') || h.includes('enroll'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student'));
  const classIdx = headers.findIndex(h => h.includes('class') || h.includes('grade') || h.includes('division'));
  const pwdIdx = headers.findIndex(h => h.includes('password') || h.includes('pass') || h.includes('credential') || h.includes('key'));
  const remarksIdx = headers.findIndex(h => h.includes('remark') || h.includes('appraisal') || h.includes('general'));

  if (idIdx === -1 || nameIdx === -1) {
    throw new Error("CSV requires at least an 'id' (or enrollment) and a 'name' column. Please check your spreadsheet column names.");
  }

  // Parse candidate list records
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length < Math.max(idIdx, nameIdx) + 1) continue;

    const id = cells[idIdx].toUpperCase().trim();
    const name = cells[nameIdx].trim();
    if (!id || !name) continue;

    const gradeClass = classIdx !== -1 && cells[classIdx] ? cells[classIdx].trim() : 'Class 10';
    const password = pwdIdx !== -1 && cells[pwdIdx] ? cells[pwdIdx].trim() : 'password123';
    const generalRemarks = remarksIdx !== -1 && cells[remarksIdx] ? cells[remarksIdx].trim() : 'Attested scorecard.';

    // Any cell column that is not matched as a base property represents a subject
    const marksBySubject: SubjectMark[] = [];
    headers.forEach((header, idx) => {
      if (
        idx === idIdx ||
        idx === nameIdx ||
        idx === classIdx ||
        idx === pwdIdx ||
        idx === remarksIdx ||
        !header ||
        idx >= cells.length
      ) {
        return;
      }

      const valStr = cells[idx].trim();
      if (!valStr) return; // ignore empty cells

      let obtainedScore = 0;
      let totalScore = 100;

      // Extract raw score e.g., "85/100" or simple "85"
      if (valStr.includes('/')) {
        const parts = valStr.split('/');
        obtainedScore = parseInt(parts[0]) || 0;
        totalScore = parseInt(parts[1]) || 100;
      } else {
        obtainedScore = parseInt(valStr) || 0;
      }

      // Prettify subject header
      const subjectName = header
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Scale proportionally across the 5 specific exam templates
      const exams: ExamMark[] = [
        { 
          examType: 'Self Evaluation Test', 
          totalScore: 25, 
          passScore: 10, 
          obtainedScore: Math.round(obtainedScore * (25 / totalScore)),
          remarks: 'Imported Score Sheet'
        },
        { 
          examType: 'Weekly Test', 
          totalScore: 25, 
          passScore: 10, 
          obtainedScore: Math.round(obtainedScore * (25 / totalScore)),
          remarks: 'Imported Score Sheet'
        },
        { 
          examType: 'Monthly Test', 
          totalScore: 40, 
          passScore: 18, 
          obtainedScore: Math.round(obtainedScore * (40 / totalScore)),
          remarks: 'Imported Score Sheet'
        },
        { 
          examType: 'Terminal', 
          totalScore: 50, 
          passScore: 20, 
          obtainedScore: Math.round(obtainedScore * (50 / totalScore)),
          remarks: 'Imported Score Sheet'
        },
        { 
          examType: 'Scholarship Exam', 
          totalScore: 75, 
          passScore: 30, 
          obtainedScore: Math.round(obtainedScore * (75 / totalScore)),
          remarks: 'Imported Score Sheet'
        }
      ];

      marksBySubject.push({
        subject: subjectName,
        exams
      });
    });

    studentsList.push({
      id,
      username: id.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name,
      gradeClass,
      password,
      subjects: marksBySubject.map(m => m.subject),
      marksBySubject,
      attendance: [
        { date: new Date().toISOString().split('T')[0], status: 'Present' }
      ],
      isResultWithheld: false,
      generalRemarks
    });
  }

  return studentsList;
}
