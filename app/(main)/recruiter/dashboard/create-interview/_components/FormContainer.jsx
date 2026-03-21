import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InterviewType } from "@/services/Constants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Clock,
  LayoutGrid,
} from "lucide-react";

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

function FormContainer({ formData, onHandleInputChange, GoToNext }) {
  const [interviewType, setInterviewType] = useState(formData?.type || []);

  useEffect(() => {
    onHandleInputChange("type", interviewType);
  }, [interviewType]);

  const addInterviewType = (name) => {
    setInterviewType((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  return (
    <div className="space-y-7">
      <div>
        <SectionLabel icon={Briefcase} label="Job Position" />
        <Input
          placeholder="e.g. Software Engineer"
          defaultValue={formData?.jobPosition || ""}
          className="rounded-xl border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
          onChange={(e) => onHandleInputChange("jobPosition", e.target.value)}
        />
      </div>

      <div>
        <SectionLabel icon={FileText} label="Job Description" />
        <Textarea
          placeholder="Describe the role, responsibilities, and requirements..."
          defaultValue={formData?.jobDescription || ""}
          className="h-[180px] rounded-xl border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-blue-400/20 transition-colors resize-none"
          onChange={(e) =>
            onHandleInputChange("jobDescription", e.target.value)
          }
        />
      </div>

      <div>
        <SectionLabel icon={Clock} label="Interview Duration" />
        <Select
          defaultValue={formData?.duration || undefined}
          onValueChange={(value) => onHandleInputChange("duration", value)}
        >
          <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-blue-400/20 transition-colors">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {["5 Min", "15 Min", "30 Min", "45 Min", "60 Min"].map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <SectionLabel icon={LayoutGrid} label="Interview Type" />
        <p className="text-xs text-slate-400 mb-3 -mt-1">
          Select one or more types that apply
        </p>
        <div className="flex flex-wrap gap-2.5">
          {InterviewType.map((type, index) => {
            const isActive = interviewType.includes(type.name);
            return (
              <button
                key={index}
                type="button"
                onClick={() => addInterviewType(type.name)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                  ${
                    isActive
                      ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/25 scale-[1.03]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  }`}
              >
                <type.icon
                  className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`}
                />
                {type.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      <div className="flex justify-center sm:justify-end">
        <Button
          onClick={() => GoToNext()}
          size="lg"
          className="group relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-500 hover:shadow-2xl hover:shadow-indigo-500/40 cursor-pointer"
        >
          <span className="relative flex items-center gap-2">
            Generate Questions
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </span>
        </Button>
      </div>
    </div>
  );
}

export default FormContainer;
