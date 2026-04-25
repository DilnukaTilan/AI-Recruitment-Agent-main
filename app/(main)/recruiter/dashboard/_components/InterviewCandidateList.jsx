"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MailPlus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/services/supabaseClient";
import {
  DEFAULT_CANDIDATE_MAX_JOINS,
  normalizeCandidateAccessList,
  normalizeCandidateJoinLimit,
  splitCandidateEmails,
} from "@/lib/interviewCandidates";

function InterviewCandidateList({
  interviewId,
  ownerEmail,
  interviewTitle,
  initialCandidateAccessList,
  onCandidatesChange,
}) {
  const normalizedInitialAccessList = useMemo(
    () => normalizeCandidateAccessList(initialCandidateAccessList),
    [initialCandidateAccessList],
  );
  const [candidateAccessList, setCandidateAccessList] = useState(
    normalizedInitialAccessList,
  );
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCandidateAccessList(normalizedInitialAccessList);
  }, [normalizedInitialAccessList]);

  const hasChanges =
    JSON.stringify(candidateAccessList) !==
    JSON.stringify(normalizedInitialAccessList);

  const handleAddEmails = () => {
    const rawEntries = splitCandidateEmails(emailInput);
    if (rawEntries.length === 0) {
      toast.error("Enter at least one candidate email address.");
      return;
    }

    const existingEmails = new Set(
      candidateAccessList.map((entry) => entry.email),
    );
    const normalizedEntries = normalizeCandidateAccessList(rawEntries)
      .filter((entry) => !existingEmails.has(entry.email))
      .map((entry) => ({
        ...entry,
        maxJoins: DEFAULT_CANDIDATE_MAX_JOINS,
      }));

    if (normalizedEntries.length === 0) {
      toast.error("Please enter valid email addresses.");
      return;
    }

    const nextAccessList = normalizeCandidateAccessList([
      ...candidateAccessList,
      ...normalizedEntries,
    ]);

    setCandidateAccessList(nextAccessList);
    setEmailInput("");

    if (normalizedEntries.length !== rawEntries.length) {
      toast.success(
        "Added valid emails and skipped invalid or duplicate ones.",
      );
      return;
    }

    toast.success(
      `${normalizedEntries.length} candidate email${normalizedEntries.length > 1 ? "s were" : " was"} added.`,
    );
  };

  const handleRemoveEmail = (emailToRemove) => {
    setCandidateAccessList((currentEntries) =>
      currentEntries.filter((entry) => entry.email !== emailToRemove),
    );
  };

  const handleUpdateMaxJoins = (emailToUpdate, value) => {
    setCandidateAccessList((currentEntries) =>
      currentEntries.map((entry) =>
        entry.email === emailToUpdate
          ? {
              ...entry,
              maxJoins: normalizeCandidateJoinLimit(value),
            }
          : entry,
      ),
    );
  };

  const handleSave = async () => {
    if (!interviewId) {
      toast.error(
        "Interview information is missing. Please refresh and try again.",
      );
      return;
    }

    setSaving(true);
    try {
      const candidateEmails = candidateAccessList.map(({ email }) => email);

      let updateQuery = supabase
        .from("interviews")
        .update({
          candidateEmails,
          candidateAccessList,
        })
        .eq("interview_id", interviewId);

      if (ownerEmail) {
        updateQuery = updateQuery.eq("userEmail", ownerEmail);
      }

      const { error } = await updateQuery;

      if (error) throw error;

      onCandidatesChange?.(candidateAccessList);
      toast.success("Candidate access list saved.");
    } catch (error) {
      console.error("Failed to update candidate access list:", error);
      toast.error("Failed to save candidate access list. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full border-slate-200 bg-white/95 text-slate-600 shadow-sm backdrop-blur hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
          title="Manage interview candidates"
        >
          <Users className="h-4 w-4" />
          <span className="sr-only">Manage interview candidates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Candidate Access List</DialogTitle>
          <DialogDescription>
            Add the email addresses that are allowed to join{" "}
            <span className="font-semibold text-slate-700">
              {interviewTitle}
            </span>
            . Only these candidates will be able to start this interview, and
            you can control how many times each saved candidate may join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Users className="h-4 w-4" />
              Allowed candidates
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Paste one email per line, or separate multiple emails with commas.
            </p>

            <div className="mt-3 space-y-3">
              <Textarea
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                rows={4}
                placeholder={"candidate1@example.com\ncandidate2@example.com"}
                className="rounded-xl border-slate-200 bg-white"
              />
              <div className="flex justify-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEmails}
                  className="w-auto rounded-xl border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <MailPlus className="h-4 w-4" />
                  Add Emails
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">
                Current candidate list
              </h4>
              <Badge className="bg-slate-100 text-slate-700">
                {candidateAccessList.length} candidate
                {candidateAccessList.length === 1 ? "" : "s"}
              </Badge>
            </div>

            {candidateAccessList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No candidates added yet. Until you save at least one email,
                nobody will be able to join this interview.
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {candidateAccessList.map((candidate) => (
                  <div
                    key={candidate.email}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm text-slate-700">
                        {candidate.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Default allowed joins: {DEFAULT_CANDIDATE_MAX_JOINS}
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-3 sm:justify-end">
                      <div className="w-24 shrink-0">
                        <Label
                          htmlFor={`max-joins-${candidate.email}`}
                          className="mb-1 text-xs text-slate-500"
                        >
                          Joins
                        </Label>
                        <Input
                          id={`max-joins-${candidate.email}`}
                          type="number"
                          min="1"
                          step="1"
                          value={candidate.maxJoins}
                          onChange={(event) =>
                            handleUpdateMaxJoins(
                              candidate.email,
                              event.target.value,
                            )
                          }
                          className="rounded-xl border-slate-200 bg-slate-50 text-sm"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEmail(candidate.email)}
                        className="shrink-0 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title={`Remove ${candidate.email}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="w-full sm:w-auto rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Candidate List"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InterviewCandidateList;
