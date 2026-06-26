/** Each interview question is worth exactly 1 mark. Total = question count (10). */

export const MARKS_PER_QUESTION = 1;

export function marksFromEvaluation(parsed) {
  if (!parsed || typeof parsed !== 'object') return 0;
  if (parsed.marks === 1 || parsed.marks === '1' || parsed.passed === true) return 1;
  if (parsed.marks === 0 || parsed.marks === '0' || parsed.passed === false) return 0;
  if (typeof parsed.score === 'number') {
    if (parsed.score <= 1) return parsed.score >= 1 ? 1 : 0;
    return parsed.score >= 60 ? 1 : 0;
  }
  return 0;
}

export function sumInterviewMarks(questions) {
  const totalMarks = questions.length;
  const marksObtained = questions.reduce(
    (sum, q) => sum + (q.score === 1 ? MARKS_PER_QUESTION : 0),
    0
  );
  return { marksObtained, totalMarks };
}

export function marksToPercent(marksObtained, totalMarks) {
  if (!totalMarks) return 0;
  return Math.round((marksObtained / totalMarks) * 100);
}
