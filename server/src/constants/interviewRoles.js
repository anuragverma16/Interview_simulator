export const INTERVIEW_QUESTION_COUNT = 10;

export const INTERVIEW_ROLES = [
  {
    id: 'frontend-developer',
    label: 'Frontend Developer',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'State Management', 'Performance', 'Accessibility'],
  },
  {
    id: 'backend-developer',
    label: 'Backend Developer',
    skills: ['Node.js', 'APIs', 'Databases', 'System Design', 'Authentication', 'Caching', 'SQL', 'Microservices'],
  },
  {
    id: 'fullstack-developer',
    label: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'REST APIs', 'Databases', 'DevOps', 'TypeScript', 'System Design', 'Testing'],
  },
  {
    id: 'data-scientist',
    label: 'Data Scientist',
    skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization', 'Pandas', 'Feature Engineering', 'A/B Testing'],
  },
  {
    id: 'devops-engineer',
    label: 'DevOps Engineer',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Monitoring', 'Terraform', 'Networking'],
  },
  {
    id: 'product-manager',
    label: 'Product Manager',
    skills: ['Roadmapping', 'User Research', 'Prioritization', 'Stakeholder Management', 'Metrics', 'Agile', 'Strategy', 'Communication'],
  },
  {
    id: 'software-engineer',
    label: 'Software Engineer (General)',
    skills: ['Algorithms', 'Data Structures', 'OOP', 'System Design', 'Debugging', 'Code Review', 'Testing', 'Git'],
  },
];

export function getRoleById(id) {
  return INTERVIEW_ROLES.find((r) => r.id === id) || INTERVIEW_ROLES.find((r) => r.id === 'software-engineer');
}
