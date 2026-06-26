import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config/index.js';
import { marksFromEvaluation, sumInterviewMarks, marksToPercent, MARKS_PER_QUESTION } from '../utils/interviewScoring.js';

let model = null;
let warnedMissingKey = false;

export const isAIConfigured = () => Boolean(config.geminiApiKey);

const getModel = () => {
  if (!model) {
    if (!config.geminiApiKey) {
      if (!warnedMissingKey) {
        console.warn('GEMINI_API_KEY not set. Add your key to server/.env — AI features use basic fallback until then.');
        warnedMissingKey = true;
      }
      return null;
    }
    model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: config.geminiApiKey,
      temperature: 0.7,
      maxOutputTokens: 4096,
    });
  }
  return model;
};

const parseJSON = (text) => {
  if (!text || typeof text !== 'string') return null;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const generateAIResponse = async (systemPrompt, userPrompt) => {
  const ai = getModel();
  if (!ai) {
    return null;
  }

  try {
    const response = await ai.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);
    return response.content;
  } catch (error) {
    console.error('AI generation error:', error.message);
    if (error.message?.includes('model') && model) {
      model = new ChatGoogleGenerativeAI({
        model: 'gemini-1.5-flash',
        apiKey: config.geminiApiKey,
        temperature: 0.7,
        maxOutputTokens: 4096,
      });
      try {
        const retry = await model.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ]);
        return retry.content;
      } catch (retryErr) {
        console.error('AI retry error:', retryErr.message);
      }
    }
    return null;
  }
};

export const analyzeResume = async (resumeText) => {
  const systemPrompt = `You are an expert ATS resume analyzer. Analyze resumes and return ONLY valid JSON with this structure:
{
  "skills": ["skill1", "skill2"],
  "projects": [{"name": "", "description": "", "technologies": []}],
  "education": [{"degree": "", "institution": "", "year": ""}],
  "experience": [{"company": "", "role": "", "duration": "", "description": ""}],
  "contact": {"email": "", "phone": "", "linkedin": ""},
  "atsScore": 0-100,
  "resumeScore": 0-100,
  "missingKeywords": [],
  "suggestions": [],
  "strengths": [],
  "weaknesses": []
}`;

  const result = await generateAIResponse(systemPrompt, `Analyze this resume:\n\n${resumeText}`);
  const parsed = parseJSON(result);

  if (parsed) return parsed;

  return getFallbackResumeAnalysis(resumeText);
};

export const analyzeSkillGap = async (skills, targetRole, jobDescription) => {
  const systemPrompt = `You are a career coach. Compare skills against a job role. Return ONLY valid JSON:
{
  "matchedSkills": [],
  "missingSkills": [{"skill": "", "priority": "high|medium|low", "resources": []}],
  "matchPercentage": 0-100,
  "roadmap": [{"week": 1, "topics": [], "resources": [], "completed": false}]
}`;

  const userPrompt = `Skills: ${skills.join(', ')}\nTarget Role: ${targetRole}\nJob Description: ${jobDescription}`;
  const result = await generateAIResponse(systemPrompt, userPrompt);
  return parseJSON(result) || getFallbackSkillGap(skills, targetRole);
};

export const generateInterviewQuestion = async (type, difficulty, context = {}) => {
  const types = {
    hr: 'HR/screening',
    technical: 'technical coding and system design',
    behavioral: 'behavioral STAR method',
    faang: 'FAANG-level rigorous',
    startup: 'startup founder culture-fit',
  };

  const role = context.targetRole || 'Software Engineer';
  const skills = context.skills?.length ? context.skills.join(', ') : 'general professional skills';

  const systemPrompt = `Generate one ${types[type] || type} interview question at ${difficulty} difficulty for a ${role} candidate with skills: ${skills}. Return ONLY JSON: {"question": "..."}`;
  const userPrompt = context.previousQuestions?.length
    ? `Previous questions: ${context.previousQuestions.join('; ')}. Generate a different question tailored to ${role}.`
    : `Generate the first question for a ${role} interview.`;

  const result = await generateAIResponse(systemPrompt, userPrompt);
  const parsed = parseJSON(result);
  return parsed?.question || getFallbackQuestion(type, difficulty, role, context.index || 0);
};

export const generateInterviewQuestionSet = async (type, difficulty, targetRole, skills = [], count = 10) => {
  const types = {
    hr: 'HR/screening',
    technical: 'technical coding and system design',
    behavioral: 'behavioral STAR method',
    faang: 'FAANG-level rigorous',
    startup: 'startup founder culture-fit',
  };

  const skillList = skills.length ? skills : ['Core role fundamentals'];
  const skillsStr = skillList.join(', ');

  const systemPrompt = `You are a senior hiring manager conducting a ${types[type] || type} interview ONLY for the "${targetRole}" position.

STRICT RULES — follow every rule:
1. Generate exactly ${count} questions.
2. Each question MUST test exactly ONE skill from this list ONLY: [${skillsStr}]
3. Do NOT mention or test any skill outside that list.
4. Do NOT ask generic questions unrelated to ${targetRole} or the selected skills.
5. Questions must match ${type} interview style at ${difficulty} difficulty.
6. Distribute questions across the listed skills (each skill used at least once if possible).
7. No duplicate topics.

Return ONLY JSON:
{"questions": [{"question": "...", "skillArea": "exact skill name from the list"}]}`;

  const result = await generateAIResponse(
    systemPrompt,
    `Create ${count} ${type} questions for ${targetRole}. Skills to cover: ${skillsStr}.`
  );
  const parsed = parseJSON(result);
  const raw = parsed?.questions?.filter((q) => q?.question);

  if (raw?.length >= count) {
    return normalizeQuestionSet(raw.slice(0, count), skillList, type, targetRole);
  }

  return getFallbackQuestionSet(type, targetRole, skillList, count);
};

function normalizeQuestionSet(items, skillList, type, targetRole) {
  return items.map((item, i) => {
    const q = typeof item === 'string' ? item : item.question;
    const skillArea = (typeof item === 'object' && skillList.includes(item.skillArea))
      ? item.skillArea
      : skillList[i % skillList.length];
    return { question: q, skillArea };
  });
}

export const evaluateInterviewAnswer = async (question, answer, type, context = {}) => {
  const role = context.targetRole || 'Software Engineer';
  const skills = context.skills?.length ? context.skills.join(', ') : '';
  const skillArea = context.skillArea || '';

  const systemPrompt = `Evaluate this interview answer for a ${role} role${skills ? ` (focus skills: ${skills})` : ''}${skillArea ? `. This question tests: ${skillArea}` : ''}.

This question is worth exactly ${MARKS_PER_QUESTION} mark (0 or 1 only).
Award 1 mark if the answer is correct, relevant, and demonstrates adequate knowledge.
Award 0 marks if vague, incorrect, off-topic, or too short to evaluate.

Return ONLY JSON:
{"feedback": "2-3 sentences", "marks": 0 or 1, "passed": true or false, "issue": "main weakness if 0 marks", "suggestion": "improvement tip", "spokenReply": "2-sentence response as Alex"}`;

  const result = await generateAIResponse(
    systemPrompt,
    `Interview type: ${type}\nQuestion: ${question}\nAnswer: ${answer}`
  );
  const parsed = parseJSON(result);
  const heuristicMarks = heuristicInterviewMarks(answer);
  const marks = parsed ? marksFromEvaluation(parsed) : heuristicMarks;
  const fallback = {
    feedback: marks ? 'Good answer for this skill area.' : 'Answer needs more depth and examples.',
    marks,
    score: marks,
    passed: marks === 1,
    issue: marks ? '' : 'Answer lacked concrete detail',
    suggestion: marks ? '' : 'Use the STAR method with specific metrics.',
  };
  if (!parsed) {
    return { ...fallback, spokenReply: getSpokenReply(marks, fallback.feedback), aiPowered: false };
  }
  const finalMarks = marksFromEvaluation(parsed);
  return {
    feedback: parsed.feedback || fallback.feedback,
    marks: finalMarks,
    score: finalMarks,
    passed: finalMarks === 1,
    issue: parsed.issue || fallback.issue,
    suggestion: parsed.suggestion || fallback.suggestion,
    spokenReply: parsed.spokenReply || getSpokenReply(finalMarks, parsed.feedback || fallback.feedback),
  };
};

export const generateWelcomeSpeech = (type, question, targetRole = 'this role') => {
  const intros = {
    hr: `Hello! I'm Alex, your AI interviewer. I'll conduct a structured 10-question HR screening for ${targetRole}. Take your time with each answer.`,
    technical: `Hi! I'm Alex. We'll go through 10 technical questions tailored for ${targetRole}. Think out loud when helpful.`,
    behavioral: `Welcome! I'm Alex. Today we have 10 behavioral questions for ${targetRole} using the STAR method.`,
    faang: `Hello! I'm Alex, simulating a rigorous 10-question FAANG-style interview for ${targetRole}.`,
    startup: `Hey! I'm Alex. We'll cover 10 startup-style questions for ${targetRole} — culture fit and grit matter here.`,
  };
  const intro = intros[type] || intros.hr;
  return `${intro} Question 1: ${question}`;
};

export const generateTransitionSpeech = (evaluation, nextQuestion, questionNumber, totalQuestions) => {
  const marks = evaluation.marks ?? evaluation.score ?? 0;
  const feedback = evaluation.feedback || 'Thank you.';
  const markText = marks === 1 ? 'You earned 1 mark.' : 'No mark for that one.';

  if (!nextQuestion) {
    return `${markText} That was the final question. Generating your interview report now.`;
  }

  return `${markText} ${feedback} Question ${questionNumber} of ${totalQuestions}: ${nextQuestion}`;
};

function getSpokenReply(marks, feedback) {
  if (marks === 1) return `Good answer — 1 mark. ${feedback}`;
  return `Thanks for sharing — 0 marks on that one. ${feedback}`;
}

function heuristicInterviewMarks(answer) {
  const text = (answer || '').trim();
  if (text.length < 20) return 0;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 6) return 0;
  const lower = text.toLowerCase();
  const vague = ['idk', "i don't know", 'not sure', 'no idea', 'dont know'];
  if (vague.some((phrase) => lower.includes(phrase))) return 0;
  return 1;
}

export const analyzeVoiceTranscript = async (transcript) => {
  const systemPrompt = `Analyze interview speech transcript. Return ONLY JSON:
{
  "communicationScore": 0-100,
  "confidenceScore": 0-100,
  "fillerWords": [{"word": "um", "count": 0}],
  "strengths": [],
  "improvements": []
}`;
  const result = await generateAIResponse(systemPrompt, `Transcript:\n${transcript}`);
  return parseJSON(result) || {
    communicationScore: 70,
    confidenceScore: 65,
    fillerWords: [{ word: 'um', count: 3 }],
    strengths: ['Clear articulation'],
    improvements: ['Reduce filler words'],
  };
};

export const reviewCode = async (code, language, problem) => {
  const systemPrompt = `You are a senior engineer reviewing code. Return ONLY JSON:
{
  "correctness": 0-100,
  "efficiency": "",
  "timeComplexity": "",
  "spaceComplexity": "",
  "suggestions": [],
  "score": 0-100
}`;
  const result = await generateAIResponse(
    systemPrompt,
    `Language: ${language}\nProblem: ${problem}\nCode:\n${code}`
  );
  return parseJSON(result) || {
    correctness: 70,
    efficiency: 'Acceptable',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    suggestions: ['Add edge case handling', 'Consider optimization'],
    score: 70,
  };
};

export const predictCareer = async (resumeData, targetRole) => {
  const systemPrompt = `Career prediction AI. Return ONLY JSON:
{
  "placementReadiness": 0-100,
  "careerMatches": [{"role": "", "matchScore": 0-100, "reasoning": ""}],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "marketInsights": ""
}`;
  const result = await generateAIResponse(
    systemPrompt,
    `Resume: ${JSON.stringify(resumeData)}\nTarget: ${targetRole || 'Software Engineer'}`
  );
  return parseJSON(result) || getFallbackCareerPrediction();
};

export const generateRoadmap = async (targetRole, skills, missingSkills) => {
  const systemPrompt = `Learning roadmap generator. Return ONLY JSON:
{
  "title": "",
  "targetRole": "",
  "duration": "12 weeks",
  "phases": [{"phase": 1, "title": "", "weeks": 4, "topics": [{"name": "", "completed": false, "resources": []}], "milestones": []}]
}`;
  const result = await generateAIResponse(
    systemPrompt,
    `Role: ${targetRole}\nCurrent Skills: ${skills.join(', ')}\nGaps: ${missingSkills.join(', ')}`
  );
  return parseJSON(result) || getFallbackRoadmap(targetRole);
};

export const completeInterviewAnalysis = async (questions, context = {}) => {
  const role = context.targetRole || 'Software Engineer';
  const skills = context.skills?.length ? context.skills.join(', ') : '';
  const type = context.type || 'interview';
  const { marksObtained, totalMarks } = sumInterviewMarks(questions);

  const systemPrompt = `You are an expert interview coach. Analyze this completed ${type} interview for "${role}"${skills ? ` (skills: ${skills})` : ''}.
Each question was worth 1 mark. Candidate scored ${marksObtained} out of ${totalMarks} marks.

Return ONLY JSON:
{
  "strengths": ["2-4 strengths"],
  "improvements": ["3-5 recommendations to improve for ${role}"],
  "mistakes": [{"question": "", "yourAnswer": "", "issue": "", "suggestion": "", "marks": 0, "skillArea": ""}],
  "bestAnswers": [{"question": "", "yourAnswer": "", "highlight": "", "marks": 1, "skillArea": ""}],
  "summary": "2 sentences summarizing ${marksObtained}/${totalMarks} marks performance"
}

RULES:
- mistakes = questions where marks = 0
- bestAnswers = questions where marks = 1
- improvements = actionable recommendations`;

  const payload = questions.map((q) => ({
    question: q.question,
    answer: q.answer,
    marks: q.score === 1 ? 1 : 0,
    feedback: q.feedback,
    issue: q.issue,
    suggestion: q.suggestion,
    skillArea: q.skillArea,
  }));

  const result = await generateAIResponse(systemPrompt, JSON.stringify(payload));
  const parsed = parseJSON(result);

  const fallbackMistakes = questions
    .filter((q) => q.score !== 1)
    .map((q) => ({
      question: q.question,
      yourAnswer: q.answer || '',
      issue: q.issue || q.feedback || 'Did not earn the mark for this question',
      suggestion: q.suggestion || 'Study this skill area and practice with examples',
      marks: 0,
      score: 0,
      skillArea: q.skillArea || '',
    }));

  const fallbackBest = questions
    .filter((q) => q.score === 1)
    .map((q) => ({
      question: q.question,
      yourAnswer: q.answer || '',
      highlight: q.feedback || 'Earned full mark',
      marks: 1,
      score: 1,
      skillArea: q.skillArea || '',
    }));

  const pct = marksToPercent(marksObtained, totalMarks);

  const fallback = {
    marksObtained,
    totalMarks,
    overallScore: marksObtained,
    communicationScore: pct,
    technicalScore: pct,
    confidenceScore: pct,
    strengths: fallbackBest.length
      ? fallbackBest.slice(0, 3).map((b) => `${b.skillArea || 'Q'}: ${b.highlight}`)
      : ['Keep practicing to earn more marks'],
    improvements: fallbackMistakes.length
      ? fallbackMistakes.slice(0, 5).map((m) => m.suggestion)
      : ['Maintain this performance in real interviews'],
    mistakes: fallbackMistakes,
    bestAnswers: fallbackBest,
    summary: `You scored ${marksObtained} out of ${totalMarks} marks in your ${role} interview.`,
  };

  if (!parsed) return fallback;

  return {
    ...fallback,
    ...parsed,
    marksObtained,
    totalMarks,
    overallScore: marksObtained,
    communicationScore: pct,
    technicalScore: pct,
    confidenceScore: pct,
    mistakes: parsed.mistakes?.length ? parsed.mistakes : fallbackMistakes,
    bestAnswers: parsed.bestAnswers?.length ? parsed.bestAnswers : fallbackBest,
    improvements: parsed.improvements?.length ? parsed.improvements : fallback.improvements,
  };
};

function getFallbackResumeAnalysis(text) {
  const skills = extractSkillsFromText(text);
  return {
    skills,
    projects: [{ name: 'Sample Project', description: 'Extracted from resume', technologies: skills.slice(0, 3) }],
    education: [{ degree: 'Bachelor\'s', institution: 'University', year: '2024' }],
    experience: [],
    contact: { email: '', phone: '', linkedin: '' },
    atsScore: Math.min(60 + skills.length * 3, 95),
    resumeScore: Math.min(55 + skills.length * 4, 90),
    missingKeywords: ['leadership', 'agile', 'cloud'].filter((k) => !text.toLowerCase().includes(k)),
    suggestions: ['Add quantifiable achievements', 'Include more action verbs', 'Optimize for ATS keywords'],
    strengths: skills.length ? [`Strong ${skills[0]} skills`] : ['Good structure'],
    weaknesses: ['Could add more metrics'],
  };
}

function extractSkillsFromText(text) {
  const known = ['javascript', 'python', 'react', 'node', 'java', 'sql', 'aws', 'docker', 'typescript', 'mongodb', 'css', 'html', 'git', 'c++', 'kubernetes'];
  const lower = text.toLowerCase();
  return known.filter((s) => lower.includes(s)).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

function getFallbackSkillGap(skills, targetRole) {
  const allSkills = ['System Design', 'Kubernetes', 'GraphQL', 'CI/CD', 'Leadership'];
  const matched = skills.filter((s) => allSkills.some((a) => a.toLowerCase().includes(s.toLowerCase())));
  const missing = allSkills.filter((s) => !skills.some((sk) => sk.toLowerCase().includes(s.toLowerCase())));
  return {
    matchedSkills: matched.length ? matched : skills.slice(0, 3),
    missingSkills: missing.map((s) => ({ skill: s, priority: 'high', resources: [`Learn ${s} on Coursera`, `${s} documentation`] })),
    matchPercentage: Math.round((matched.length / allSkills.length) * 100) || 65,
    roadmap: [{ week: 1, topics: missing.slice(0, 2), resources: ['Online course'], completed: false }],
  };
}

function getFallbackQuestion(type, difficulty, role = 'Software Engineer', index = 0) {
  const set = getFallbackQuestionSet(type, role, [], 10);
  return set[index % set.length]?.question || `(${difficulty}) Tell me why you're a strong fit for ${role}.`;
}

function getFallbackQuestionSet(type, targetRole, skills = [], count = 10) {
  const skillList = skills.length ? skills : ['Role fundamentals'];
  const items = [];

  for (let i = 0; i < count; i++) {
    const skill = skillList[i % skillList.length];
    items.push({
      question: buildSkillAreaQuestion(type, targetRole, skill, i),
      skillArea: skill,
    });
  }

  return items;
}

function buildSkillAreaQuestion(type, targetRole, skill, index) {
  const templates = {
    hr: [
      `Why is your experience with ${skill} relevant to the ${targetRole} role?`,
      `How have you applied ${skill} in a professional setting for a ${targetRole} position?`,
      `Describe a situation where ${skill} helped you succeed as a ${targetRole}.`,
    ],
    technical: [
      `Explain a real project where you used ${skill} as a ${targetRole}. What challenges did you face?`,
      `How would you evaluate trade-offs when using ${skill} in a production ${targetRole} codebase?`,
      `Walk me through debugging a difficult issue related to ${skill} in your ${targetRole} work.`,
    ],
    behavioral: [
      `Tell me about a time you had to improve your ${skill} skills for a ${targetRole} project. What was the outcome?`,
      `Describe a conflict or blocker involving ${skill} and how you resolved it as a ${targetRole}.`,
      `Give a STAR example where ${skill} was critical to your success in a ${targetRole} role.`,
    ],
    faang: [
      `Design a system component for ${targetRole} that heavily relies on ${skill}. How do you ensure scale and reliability?`,
      `How would you optimize performance when ${skill} becomes a bottleneck in a large-scale ${targetRole} system?`,
      `Explain a distributed-system trade-off involving ${skill} relevant to ${targetRole} at scale.`,
    ],
    startup: [
      `How would you ship an MVP fast using ${skill} as a ${targetRole} in a startup environment?`,
      `Describe wearing multiple hats: how does ${skill} help you deliver as a ${targetRole} with limited resources?`,
      `Tell me about prioritizing ${skill} work when requirements change weekly at a startup.`,
    ],
  };

  const pool = templates[type] || templates.technical;
  return pool[index % pool.length];
}

function getFallbackCareerPrediction() {
  return {
    placementReadiness: 72,
    careerMatches: [
      { role: 'Full Stack Developer', matchScore: 85, reasoning: 'Strong web development skills' },
      { role: 'Backend Engineer', matchScore: 78, reasoning: 'Good server-side experience' },
      { role: 'DevOps Engineer', matchScore: 60, reasoning: 'Some cloud exposure' },
    ],
    strengths: ['Technical foundation', 'Project experience'],
    weaknesses: ['System design depth', 'Leadership experience'],
    recommendations: ['Practice system design', 'Contribute to open source', 'Build portfolio projects'],
    marketInsights: 'Full-stack developers remain in high demand with 15% YoY growth.',
  };
}

function getFallbackRoadmap(targetRole) {
  return {
    title: `${targetRole} Learning Path`,
    targetRole,
    duration: '12 weeks',
    phases: [
      {
        phase: 1,
        title: 'Foundations',
        weeks: 4,
        topics: [
          { name: 'Core Concepts', completed: false, resources: ['MDN Docs', 'freeCodeCamp'] },
          { name: 'Data Structures', completed: false, resources: ['LeetCode', 'NeetCode'] },
        ],
        milestones: ['Complete 20 coding problems'],
      },
      {
        phase: 2,
        title: 'Advanced Skills',
        weeks: 4,
        topics: [
          { name: 'System Design', completed: false, resources: ['Designing Data-Intensive Applications'] },
          { name: 'Cloud & DevOps', completed: false, resources: ['AWS Free Tier', 'Docker Docs'] },
        ],
        milestones: ['Build a full-stack project'],
      },
      {
        phase: 3,
        title: 'Interview Prep',
        weeks: 4,
        topics: [
          { name: 'Mock Interviews', completed: false, resources: ['InterviewIQ AI'] },
          { name: 'Behavioral Prep', completed: false, resources: ['STAR Method Guide'] },
        ],
        milestones: ['Score 80+ on mock interviews'],
      },
    ],
  };
}
