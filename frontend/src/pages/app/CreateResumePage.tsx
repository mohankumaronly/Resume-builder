import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Link2 } from "lucide-react";
import { resumeService } from "../../services/resume.service";
import { templateService } from "../../services/template.service";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import TextArea from "../../components/common/TextArea";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import toast from "react-hot-toast";
import type { ResumeData } from "../../types/resume";
import type { Template } from "../../types/template";
import { splitCommaString } from "../../utils/resume-normalizer";

const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  templateId: z.string().min(1, "Please select a template"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  linkedin: z.string().optional(),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  // Skills now as comma-separated strings for grouped skills
  skillLanguages: z.string().optional(),
  skillFrontend: z.string().optional(),
  skillBackend: z.string().optional(),
  skillDatabases: z.string().optional(),
  skillTools: z.string().optional(),
});

type CreateResumeFormData = z.infer<typeof createResumeSchema>;

const CreateResumePage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern-1");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get("template");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateResumeFormData>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      templateId: templateParam || "modern-1",
    },
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (templateParam) {
      setSelectedTemplate(templateParam);
      setValue("templateId", templateParam);
    }
  }, [templateParam, setValue]);

  const loadTemplates = async () => {
    try {
      const data = await templateService.getAllTemplates();
      setTemplates(data);
      if (data.length > 0 && !templateParam) {
        setSelectedTemplate(data[0].id);
        setValue("templateId", data[0].id);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateResumeFormData) => {
    setIsSubmitting(true);
    try {
      const resumeData: ResumeData = {
        personalInfo: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin || "",
        },
        summary: data.summary,
        skills: {
          languages: splitCommaString(data.skillLanguages),
          frontend: splitCommaString(data.skillFrontend),
          backend: splitCommaString(data.skillBackend),
          databases: splitCommaString(data.skillDatabases),
          tools: splitCommaString(data.skillTools),
        },
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      };

      const payload = {
        title: data.title,
        templateId: data.templateId,
        resumeDataJson: JSON.stringify(resumeData),
      };

      const result = await resumeService.createResume(payload);
      toast.success("Resume created successfully! 🎉");
      
      navigate(`/resumes/${result.id}/edit`);
    } catch (error) {
      console.error("Error creating resume:", error);
      toast.error("Failed to create resume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedTemplateId = watch("templateId");
  
  // Combine all skills for preview
  const getAllSkills = (): string[] => {
    const languages = splitCommaString(watch("skillLanguages"));
    const frontend = splitCommaString(watch("skillFrontend"));
    const backend = splitCommaString(watch("skillBackend"));
    const databases = splitCommaString(watch("skillDatabases"));
    const tools = splitCommaString(watch("skillTools"));
    return [...languages, ...frontend, ...backend, ...databases, ...tools];
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Resume
          </h1>
        </div>
        <Button
          type="submit"
          form="create-resume-form"
          loading={isSubmitting}
          icon={<Save className="h-4 w-4" />}
        >
          Create Resume
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form - Left Side */}
        <div className="lg:col-span-2">
          <form id="create-resume-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Card 1: Resume Details */}
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Resume Details
              </h3>
              <Input
                label="Resume Title"
                placeholder="e.g., Software Engineer Resume"
                error={errors.title?.message}
                {...register("title")}
              />
            </Card>

            {/* Card 2: Template Selection */}
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Select Template
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setValue("templateId", template.id);
                    }}
                    className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                      watchedTemplateId === template.id
                        ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/30"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="aspect-[3/4] w-full rounded bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden">
                      <img
                        src={template.previewImageUrl || "https://placehold.co/400x500/e5e7eb/6b7280?text=Template"}
                        alt={template.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {template.category}
                    </p>
                    {template.premium && (
                      <Badge variant="premium" size="sm" className="mt-1">
                        Premium
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              {errors.templateId && (
                <p className="mt-2 text-sm text-red-500">{errors.templateId.message}</p>
              )}
            </Card>

            {/* Card 3: Personal Information */}
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h3>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<User className="h-4 w-4" />}
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Phone Number"
                  placeholder="+1 234 567 890"
                  icon={<Phone className="h-4 w-4" />}
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <Input
                  label="Location"
                  placeholder="New York, NY"
                  icon={<MapPin className="h-4 w-4" />}
                  error={errors.location?.message}
                  {...register("location")}
                />
                <Input
                  label="LinkedIn Profile (Optional)"
                  placeholder="linkedin.com/in/johndoe"
                  icon={<Link2 className="h-4 w-4" />}
                  error={errors.linkedin?.message}
                  {...register("linkedin")}
                />
              </div>
            </Card>

            {/* Card 4: Professional Summary */}
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Professional Summary
              </h3>
              <TextArea
                placeholder="Write a brief summary of your professional experience, skills, and career goals..."
                rows={4}
                error={errors.summary?.message}
                {...register("summary")}
              />
            </Card>

            {/* Card 5: Skills - Grouped */}
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Skills
              </h3>
              <div className="space-y-4">
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
                <Input
                  label="Tools & Others"
                  placeholder="Docker, Git, Postman, AWS"
                  {...register("skillTools")}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Enter skills separated by commas for each category
              </p>
            </Card>
          </form>
        </div>

        {/* Live Preview - Right Side */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Live Preview
            </h3>
            <div className="aspect-[3/4] w-full rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
              <div className="space-y-3">
                <div className="border-b border-gray-300 dark:border-gray-700 pb-2">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {watch("fullName") || "Your Name"}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <p>{watch("email") || "email@example.com"}</p>
                    <p>{watch("phone") || "+1 234 567 890"}</p>
                    <p>{watch("location") || "City, Country"}</p>
                    {watch("linkedin") && (
                      <p className="text-primary-600">{watch("linkedin")}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Summary</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-4">
                    {watch("summary") || "Your professional summary will appear here..."}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getAllSkills().map((skill, index) => (
                      skill.trim() && (
                        <span key={index} className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                          {skill.trim()}
                        </span>
                      )
                    ))}
                    {getAllSkills().length === 0 && (
                      <span className="text-xs text-gray-400">Your skills will appear here</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              Template: {templates.find(t => t.id === watchedTemplateId)?.name || "Modern"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateResumePage;