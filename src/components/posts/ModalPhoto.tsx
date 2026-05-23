"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";

interface ModalPhotoProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalPhoto({ open, onClose, children }: ModalPhotoProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-dvh max-w-screen border-none bg-black/90 p-0">
        <DialogHeader>
          <DialogTitle className="sr-only"></DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}