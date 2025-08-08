"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { EducationFormData } from "@/types/profile";
import { educationSchema } from "@/lib/validations/profile";

interface Education {
  id: string;
  from: string;
  to: string;
  degree: string;
  institution: string;
  location?: string;
  url?: string;
  description?: string;
  classmates?: string;
  fieldOfStudy?: string;
  gpa?: string;
  activities?: string;
  createdAt: Date;
}

interface EducationTabProps {
  educations: Education[];
  showEducationForm: boolean;
  onShowEducationForm: (show: boolean) => void;
  onSubmit: (data: EducationFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function EducationTab({
  educations,
  showEducationForm,
  onShowEducationForm,
  onSubmit,
  isSubmitting,
}: EducationTabProps) {
  const educationForm = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    mode: "onChange",
    defaultValues: {
      from: "",
      to: "",
      degree: "",
      institution: "",
      location: "",
      url: "",
      description: "",
      classmates: "",
      fieldOfStudy: "",
      gpa: "",
      activities: "",
    },
  });

  const handleCancel = () => {
    onShowEducationForm(false);
    educationForm.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl">Education</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShowEducationForm(true)}
          disabled={showEducationForm}
        >
          <Plus />
          Add Education
        </Button>
      </div>
      <Separator />

      {/* Display existing education */}
      {educations.length > 0 && (
        <div className="space-y-3">
          {educations.map((education) => (
            <div
              key={education.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{education.degree}</h4>
                <span className="text-sm text-muted-foreground">
                  {education.from} - {education.to}
                </span>
              </div>
              <p className="font-medium text-sm">{education.institution}</p>
              {education.fieldOfStudy && (
                <p className="text-sm text-muted-foreground">
                  {education.fieldOfStudy}
                </p>
              )}
              {education.location && (
                <p className="text-xs text-muted-foreground">
                  Location: {education.location}
                </p>
              )}
              {education.gpa && (
                <p className="text-xs text-muted-foreground">
                  GPA: {education.gpa}
                </p>
              )}
              {education.description && (
                <p className="text-sm text-muted-foreground">
                  {education.description}
                </p>
              )}
              {education.url && (
                <a
                  href={education.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Visit Institution
                </a>
              )}
              {education.classmates && (
                <p className="text-xs text-muted-foreground">
                  Classmates: {education.classmates}
                </p>
              )}
              {education.activities && (
                <p className="text-xs text-muted-foreground">
                  Activities: {education.activities}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showEducationForm && (
          <motion.div
            key="education-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="space-y-4"
          >
            <Form {...educationForm}>
              <form
                onSubmit={educationForm.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={educationForm.control}
                    name="from"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label className="text-sm">From*</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="2020"
                            className={
                              fieldState.error ? "border-red-500" : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={educationForm.control}
                    name="to"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label className="text-sm">To*</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="2024 or Present"
                            className={
                              fieldState.error ? "border-red-500" : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={educationForm.control}
                    name="degree"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label className="text-sm">Degree/Certification*</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Bachelor of Science"
                            className={
                              fieldState.error ? "border-red-500" : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={educationForm.control}
                    name="fieldOfStudy"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label className="text-sm">Field of Study</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Computer Science"
                            className={
                              fieldState.error ? "border-red-500" : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={educationForm.control}
                  name="institution"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Label className="text-sm">Institution*</Label>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Stanford University"
                          className={fieldState.error ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={educationForm.control}
                    name="location"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label className="text-sm">Location</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Stanford, CA"
                            className={
                              fieldState.error ? "border-red-500" : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={educationForm.control}
                    name="gpa"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label className="text-sm">GPA</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="3.8"
                            className={
                              fieldState.error ? "border-red-500" : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={educationForm.control}
                  name="url"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Label className="text-sm">URL</Label>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://stanford.edu"
                          className={fieldState.error ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={educationForm.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Label className="text-sm">Description</Label>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Relevant coursework, achievements, etc..."
                          className={`resize-none ${
                            fieldState.error ? "border-red-500" : ""
                          }`}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={educationForm.control}
                  name="classmates"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Label className="text-sm">Classmates</Label>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe, Jane Smith"
                          className={fieldState.error ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}