"use client";

import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";
import { shouldUnoptimizeImageUrl } from "@/lib/storage/image-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AdminProductImageCardProps = {
  previewUrl: string;
  altFa: string;
  isPrimary: boolean;
  index: number;
  total: number;
  uploading?: boolean;
  errorMessage?: string;
  draggable?: boolean;
  isDragOver?: boolean;
  onAltChange: (alt: string) => void;
  onSetPrimary: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
};

export function AdminProductImageCard({
  previewUrl,
  altFa,
  isPrimary,
  index,
  total,
  uploading,
  errorMessage,
  draggable = true,
  isDragOver,
  onAltChange,
  onSetPrimary,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: AdminProductImageCardProps) {
  return (
    <li
      draggable={draggable && !uploading}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card/50 p-3 transition-colors",
        isDragOver ? "border-highlight bg-highlight/5" : "border-border/60",
        uploading && "opacity-80",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex size-10 shrink-0 cursor-grab items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground active:cursor-grabbing"
          aria-hidden
        >
          <GripVertical className="size-4" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {index + 1} / {total}
        </span>
        <div className="ms-auto flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 min-h-0 min-w-0"
            disabled={index === 0 || uploading}
            onClick={onMoveUp}
            aria-label="انتقال به بالا"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 min-h-0 min-w-0"
            disabled={index === total - 1 || uploading}
            onClick={onMoveDown}
            aria-label="انتقال به پایین"
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted/20">
        <Image
          src={previewUrl}
          alt={altFa || "پیش‌نمایش تصویر"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 280px"
          unoptimized={shouldUnoptimizeImageUrl(previewUrl)}
        />
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <Loader2 className="size-8 animate-spin text-highlight" />
          </div>
        ) : null}
        {isPrimary ? (
          <span className="absolute start-2 top-2 rounded-full bg-highlight px-2 py-0.5 text-xs font-semibold text-highlight-foreground">
            اصلی
          </span>
        ) : null}
        {errorMessage ? (
          <span className="absolute inset-x-2 bottom-2 rounded-lg bg-destructive/90 px-2 py-1 text-xs text-destructive-foreground">
            {errorMessage}
          </span>
        ) : null}
      </div>

      {!uploading ? (
        <>
          <Input
            value={altFa}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="متن جایگزین (alt)"
            className="text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={isPrimary ? "luxury" : "outline"}
              size="sm"
              className="min-h-touch flex-1 gap-1 sm:flex-none"
              onClick={onSetPrimary}
            >
              <Star className="size-3.5" />
              اصلی
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-touch gap-1 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="size-3.5" />
              حذف
            </Button>
          </div>
        </>
      ) : null}
    </li>
  );
}
