import type {
  ResumeData,
  Skills,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  PersonalInfo,
} from "../types/resume";

const emptySkills = (): Skills => ({
  languages: [],
  frontend: [],
  backend: [],
  databases: [],
  tools: [],
});

const emptyPersonalInfo = (): PersonalInfo => ({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  website: "",
});

export const normalizeResumeData = (raw: any): ResumeData => {
  const skills = normalizeSkills(raw?.skills);
  const personalInfo = normalizePersonalInfo(raw?.personalInfo);
  const experience = normalizeExperience(raw?.experience);
  const education = normalizeEducation(raw?.education);
  const projects = normalizeProjects(raw?.projects);
  const certifications = normalizeCertifications(raw?.certifications);

  return {
    personalInfo,
    summary: raw?.summary || "",
    skills,
    experience,
    projects,
    education,
    certifications,
  };
};

const normalizePersonalInfo = (raw: any): PersonalInfo => {
  if (!raw || typeof raw !== "object") return emptyPersonalInfo();
  return {
    fullName: raw.fullName || "",
    email: raw.email || "",
    phone: raw.phone || "",
    location: raw.location || "",
    linkedin: raw.linkedin || "",
    github: raw.github || "",
    portfolio: raw.portfolio || "",
    website: raw.website || "",
  };
};

const normalizeSkills = (rawSkills: any): Skills => {
  if (!rawSkills) return emptySkills();

  // Old format: skills: ["Java", "React"]
  if (Array.isArray(rawSkills)) {
    return {
      languages: rawSkills,
      frontend: [],
      backend: [],
      databases: [],
      tools: [],
    };
  }

  // New format - make sure all fields exist
  return {
    languages: Array.isArray(rawSkills.languages) ? rawSkills.languages : [],
    frontend: Array.isArray(rawSkills.frontend) ? rawSkills.frontend : [],
    backend: Array.isArray(rawSkills.backend) ? rawSkills.backend : [],
    databases: Array.isArray(rawSkills.databases) ? rawSkills.databases : [],
    tools: Array.isArray(rawSkills.tools) ? rawSkills.tools : [],
  };
};

const normalizeExperience = (raw: any): ExperienceItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any, index: number) => ({
    id: item.id || `exp-${index + 1}`,
    company: item.company || "",
    position: item.position || "",
    location: item.location || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    current: item.current || false,
    description: Array.isArray(item.description)
      ? item.description
      : item.description
      ? [item.description]
      : [],
  }));
};

const normalizeEducation = (raw: any): EducationItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any, index: number) => ({
    id: item.id || `edu-${index + 1}`,
    institution: item.institution || "",
    degree: item.degree || "",
    field: item.field || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    cgpa: item.cgpa || "",
  }));
};

const normalizeProjects = (raw: any): ProjectItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any, index: number) => ({
    id: item.id || `proj-${index + 1}`,
    title: item.title || "",
    techStack: Array.isArray(item.techStack) ? item.techStack : [],
    githubUrl: item.githubUrl || "",
    liveUrl: item.liveUrl || "",
    description: Array.isArray(item.description)
      ? item.description
      : item.description
      ? [item.description]
      : [],
  }));
};

const normalizeCertifications = (raw: any): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => typeof item === "string" && item.trim() !== "");
};

// Helper: Convert comma-separated string to array
export const splitCommaString = (value?: string): string[] => {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
};

// Helper: Convert array to comma-separated string
export const joinArrayToString = (items: string[]): string => {
  return items.join(", ");
};