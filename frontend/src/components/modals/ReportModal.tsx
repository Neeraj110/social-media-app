"use client";

import React, { useState } from "react";
import { User, Post } from "../../types";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ShieldAlert, Check } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
  targetPost?: Post | null;
}

const REPORT_REASONS = [
  { id: "spam", label: "Spam or automated engagement" },
  { id: "harassment", label: "Harassment or hateful conduct" },
  { id: "misinformation", label: "Misleading or fraudulent content" },
  { id: "ip_theft", label: "Intellectual property or code theft" },
  { id: "violence", label: "Violence or dangerous goods" },
  { id: "other", label: "Other community guideline breach" },
];

export function ReportModal({
  isOpen,
  onClose,
  targetUser,
  targetPost,
}: ReportModalProps) {
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].id);
  const [details, setDetails] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      showToast("Thank you. Safety report dispatched to Nexus Trust & Safety.", "success");
      setIsSubmitted(false);
      setDetails("");
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Safety Report" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 select-none">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <ShieldAlert size={18} className="shrink-0" />
          <span>
            {targetUser
              ? `Reporting @${targetUser.username}'s profile for safety evaluation.`
              : "Reporting this content for community guidelines compliance."}
          </span>
        </div>

        {/* Reason radio list */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300">
            Select Primary Reason
          </label>
          <div className="space-y-1.5">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs active:scale-[0.99] ${
                  selectedReason === reason.id
                    ? "bg-primary/15 border-primary/40 text-white"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span>{reason.label}</span>
                {selectedReason === reason.id && (
                  <Check size={14} className="text-primary font-bold" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Additional notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-300">
            Additional Context (Optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            placeholder="Provide any additional details for our review team..."
            className="w-full glass-input rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-500 resize-none focus:border-primary/50 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={isSubmitted}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-sm text-xs active:scale-95"
          >
            {isSubmitted ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
