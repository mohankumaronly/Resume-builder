export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
};

export type ExperienceItem = {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string[]; // bullet points
};

export type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  cgpa?: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  description: string[]; // bullet points
};

export type Skills = {
  languages: string[];
  frontend: string[];
  backend: string[];
  databases: string[];
  tools: string[];
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  summary: string;
  skills: Skills;
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
  education?: EducationItem[];
  certifications?: string[];
};

export type ResumeSummary = {
  id: number;
  title: string;
  templateId: string;
  updatedAt: string;
  createdAt: string;
};

export type ResumeDetail = {
  id: number;
  title: string;
  templateId: string;
  resumeDataJson: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateResumeRequest = {
  title: string;
  templateId: string;
  resumeDataJson: string;
};

export type UpdateResumeRequest = {
  title: string;
  templateId: string;
  resumeDataJson: string;
};

// Helper function to generate unique IDs - NOT exported as type
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};