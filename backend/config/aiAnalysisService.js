/**
 * config/aiAnalysisService.js - AI Resume Analysis Engine
 *
 * WHAT: Core analysis engine that combines deterministic rule-based scoring with
 *       optional Hugging Face free-tier AI for qualitative feedback.
 * HOW:  1. Rule-based pass: keyword matching, structure detection, word-count
 *          heuristics → produces a numeric score breakdown.
 *       2. Hugging Face pass (if API key present): sends a prompt to the free
 *          text-generation inference endpoint for narrative feedback.
 *       3. Results are merged and returned as a structured object.
 * WHY:  Pure rule-based analysis is deterministic and always available.  The HF
 *       layer adds nuanced language when an API key is configured, without
 *       breaking the app when it isn't.
 */

const axios = require('axios');

// ── Comprehensive keyword lists ───────────────────────────────────────────────
const TECH_SKILLS = [
  'javascript','typescript','python','java','c++','c#','go','rust','ruby','php','swift','kotlin',
  'react','angular','vue','next.js','nuxt','node.js','express','django','flask','spring','laravel',
  'mongodb','postgresql','mysql','redis','elasticsearch','cassandra','dynamodb','firebase',
  'aws','azure','gcp','docker','kubernetes','terraform','ansible','jenkins','github actions',
  'git','rest api','graphql','grpc','microservices','sql','nosql','machine learning','deep learning',
  'tensorflow','pytorch','scikit-learn','pandas','numpy','data analysis','data science',
  'html','css','sass','tailwind','bootstrap','webpack','vite','babel',
  'linux','bash','powershell','agile','scrum','jira','confluence',
];

const SOFT_SKILLS = [
  'leadership','communication','teamwork','problem solving','critical thinking','adaptability',
  'creativity','time management','project management','collaboration','mentoring','presentation',
  'negotiation','analytical','detail-oriented','self-motivated','strategic','innovative',
];

const RESUME_SECTIONS = [
  { name: 'contact', patterns: ['email','phone','linkedin','github','address','contact'] },
  { name: 'summary', patterns: ['summary','objective','profile','about me','overview'] },
  { name: 'experience', patterns: ['experience','employment','work history','professional background','career'] },
  { name: 'education', patterns: ['education','degree','university','college','bachelor','master','phd','certification'] },
  { name: 'skills', patterns: ['skills','technologies','tools','competencies','expertise','proficiencies'] },
  { name: 'projects', patterns: ['projects','portfolio','personal projects','open source','github'] },
  { name: 'achievements', patterns: ['achievements','accomplishments','awards','honors','recognition'] },
  { name: 'certifications', patterns: ['certifications','certificates','licenses','credentials'] },
];

const INDUSTRY_KEYWORDS = {
  'Software Engineering': ['software','developer','engineer','coding','programming','api','backend','frontend'],
  'Data Science': ['data','analytics','machine learning','ai','model','pipeline','statistics','visualization'],
  'DevOps/Cloud': ['devops','cloud','ci/cd','deployment','infrastructure','kubernetes','docker'],
  'Design': ['design','ux','ui','figma','sketch','prototype','wireframe','user experience'],
  'Product Management': ['product','roadmap','stakeholder','backlog','sprint','kpi','strategy'],
  'Marketing': ['marketing','seo','campaign','brand','social media','analytics','growth'],
  'Finance': ['finance','accounting','budget','forecast','financial','audit','cpa'],
};

const POWER_WORDS = [
  'achieved','improved','reduced','increased','developed','created','managed','led','designed',
  'implemented','optimized','delivered','launched','built','architected','streamlined',
  'automated','collaborated','negotiated','spearheaded','executed','drove','scaled',
];

const WEAK_WORDS = [
  'responsible for','duties include','worked on','helped with','assisted with','involved in',
  'participated in','supported','familiar with',
];

// ── Rule-based analysis engine ────────────────────────────────────────────────
const analyzeWithRules = (text) => {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // ── 1. Skills detection ───────────────────────────────────────────────────
  const skillsFound = TECH_SKILLS.filter((s) => lower.includes(s));
  const softSkillsFound = SOFT_SKILLS.filter((s) => lower.includes(s));
  const allSkillsFound = [...new Set([...skillsFound, ...softSkillsFound])];

  // Missing keywords (important ones not found)
  const importantKeywords = [
    'github','linkedin','quantified results','metrics','team','agile',
    'communication','leadership','problem solving',
  ];
  const missingKeywords = importantKeywords.filter((k) => !lower.includes(k));

  // ── 2. Section detection ──────────────────────────────────────────────────
  const sectionsFound = RESUME_SECTIONS.filter(({ patterns }) =>
    patterns.some((p) => lower.includes(p))
  ).map((s) => s.name);

  const missingImportantSections = ['experience', 'education', 'skills', 'contact']
    .filter((s) => !sectionsFound.includes(s));

  // ── 3. Power word / weak word analysis ───────────────────────────────────
  const powerWordsFound = POWER_WORDS.filter((w) => lower.includes(w));
  const weakWordsFound = WEAK_WORDS.filter((w) => lower.includes(w));

  // ── 4. Quantification check (numbers in text) ─────────────────────────────
  const quantifiedMatches = (text.match(/\d+[%+]?|\$[\d,]+|[\d,]+\+/g) || []).length;
  const hasQuantification = quantifiedMatches > 2;

  // ── 5. Email & LinkedIn check ─────────────────────────────────────────────
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasLinkedIn = lower.includes('linkedin');
  const hasGitHub = lower.includes('github');

  // ── 6. Length scoring ─────────────────────────────────────────────────────
  let lengthScore = 0;
  if (wordCount >= 200 && wordCount <= 700) lengthScore = 100;
  else if (wordCount >= 100 && wordCount < 200) lengthScore = 65;
  else if (wordCount > 700 && wordCount <= 1000) lengthScore = 75;
  else if (wordCount < 100) lengthScore = 30;
  else lengthScore = 50;

  // ── Score Calculation ─────────────────────────────────────────────────────
  const formattingScore = Math.min(100, Math.round(
    (sectionsFound.length / RESUME_SECTIONS.length) * 60 +
    (hasEmail ? 15 : 0) +
    (hasLinkedIn ? 15 : 0) +
    (hasGitHub ? 10 : 0)
  ));

  const keywordsScore = Math.min(100, Math.round(
    (allSkillsFound.length / 10) * 60 +
    (powerWordsFound.length / 5) * 25 +
    (hasQuantification ? 15 : 0)
  ));

  const experienceScore = Math.min(100, Math.round(
    (sectionsFound.includes('experience') ? 40 : 0) +
    (sectionsFound.includes('projects') ? 20 : 0) +
    (hasQuantification ? 25 : 0) +
    (powerWordsFound.length > 3 ? 15 : 0)
  ));

  const educationScore = Math.min(100, Math.round(
    (sectionsFound.includes('education') ? 60 : 0) +
    (sectionsFound.includes('certifications') ? 20 : 0) +
    (lower.includes('bachelor') || lower.includes('master') || lower.includes('phd') ? 20 : 0)
  ));

  const skillsScore = Math.min(100, Math.round(
    Math.min(skillsFound.length * 8, 70) +
    Math.min(softSkillsFound.length * 5, 30)
  ));

  const overallScore = Math.round(
    formattingScore * 0.2 +
    keywordsScore   * 0.25 +
    experienceScore * 0.25 +
    educationScore  * 0.15 +
    skillsScore     * 0.15
  );

  // ── Industry detection ────────────────────────────────────────────────────
  const industryMatch = Object.entries(INDUSTRY_KEYWORDS)
    .filter(([_, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([industry]) => industry);

  // ── Experience level detection ────────────────────────────────────────────
  let experienceLevel = 'Unknown';
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) {
    experienceLevel = 'Senior Level';
  } else if (lower.includes('junior') || lower.includes('entry') || lower.includes('graduate') || lower.includes('intern')) {
    experienceLevel = 'Entry Level';
  } else if (lower.includes('manager') || lower.includes('director') || lower.includes('vp') || lower.includes('chief')) {
    experienceLevel = 'Executive';
  } else if (skillsFound.length > 5 && wordCount > 300) {
    experienceLevel = 'Mid Level';
  }

  // ── Detected job title ────────────────────────────────────────────────────
  const titlePatterns = [
    { regex: /software\s+engineer|software\s+developer/i, title: 'Software Engineer' },
    { regex: /data\s+scientist|data\s+analyst/i, title: 'Data Scientist' },
    { regex: /product\s+manager|product\s+lead/i, title: 'Product Manager' },
    { regex: /full[\s-]?stack/i, title: 'Full Stack Developer' },
    { regex: /front[\s-]?end/i, title: 'Frontend Developer' },
    { regex: /back[\s-]?end/i, title: 'Backend Developer' },
    { regex: /devops|site\s+reliability|sre/i, title: 'DevOps Engineer' },
    { regex: /machine\s+learning|ml\s+engineer/i, title: 'ML Engineer' },
    { regex: /ui\/ux|ux\s+designer|product\s+designer/i, title: 'UX Designer' },
  ];
  const detectedTitle = titlePatterns.find(({ regex }) => regex.test(text));

  // ── Strengths & Weaknesses ────────────────────────────────────────────────
  const strengths = [];
  const weaknesses = [];

  if (formattingScore >= 70) strengths.push('Well-structured resume with clear sections');
  else weaknesses.push('Resume structure needs improvement — add missing sections');

  if (skillsFound.length >= 8) strengths.push(`Strong technical skill set (${skillsFound.length} skills detected)`);
  else if (skillsFound.length < 4) weaknesses.push('Few technical skills listed — expand your skills section');

  if (hasQuantification) strengths.push('Good use of quantified achievements and metrics');
  else weaknesses.push('Missing quantified results — add numbers, percentages, and metrics');

  if (powerWordsFound.length >= 5) strengths.push('Effective use of action-oriented power words');
  else weaknesses.push('Use stronger action verbs (e.g., "achieved", "implemented", "scaled")');

  if (weakWordsFound.length > 2) weaknesses.push(`Weak language detected: "${weakWordsFound.slice(0,2).join('", "')}" — replace with impactful verbs`);

  if (hasLinkedIn && hasGitHub) strengths.push('Professional online presence (LinkedIn + GitHub) included');
  else if (!hasLinkedIn) weaknesses.push('Add your LinkedIn profile URL');

  if (wordCount >= 200 && wordCount <= 700) strengths.push('Resume length is optimal (concise and complete)');
  else if (wordCount < 200) weaknesses.push('Resume is too short — add more detail to your experience');
  else if (wordCount > 900) weaknesses.push('Resume may be too long — aim for 1-2 pages');

  if (sectionsFound.includes('projects')) strengths.push('Projects section demonstrates hands-on experience');
  else weaknesses.push('Add a Projects section to showcase your work');

  // ── Suggestions ───────────────────────────────────────────────────────────
  const suggestions = [
    !hasQuantification && 'Quantify your achievements: e.g., "Improved load time by 40%", "Managed team of 5"',
    missingKeywords.includes('github') && 'Add your GitHub profile link to show your code portfolio',
    missingKeywords.includes('linkedin') && 'Include your LinkedIn URL in the contact section',
    sectionsFound.includes('summary') === false && 'Add a professional summary (3-4 lines) at the top of your resume',
    weakWordsFound.length > 0 && `Replace passive phrases like "${weakWordsFound[0]}" with action verbs`,
    allSkillsFound.length < 6 && 'Expand your skills section with relevant technologies and tools',
    missingImportantSections.length > 0 && `Add missing sections: ${missingImportantSections.join(', ')}`,
    !lower.includes('certification') && skillsFound.length > 3 && 'Consider adding certifications (AWS, Google, etc.) to boost credibility',
    wordCount < 200 && 'Add more detail to your work experience — describe your responsibilities and impact',
    !lower.includes('team') && 'Mention teamwork and collaboration experiences',
  ].filter(Boolean);

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    scoreBreakdown: {
      formatting: formattingScore,
      keywords: keywordsScore,
      experience: experienceScore,
      education: educationScore,
      skills: skillsScore,
    },
    skillsFound: allSkillsFound,
    missingKeywords,
    strengths,
    weaknesses,
    suggestions: suggestions.slice(0, 6),
    detectedJobTitle: detectedTitle ? detectedTitle.title : 'Not detected',
    experienceLevel,
    industryMatch,
    wordCount,
    sectionsFound,
    powerWordsFound,
    quantifiedMatches,
  };
};

// ── Hugging Face AI feedback generator ───────────────────────────────────────
const getHuggingFaceFeedback = async (resumeText, analysisData) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    return generateFallbackFeedback(analysisData);
  }

  const prompt = `Analyze this resume and provide professional feedback in 3-4 sentences. 
  Focus on: overall impression, main strengths, and top 2 improvements needed.
  Resume score: ${analysisData.overallScore}/100. Experience level: ${analysisData.experienceLevel}.
  Skills found: ${analysisData.skillsFound.slice(0, 8).join(', ')}.
  Resume excerpt: ${resumeText.substring(0, 800)}
  
  Provide concise, actionable feedback:`;

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      { inputs: prompt, parameters: { max_new_tokens: 200, temperature: 0.7 } },
      {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      let text = response.data[0].generated_text;
      // Remove the prompt from the response
      text = text.replace(prompt, '').trim();
      if (text.length > 50) return text.substring(0, 500);
    }
  } catch (err) {
    console.warn('HuggingFace API error (using fallback):', err.message);
  }

  return generateFallbackFeedback(analysisData);
};

// ── Deterministic fallback feedback ──────────────────────────────────────────
const generateFallbackFeedback = (analysis) => {
  const { overallScore, skillsFound, experienceLevel, strengths, weaknesses } = analysis;

  let opener;
  if (overallScore >= 80) opener = 'Your resume is strong and well-crafted.';
  else if (overallScore >= 60) opener = 'Your resume shows good potential with some room for improvement.';
  else if (overallScore >= 40) opener = 'Your resume has a solid foundation but needs significant enhancement.';
  else opener = 'Your resume needs substantial work to be competitive in today\'s job market.';

  const skillStr = skillsFound.length > 0
    ? `You demonstrate proficiency in ${skillsFound.slice(0, 4).join(', ')}${skillsFound.length > 4 ? ` and ${skillsFound.length - 4} more technologies` : ''}.`
    : 'Consider adding a dedicated skills section with relevant technologies.';

  const improvStr = weaknesses.length > 0
    ? `Key areas for improvement: ${weaknesses[0].toLowerCase()}.`
    : 'Continue maintaining the high quality of your resume.';

  const levelStr = experienceLevel !== 'Unknown'
    ? `Your profile suggests ${experienceLevel.toLowerCase()} positioning.`
    : '';

  return [opener, skillStr, improvStr, levelStr].filter(Boolean).join(' ');
};

// ── Main exported analysis function ──────────────────────────────────────────
const analyzeResume = async (resumeText) => {
  const startTime = Date.now();

  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Resume text is too short or could not be extracted from the PDF.');
  }

  // Step 1: Rule-based analysis
  const ruleBasedResults = analyzeWithRules(resumeText);

  // Step 2: AI narrative feedback
  const overallFeedback = await getHuggingFaceFeedback(resumeText, ruleBasedResults);

  const processingTimeMs = Date.now() - startTime;

  return {
    ...ruleBasedResults,
    overallFeedback,
    processingTimeMs,
    aiModel: process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      ? 'rule-based + huggingface/mistral-7b'
      : 'rule-based + template feedback',
    analysisVersion: '1.0',
  };
};

module.exports = { analyzeResume };
