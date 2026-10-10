"use client";

import React from "react";
import { User } from "../../types";
import { useSocial } from "../../context/SocialContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Ban } from "lucide-react";

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function BlockUserModal({ isOpen, onClose, user }: BlockUserModalProps) {
  const { blockUser } = useSocial();
  const { showToast } = useToast();

  if (!user) return null;

  const handleConfirmBlock = () => {
    blockUser(user);
    showToast(`Blocked @${user.username}`, "info");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block User" maxWidth="sm">
      <div className="space-y-4 select-none">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
          <Avatar src={user.avatarUrl} alt="" size="md" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {user.displayName}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 truncate">
              @{user.username}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-zinc-300">
          <p>When you block <strong className="text-white font-mono">@{user.username}</strong>:</p>
          <ul className="space-y-1.5 text-[11px] text-zinc-400 list-disc list-inside">
            <li>They will not be able to find your profile or see your sparks.</li>
            <li>Direct message threads will be locked and muted.</li>
            <li>They will be removed from your friends and followers lists.</li>
            <li>They won&apos;t be notified that you blocked them.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            onClick={handleConfirmBlock}
            className="rounded-xl text-xs font-bold gap-1.5 shadow-sm active:scale-95"
          >
            <Ban size={13} />
            Block @{user.username}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
