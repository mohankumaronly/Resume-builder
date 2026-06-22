import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Briefcase, MapPin } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";
import { generateId } from "../../types/resume";
import type { ExperienceItem } from "../../types/resume";

interface ExperienceSectionProps {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  items,
  onChange,
}) => {
  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""],
    };
    onChange([...items, newItem]);
  };

  const removeExperience = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
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
          <Briefcase className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Experience
          </h3>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            ({items.length})
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addExperience}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Experience
        </Button>
      </div>

      {/* Experience List */}
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No experience added yet. Click "Add Experience" to get started.
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
                        label="Position"
                        placeholder="Software Engineer"
                        value={item.position}
                        onChange={(e) =>
                          updateExperience(item.id, "position", e.target.value)
                        }
                      />
                      <Input
                        label="Company"
                        placeholder="Google"
                        value={item.company}
                        onChange={(e) =>
                          updateExperience(item.id, "company", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        label="Location"
                        placeholder="New York, NY"
                        icon={<MapPin className="h-4 w-4" />}
                        value={item.location || ""}
                        onChange={(e) =>
                          updateExperience(item.id, "location", e.target.value)
                        }
                      />
                      <Input
                        label="Start Date"
                        type="month"
                        value={item.startDate}
                        onChange={(e) =>
                          updateExperience(item.id, "startDate", e.target.value)
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="month"
                            value={item.endDate || ""}
                            onChange={(e) =>
                              updateExperience(item.id, "endDate", e.target.value)
                            }
                            disabled={item.current}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant={item.current ? "primary" : "outline"}
                            onClick={() =>
                              updateExperience(item.id, "current", !item.current)
                            }
                            className="whitespace-nowrap"
                          >
                            {item.current ? "Current" : "Set Current"}
                          </Button>
                        </div>
                      </div>
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
                            placeholder="Built REST APIs using Spring Boot"
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
                    onClick={() => removeExperience(item.id)}
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

export default ExperienceSection;