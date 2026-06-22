import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Trash2,
  Sparkles,
  User,
  Code,
  Check,
  Eye,
  Edit3,
  FileText,
  Briefcase,
  GraduationCap,
  Globe,
  Code2,
} from "lucide-react";
import { resumeService } from "../../services/resume.service";
import { templateService } from "../../services/template.service";
import { aiService } from "../../services/ai.service";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import TextArea from "../../components/common/TextArea";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import ExperienceSection from "../../components/resume/ExperienceSection";
import EducationSection from "../../components/resume/EducationSection";
import ProjectsSection from "../../components/resume/ProjectsSection";
import toast from "react-hot-toast";
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem } from "../../types/resume";
import type { Template } from "../../types/template";
import { normalizeResumeData, splitCommaString, joinArrayToString } from "../../utils/resume-normalizer";


const GithubIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIconSVG = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const resumeEditorSchema = z.object({
  title: z.string().min(1, "Title is required"),
  templateId: z.string().min(1, "Please select a template"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  skillLanguages: z.string().optional(),
  skillFrontend: z.string().optional(),
  skillBackend: z.string().optional(),
  skillDatabases: z.string().optional(),
  skillTools: z.string().optional(),
  certifications: z.string().optional(),
});

type ResumeEditorFormData = z.infer<typeof resumeEditorSchema>;

const ResumeEditorPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern-1");
  const [lastSaved, setLastSaved] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // State for repeatable sections
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([]);
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [certificationItems, setCertificationItems] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
    getValues,
  } = useForm<ResumeEditorFormData>({
    resolver: zodResolver(resumeEditorSchema),
    defaultValues: {
      skillLanguages: "",
      skillFrontend: "",
      skillBackend: "",
      skillDatabases: "",
      skillTools: "",
      certifications: "",
    },
  });

  useEffect(() => {
    if (resumeId) {
      loadData();
    }
  }, [resumeId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load templates
      const templatesData = await templateService.getAllTemplates();
      setTemplates(templatesData);

      // Load resume
      const resume = await resumeService.getResumeById(parseInt(resumeId!));
      const parsedRaw = JSON.parse(resume.resumeDataJson);
      const parsedData = normalizeResumeData(parsedRaw);

      setSelectedTemplate(resume.templateId);
      setExperienceItems(parsedData.experience || []);
      setEducationItems(parsedData.education || []);
      setProjectItems(parsedData.projects || []);
      setCertificationItems(parsedData.certifications || []);

      // Populate form
      reset({
        title: resume.title,
        templateId: resume.templateId,
        fullName: parsedData.personalInfo.fullName || "",
        email: parsedData.personalInfo.email || "",
        phone: parsedData.personalInfo.phone || "",
        location: parsedData.personalInfo.location || "",
        linkedin: parsedData.personalInfo.linkedin || "",
        github: parsedData.personalInfo.github || "",
        portfolio: parsedData.personalInfo.portfolio || "",
        summary: parsedData.summary || "",
        skillLanguages: joinArrayToString(parsedData.skills.languages),
        skillFrontend: joinArrayToString(parsedData.skills.frontend),
        skillBackend: joinArrayToString(parsedData.skills.backend),
        skillDatabases: joinArrayToString(parsedData.skills.databases),
        skillTools: joinArrayToString(parsedData.skills.tools),
        certifications: joinArrayToString(parsedData.certifications || []),
      });

      setLastSaved(new Date(resume.updatedAt).toLocaleString());
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load resume. Please try again.");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ResumeEditorFormData) => {
    setIsSaving(true);
    try {
      const resumeDataToSave: ResumeData = {
        personalInfo: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin || "",
          github: data.github || "",
          portfolio: data.portfolio || "",
        },
        summary: data.summary,
        skills: {
          languages: splitCommaString(data.skillLanguages),
          frontend: splitCommaString(data.skillFrontend),
          backend: splitCommaString(data.skillBackend),
          databases: splitCommaString(data.skillDatabases),
          tools: splitCommaString(data.skillTools),
        },
        experience: experienceItems,
        education: educationItems,
        projects: projectItems,
        certifications: splitCommaString(data.certifications),
      };

      const payload = {
        title: data.title,
        templateId: data.templateId,
        resumeDataJson: JSON.stringify(resumeDataToSave),
      };

      await resumeService.updateResume(parseInt(resumeId!), payload);
      setLastSaved(new Date().toLocaleString());
      toast.success("Resume saved successfully! ✅");
    } catch (error) {
      console.error("Error updating resume:", error);
      toast.error("Failed to update resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await resumeService.deleteResume(parseInt(resumeId!));
      toast.success("Resume deleted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAiImprove = () => {
    setIsAiModalOpen(true);
  };

  const handleAiSubmit = async (targetRole: string, experienceLevel: string) => {
    setIsAiLoading(true);
    try {
      const result = await aiService.improveResume(parseInt(resumeId!), {
        targetRole,
        experienceLevel: experienceLevel as any,
      });

      const improvedData = JSON.parse(result.improvedResumeDataJson);
      const normalized = normalizeResumeData(improvedData);

      // Update state with AI improvements
      setExperienceItems(normalized.experience || []);
      setEducationItems(normalized.education || []);
      setProjectItems(normalized.projects || []);
      setCertificationItems(normalized.certifications || []);

      reset({
        ...getValues(),
        fullName: normalized.personalInfo.fullName || "",
        email: normalized.personalInfo.email || "",
        phone: normalized.personalInfo.phone || "",
        location: normalized.personalInfo.location || "",
        linkedin: normalized.personalInfo.linkedin || "",
        github: normalized.personalInfo.github || "",
        portfolio: normalized.personalInfo.portfolio || "",
        summary: normalized.summary || "",
        skillLanguages: joinArrayToString(normalized.skills.languages),
        skillFrontend: joinArrayToString(normalized.skills.frontend),
        skillBackend: joinArrayToString(normalized.skills.backend),
        skillDatabases: joinArrayToString(normalized.skills.databases),
        skillTools: joinArrayToString(normalized.skills.tools),
        certifications: joinArrayToString(normalized.certifications || []),
      });

      toast.success("AI improvements applied! Click Save to persist.");
      setIsAiModalOpen(false);
    } catch (error) {
      console.error("Error improving resume:", error);
      toast.error("Failed to improve resume. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const watchedTemplateId = watch("templateId");
  const watchedFullName = watch("fullName");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedLocation = watch("location");
  const watchedLinkedin = watch("linkedin");
  const watchedGithub = watch("github");
  const watchedPortfolio = watch("portfolio");
  const watchedSummary = watch("summary");
  const watchedSkillLanguages = watch("skillLanguages");
  const watchedSkillFrontend = watch("skillFrontend");
  const watchedSkillBackend = watch("skillBackend");
  const watchedSkillDatabases = watch("skillDatabases");
  const watchedSkillTools = watch("skillTools");
  const watchedCertifications = watch("certifications");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Combine all skills for preview
  const getAllSkills = (): string[] => {
    const languages = splitCommaString(watchedSkillLanguages);
    const frontend = splitCommaString(watchedSkillFrontend);
    const backend = splitCommaString(watchedSkillBackend);
    const databases = splitCommaString(watchedSkillDatabases);
    const tools = splitCommaString(watchedSkillTools);
    return [...languages, ...frontend, ...backend, ...databases, ...tools];
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Google Docs Style Top Bar */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px] sm:max-w-[300px]">
                {watch("title") || "Untitled Resume"}
              </span>
              {isDirty && (
                <Badge variant="warning" size="sm" className="ml-2">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500">
              {lastSaved && `Last saved: ${lastSaved}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              icon={isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              className="hidden sm:flex"
            >
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAiImprove}
              icon={<Sparkles className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">AI Improve</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit(onSubmit)}
              loading={isSaving}
              icon={<Save className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={isDeleting}
              icon={<Trash2 className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Sidebar - Document Outline */}
        <div className="hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block overflow-y-auto p-4">
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Document Outline
            </h3>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => scrollToSection("personal")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "personal"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <User className="inline h-4 w-4 mr-2" />
              Personal Info
            </button>
            <button
              onClick={() => scrollToSection("summary")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "summary"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Summary
            </button>
            <button
              onClick={() => scrollToSection("skills")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "skills"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Code className="inline h-4 w-4 mr-2" />
              Skills
            </button>
            <button
              onClick={() => scrollToSection("experience")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "experience"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Briefcase className="inline h-4 w-4 mr-2" />
              Experience
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "projects"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Code2 className="inline h-4 w-4 mr-2" />
              Projects
            </button>
            <button
              onClick={() => scrollToSection("education")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "education"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <GraduationCap className="inline h-4 w-4 mr-2" />
              Education
            </button>
            <button
              onClick={() => scrollToSection("certifications")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "certifications"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Check className="inline h-4 w-4 mr-2" />
              Certifications
            </button>
          </nav>
        </div>

        {/* Center - Document Editor */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-lg bg-white shadow-lg dark:bg-gray-900 p-8 sm:p-12">
              {/* Title Section */}
              <div className="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
                <Input
                  label="Resume Title"
                  placeholder="Software Engineer Resume"
                  className="text-2xl font-bold border-0 px-0 focus:ring-0"
                  error={errors.title?.message}
                  {...register("title")}
                />
              </div>

              {/* Personal Information */}
              <div id="personal" className="mb-8 scroll-mt-16">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5" /> Personal Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    error={errors.fullName?.message}
                    {...register("fullName")}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+1 234 567 890"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                  <Input
                    label="Location"
                    placeholder="New York, NY"
                    error={errors.location?.message}
                    {...register("location")}
                  />
                  <Input
                    label="LinkedIn"
                    placeholder="linkedin.com/in/johndoe"
                    icon={<LinkedInIconSVG />}
                    error={errors.linkedin?.message}
                    {...register("linkedin")}
                  />
                  <Input
                    label="GitHub"
                    placeholder="github.com/johndoe"
                    icon={<GithubIcon/>}
                    error={errors.github?.message}
                    {...register("github")}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Portfolio / Website"
                      placeholder="johndoe.com"
                      icon={<Globe className="h-4 w-4" />}
                      error={errors.portfolio?.message}
                      {...register("portfolio")}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div id="summary" className="mb-8 scroll-mt-16">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Professional Summary
                </h2>
                <TextArea
                  placeholder="Write a compelling professional summary..."
                  rows={5}
                  error={errors.summary?.message}
                  {...register("summary")}
                />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {watch("summary")?.length || 0}/500 characters
                </p>
              </div>

              {/* Skills - Grouped */}
              <div id="skills" className="mb-8 scroll-mt-16">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Code className="h-5 w-5" /> Skills
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Languages"
                    placeholder="Java, Python, JavaScript"
                    {...register("skillLanguages")}
                  />
                  <Input
                    label="Frontend"
                    placeholder="React, Vue, Angular"
                    {...register("skillFrontend")}
                  />
                  <Input
                    label="Backend"
                    placeholder="Spring Boot, Node.js, Django"
                    {...register("skillBackend")}
                  />
                  <Input
                    label="Databases"
                    placeholder="MySQL, PostgreSQL, MongoDB"
                    {...register("skillDatabases")}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Tools & Others"
                      placeholder="Docker, Git, Postman, AWS"
                      {...register("skillTools")}
                    />
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div id="experience" className="mb-8 scroll-mt-16">
                <ExperienceSection
                  items={experienceItems}
                  onChange={setExperienceItems}
                />
              </div>

              {/* Projects Section */}
              <div id="projects" className="mb-8 scroll-mt-16">
                <ProjectsSection
                  items={projectItems}
                  onChange={setProjectItems}
                />
              </div>

              {/* Education Section */}
              <div id="education" className="mb-8 scroll-mt-16">
                <EducationSection
                  items={educationItems}
                  onChange={setEducationItems}
                />
              </div>

              {/* Certifications */}
              <div id="certifications" className="mb-8 scroll-mt-16">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Check className="h-5 w-5" /> Certifications
                </h2>
                <Input
                  placeholder="AWS Certified, Google Cloud Professional, Oracle Certified Java"
                  {...register("certifications")}
                />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Separate certifications with commas
                </p>
              </div>
            </div>

            {/* Save Button at bottom */}
            <div className="flex justify-end gap-3 pb-8">
              <Button
                type="submit"
                loading={isSaving}
                icon={<Save className="h-4 w-4" />}
                size="lg"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Right Sidebar - Live Preview */}
        <div className="hidden w-96 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 xl:block overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Preview</h3>
            <Badge variant="info" size="sm">
              {templates.find(t => t.id === watchedTemplateId)?.name || "Modern"}
            </Badge>
          </div>

          <div className="sticky top-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="aspect-[3/4] w-full bg-white dark:bg-gray-800 rounded shadow-sm p-6">
                <div className="h-full space-y-4">
                  {/* Header */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {watchedFullName || "Your Name"}
                    </h2>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <p>{watchedEmail || "email@example.com"}</p>
                      <p>{watchedPhone || "+1 234 567 890"}</p>
                      <p>{watchedLocation || "City, Country"}</p>
                      {watchedLinkedin && (
                        <p className="text-primary-600 dark:text-primary-400">{watchedLinkedin}</p>
                      )}
                      {watchedGithub && (
                        <p className="text-primary-600 dark:text-primary-400">{watchedGithub}</p>
                      )}
                      {watchedPortfolio && (
                        <p className="text-primary-600 dark:text-primary-400">{watchedPortfolio}</p>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Summary
                    </h4>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                      {watchedSummary || "Your professional summary will appear here..."}
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Skills
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {getAllSkills().map((skill, index) => (
                        <span key={index} className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                          {skill}
                        </span>
                      ))}
                      {getAllSkills().length === 0 && (
                        <span className="text-xs text-gray-400">Your skills will appear here</span>
                      )}
                    </div>
                  </div>

                  {/* Experience Preview */}
                  {experienceItems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Experience
                      </h4>
                      <div className="mt-1 space-y-1">
                        {experienceItems.slice(0, 2).map((exp) => (
                          <div key={exp.id} className="text-xs">
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {exp.position} at {exp.company}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
                          </div>
                        ))}
                        {experienceItems.length > 2 && (
                          <p className="text-xs text-gray-400">+{experienceItems.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-auto">
                    <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                      {templates.find(t => t.id === watchedTemplateId)?.name || "Modern"} • ATS-Friendly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Improve Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="✨ AI Resume Enhancement"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your target role and experience level to get AI-powered suggestions
            to improve your resume content.
          </p>

          <div className="space-y-4">
            <Input
              label="Target Role"
              placeholder="e.g., Java Backend Developer"
              id="targetRole"
              defaultValue=""
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                defaultValue="fresher"
              >
                <option value="fresher">Fresher</option>
                <option value="mid-level">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsAiModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const targetRole = (document.getElementById("targetRole") as HTMLInputElement)?.value;
                const experienceLevel = (document.getElementById("experienceLevel") as HTMLSelectElement)?.value;
                if (targetRole && experienceLevel) {
                  handleAiSubmit(targetRole, experienceLevel);
                } else {
                  toast.error("Please enter your target role.");
                }
              }}
              loading={isAiLoading}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Generate Improvements
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResumeEditorPage;