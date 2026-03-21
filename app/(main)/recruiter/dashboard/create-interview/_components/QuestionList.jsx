"use client";

import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import {
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  AlertCircleIcon,
  PencilIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  RefreshCwIcon,
  SparklesIcon,
  CheckCircle2Icon,
  CoinsIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/services/supabaseClient";

const QUESTION_TYPES = [
  { value: "Technical", label: "Technical" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Experience", label: "Experience" },
  { value: "Problem-Solving", label: "Problem-Solving" },
  { value: "Leadership", label: "Leadership" },
  { value: "Introduction", label: "Introduction" },
  { value: "Location", label: "Location" },
  { value: "Motivation", label: "Motivation" },
  { value: "Salary", label: "Salary" },
  { value: "Closing", label: "Closing" },
];

const TYPE_BADGE_STYLES = {
  Technical: "bg-blue-50 text-blue-700 border border-blue-200",
  Behavioral: "bg-violet-50 text-violet-700 border border-violet-200",
  Experience: "bg-amber-50 text-amber-700 border border-amber-200",
  "Problem-Solving": "bg-orange-50 text-orange-700 border border-orange-200",
  Leadership: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Introduction: "bg-sky-50 text-sky-700 border border-sky-200",
  Location: "bg-teal-50 text-teal-700 border border-teal-200",
  Motivation: "bg-pink-50 text-pink-700 border border-pink-200",
  Salary: "bg-lime-50 text-lime-700 border border-lime-200",
  Closing: "bg-gray-50 text-gray-700 border border-gray-200",
};

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

function QuestionList({
  formData,
  onCreateLink,
  questionList,
  setQuestionList,
}) {
  const [loading, setLoading] = useState(!questionList);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionType, setNewQuestionType] = useState(
    QUESTION_TYPES[0].value,
  );
  const { user, updateUserCredits } = useUser();

  const abortControllerRef = useRef(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState("");
  const [editingType, setEditingType] = useState(QUESTION_TYPES[0].value);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const GenerateQuestionList = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await axios.post(
        "/api/ai-model",
        { ...formData },
        { signal: controller.signal },
      );

      const rawContent = result?.data?.content || result?.data?.Content;

      if (!rawContent) {
        setError("Invalid response format from AI. Please try again.");
        toast("Invalid response format.");
        setLoading(false);
        return;
      }

      const parsedData =
        typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;

      if (parsedData?.interviewQuestions) {
        parsedData.interviewQuestions = parsedData.interviewQuestions.map(
          (q) => ({ ...q, id: uuidv4() }),
        );
      }

      setQuestionList(parsedData);
      setLoading(false);
    } catch (e) {
      if (axios.isCancel(e) || e?.name === "CanceledError") return;

      setError("Failed to generate questions. Please try again.");
      toast("A server error occurred. Please try again.");
      console.error("Error generating questions:", e);
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    if (!questionList) {
      GenerateQuestionList();
    }
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast("Please enter a question.");
      return;
    }

    setQuestionList((prev) => {
      if (!prev || !prev.interviewQuestions) return prev;

      const newQuestionObj = {
        id: uuidv4(),
        question: newQuestion,
        type: newQuestionType,
      };

      return {
        ...prev,
        interviewQuestions: [...prev.interviewQuestions, newQuestionObj],
      };
    });

    setNewQuestion("");
    setNewQuestionType(QUESTION_TYPES[0].value);
    toast.success("The question was added successfully.");
  };

  const handleDeleteQuestion = (id) => {
    setQuestionList((prev) => {
      if (!prev?.interviewQuestions) return prev;

      return {
        ...prev,
        interviewQuestions: prev.interviewQuestions.filter((q) => q.id !== id),
      };
    });

    setDeleteDialogOpen(false);
    setDeletingId(null);
    toast.success("The question was deleted successfully.");
  };

  const openDeleteDialog = (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleEditQuestion = (id) => {
    const q = questionList.interviewQuestions.find((q) => q.id === id);
    if (!q) return;

    setEditingId(id);
    setEditingQuestion(q.question);
    const matchedType = QUESTION_TYPES.find(
      (t) => t.value.toLowerCase() === (q.type || "").toLowerCase(),
    );
    setEditingType(matchedType ? matchedType.value : QUESTION_TYPES[0].value);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingQuestion.trim()) {
      toast("The question cannot be empty.");
      return;
    }

    setQuestionList((prev) => {
      if (!prev?.interviewQuestions) return prev;

      return {
        ...prev,
        interviewQuestions: prev.interviewQuestions.map((q) =>
          q.id === editingId
            ? { ...q, question: editingQuestion, type: editingType }
            : q,
        ),
      };
    });

    setEditDialogOpen(false);
    setEditingId(null);
    toast.success("The question was updated successfully.");
  };

  const handleMoveQuestion = (index, direction) => {
    setQuestionList((prev) => {
      if (!prev?.interviewQuestions) return prev;

      const questions = [...prev.interviewQuestions];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= questions.length) return prev;

      [questions[index], questions[targetIndex]] = [
        questions[targetIndex],
        questions[index],
      ];

      return { ...prev, interviewQuestions: questions };
    });
  };

  const handleRefreshQuestions = () => {
    GenerateQuestionList();
    setRegenerateCount((c) => c + 1);
    toast("Regenerating the questions…");
  };

  const onFinish = async () => {
    if (!questionList?.interviewQuestions?.length) {
      toast.error("Please add at least one question before finishing.");
      return;
    }

    setSaveLoading(true);
    const interview_id = uuidv4();

    try {
      const { data: freshUserData, error: fetchError } = await supabase
        .from("users")
        .select("credits")
        .eq("email", user?.email)
        .single();

      if (fetchError || !freshUserData) {
        toast.error("Could not verify your credits. Please try again.");
        setSaveLoading(false);
        return;
      }

      const currentCredits = freshUserData.credits ?? 0;

      if (currentCredits <= 0) {
        toast.error("You don't have enough credits to create an interview.");
        setSaveLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("interviews")
        .insert([
          {
            ...formData,
            questionList: questionList,
            userEmail: user?.email,
            interview_id: interview_id,
          },
        ])
        .select();

      if (insertError) {
        toast.error("Failed to save the interview. Please try again.");
        console.error("Supabase error:", insertError);
        setSaveLoading(false);
        return;
      }

      const newCredits = currentCredits - 1;
      const creditUpdateResult = await updateUserCredits(newCredits);

      if (!creditUpdateResult.success) {
        toast.error(
          "The interview was saved, but we failed to deduct a credit. Please contact support.",
        );
      } else {
        toast.success(
          `The interview was saved! You now have ${newCredits} credit${newCredits !== 1 ? "s" : ""} remaining.`,
        );
      }

      try {
        onCreateLink(interview_id);
      } catch (callbackError) {
        console.error("Error in onCreateLink callback:", callbackError);
        toast.error("The interview was saved, but we failed to generate the link.");
      }
    } catch (e) {
      console.error("Error saving interview:", e);
      toast.error("An error occurred while saving the interview. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const userCredits = user?.credits ?? 0;
  const questions = questionList?.interviewQuestions ?? [];
  const canFinish = !saveLoading && userCredits > 0 && questions.length > 0;

  return (
    <div className="space-y-6">
      {loading && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col items-center gap-5 px-8 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Loader2Icon className="h-7 w-7 animate-spin text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Generating Interview Questions
              </h2>
              <p className="text-sm text-slate-500">
                Our AI is crafting personalised questions based on your job
                position. This may take a moment.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-white shadow-[0_10px_35px_-20px_rgba(239,68,68,0.2)]">
          <div className="flex flex-col items-center gap-4 px-8 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-200">
              <AlertCircleIcon className="h-7 w-7 text-red-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">
                Something went wrong
              </h2>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
            <Button
              onClick={GenerateQuestionList}
              variant="outline"
              className="mt-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && questionList?.interviewQuestions && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
                <CoinsIcon className="h-4 w-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-slate-700">
                  Credits Remaining:
                </span>
                <span className="text-xl font-extrabold text-blue-600">
                  {userCredits}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold rounded-full bg-blue-100 text-blue-700 px-3 py-1 border border-blue-200">
              Cost: 1 Credit
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
            <div className="relative z-10 p-6 sm:p-8 space-y-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
                    Generated Questions
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {questions.length} question{questions.length !== 1 && "s"}{" "}
                    ready — reorder, edit, or add your own.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefreshQuestions}
                  disabled={regenerateCount >= 2}
                  className={`flex items-center gap-2 rounded-xl border-slate-200 transition-all duration-200 ${
                    regenerateCount >= 2
                      ? "text-slate-400 cursor-not-allowed opacity-50"
                      : "text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  }`}
                  title={
                    regenerateCount >= 2
                      ? "Regenerate limit reached"
                      : undefined
                  }
                >
                  <RefreshCwIcon className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>

              <div className="border-t border-slate-100" />

              <div>
                <SectionLabel icon={PlusIcon} label="Add a Custom Question" />
                <div className="flex flex-col sm:flex-row gap-3 mt-1">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
                    placeholder="Type your question and press Enter…"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-colors"
                  />
                  <Select
                    value={newQuestionType}
                    onValueChange={setNewQuestionType}
                  >
                    <SelectTrigger className="rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors min-w-[150px]">
                      <SelectValue placeholder="Question type" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddQuestion}
                    className="rounded-xl gap-2 cursor-pointer"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div className="space-y-3">
                {questions.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                    <SparklesIcon className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-400">
                      No questions yet. Add one above or regenerate.
                    </p>
                  </div>
                ) : (
                  questions.map((item, index) => (
                    <div
                      key={item.id}
                      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          {item.question}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            TYPE_BADGE_STYLES[item.type] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => handleMoveQuestion(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move question up"
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleMoveQuestion(index, "down")}
                          disabled={index === questions.length - 1}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move question down"
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleEditQuestion(item.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          aria-label="Edit question"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openDeleteDialog(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          aria-label="Delete question"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex justify-end">
                <Button
                  onClick={onFinish}
                  disabled={!canFinish}
                  className={`group relative overflow-hidden rounded-xl px-8 font-semibold text-white shadow-md transition-all duration-300 gap-2 ${
                    canFinish
                      ? "bg-linear-to-r from-blue-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-500/40 hover:from-indigo-600 hover:to-blue-500 cursor-pointer"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                  size="lg"
                >
                  {saveLoading ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : userCredits <= 0 ? (
                    "No Credits Available"
                  ) : questions.length === 0 ? (
                    "Add at Least One Question"
                  ) : (
                    <>
                      <CheckCircle2Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      Create Interview Link & Finish
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl cursor-pointer"
              onClick={() => handleDeleteQuestion(deletingId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Modify the question text or change its type, then save your
              changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Question
              </label>
              <textarea
                value={editingQuestion}
                onChange={(e) => setEditingQuestion(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Type
              </label>
              <Select value={editingType} onValueChange={setEditingType}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors">
                  <SelectValue placeholder="Question type" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer"
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuestionList;
