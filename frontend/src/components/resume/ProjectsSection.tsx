import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Code2, Globe } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";
import { generateId } from "../../types/resume";
import type { ProjectItem } from "../../types/resume";

// GitHub SVG Icon (since lucide-react doesn't have Github)
const GithubIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

interface ProjectsSectionProps {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  items,
  onChange,
}) => {
  const addProject = () => {
    const newItem: ProjectItem = {
      id: generateId(),
      title: "",
      techStack: [],
      githubUrl: "",
      liveUrl: "",
      description: [""],
    };
    onChange([...items, newItem]);
  };

  const removeProject = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const updateDescription = (id: string, index: number, value: string) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          const newDescription = [...item.description];
          newDescription[index] = value;
          return { ...item, description: newDescription };
        }
        return item;
      })
    );
  };

  const addDescriptionBullet = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? { ...item, description: [...item.description, ""] }
          : item
      )
    );
  };

  const removeDescriptionBullet = (id: string, index: number) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          const newDescription = item.description.filter((_, i) => i !== index);
          return { ...item, description: newDescription };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Projects
          </h3>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            ({items.length})
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addProject}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Project
        </Button>
      </div>

      {/* Projects List */}
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No projects added yet. Click "Add Project" to get started.
            </p>
          </motion.div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <Input
                      label="Project Title"
                      placeholder="Resume Builder"
                      value={item.title}
                      onChange={(e) =>
                        updateProject(item.id, "title", e.target.value)
                      }
                    />

                    <Input
                      label="Tech Stack"
                      placeholder="React, Spring Boot, MySQL"
                      value={item.techStack.join(", ")}
                      onChange={(e) =>
                        updateProject(
                          item.id,
                          "techStack",
                          e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        )
                      }
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Separate technologies with commas
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="GitHub URL"
                        placeholder="https://github.com/username/repo"
                        icon={<GithubIcon />}
                        value={item.githubUrl || ""}
                        onChange={(e) =>
                          updateProject(item.id, "githubUrl", e.target.value)
                        }
                      />
                      <Input
                        label="Live URL"
                        placeholder="https://resume-builder.com"
                        icon={<Globe className="h-4 w-4" />}
                        value={item.liveUrl || ""}
                        onChange={(e) =>
                          updateProject(item.id, "liveUrl", e.target.value)
                        }
                      />
                    </div>

                    {/* Description Bullets */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description (Bullet Points)
                      </label>
                      {item.description.map((desc, descIndex) => (
                        <div key={descIndex} className="flex gap-2">
                          <div className="mt-2.5">
                            <span className="text-primary-500">•</span>
                          </div>
                          <Input
                            placeholder="Built full-stack application with authentication"
                            value={desc}
                            onChange={(e) =>
                              updateDescription(item.id, descIndex, e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeDescriptionBullet(item.id, descIndex)
                            }
                            icon={<X className="h-4 w-4" />}
                            className="text-red-500 hover:text-red-700"
                            disabled={item.description.length <= 1}
                          />
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addDescriptionBullet(item.id)}
                        icon={<Plus className="h-3 w-3" />}
                        className="text-primary-600"
                      >
                        Add Bullet Point
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(item.id)}
                    icon={<X className="h-4 w-4" />}
                    className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                  />
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsSection;