import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, GraduationCap } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";
import { generateId } from "../../types/resume";
import type { EducationItem } from "../../types/resume";

interface EducationSectionProps {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  items,
  onChange,
}) => {
  const addEducation = () => {
    const newItem: EducationItem = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      cgpa: "",
    };
    onChange([...items, newItem]);
  };

  const removeEducation = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Education
          </h3>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            ({items.length})
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addEducation}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Education
        </Button>
      </div>

      {/* Education List */}
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No education added yet. Click "Add Education" to get started.
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
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Institution"
                        placeholder="MIT"
                        value={item.institution}
                        onChange={(e) =>
                          updateEducation(item.id, "institution", e.target.value)
                        }
                      />
                      <Input
                        label="Degree"
                        placeholder="B.S. in Computer Science"
                        value={item.degree}
                        onChange={(e) =>
                          updateEducation(item.id, "degree", e.target.value)
                        }
                      />
                    </div>

                    <Input
                      label="Field of Study"
                      placeholder="Computer Science"
                      value={item.field}
                      onChange={(e) =>
                        updateEducation(item.id, "field", e.target.value)
                      }
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        label="Start Date"
                        type="month"
                        value={item.startDate}
                        onChange={(e) =>
                          updateEducation(item.id, "startDate", e.target.value)
                        }
                      />
                      <Input
                        label="End Date"
                        type="month"
                        value={item.endDate || ""}
                        onChange={(e) =>
                          updateEducation(item.id, "endDate", e.target.value)
                        }
                      />
                      <Input
                        label="CGPA (Optional)"
                        placeholder="3.8"
                        value={item.cgpa || ""}
                        onChange={(e) =>
                          updateEducation(item.id, "cgpa", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(item.id)}
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

export default EducationSection;