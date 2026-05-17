"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, remainingImageSlots } from "@/lib/admin/products/image-upload-client";
import { cn } from "@/lib/utils";

export type AdminImageDropzoneProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  uploading?: boolean;
  currentCount: number;
  pendingCount?: number;
  className?: string;
};

export function AdminImageDropzone({
  onFiles,
  disabled,
  uploading,
  currentCount,
  pendingCount = 0,
  className,
}: AdminImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const slotsLeft = remainingImageSlots(currentCount, pendingCount);

  const pickFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length || disabled || uploading) return;
      const files = Array.from(fileList).slice(0, slotsLeft);
      if (files.length) onFiles(files);
    },
    [disabled, onFiles, slotsLeft, uploading],
  );

  const inactive = disabled || uploading || slotsLeft === 0;

  return (
    <div
      className={cn("relative", className)}
      onDragEnter={(e) => {
        e.preventDefault();
        if (!inactive) setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!inactive) setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (inactive) return;
        pickFiles(e.dataTransfer.files);
      }}
    >
      <button
        type="button"
        disabled={inactive}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex min-h-[10rem] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors sm:min-h-[8.5rem]",
          dragOver && !inactive
            ? "border-highlight bg-highlight/10"
            : "border-border/80 bg-muted/10 hover:border-highlight/40 hover:bg-muted/20",
          inactive && "cursor-not-allowed opacity-60",
        )}
      >
        {uploading ? (
          <Loader2 className="size-10 animate-spin text-highlight" aria-hidden />
        ) : dragOver ? (
          <Upload className="size-10 text-highlight" aria-hidden />
        ) : (
          <ImagePlus className="size-10 text-muted-foreground" aria-hidden />
        )}
        <span className="text-sm font-semibold text-foreground">
          {uploading
            ? "در حال آپلود..."
            : slotsLeft === 0
              ? "حداکثر ۱۲ تصویر"
              : "تصاویر را بکشید و رها کنید"}
        </span>
        <span className="max-w-sm text-xs leading-6 text-muted-foreground">
          {slotsLeft > 0
            ? `یا لمس کنید — ${slotsLeft.toLocaleString("fa-IR")} جای خالی · JPEG, PNG, WebP, AVIF تا ۵MB`
            : "برای افزودن تصویر جدید، ابتدا یکی را حذف کنید."}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        className="sr-only"
        disabled={inactive}
        onChange={(e) => {
          pickFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
