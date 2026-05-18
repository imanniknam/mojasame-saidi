"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  createImageId,
  filesWithinLimit,
  moveImageInList,
  normalizeProductImages,
  type PendingImageItem,
  type ProductImageFieldValue,
} from "@/lib/admin/products/image-upload-client";
import { AdminImageDropzone } from "@/components/admin/products/admin-image-dropzone";
import { AdminProductImageCard } from "@/components/admin/products/admin-product-image-card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type { ProductImageFieldValue } from "@/lib/admin/products/image-upload-client";

type AdminProductImagesFieldProps = {
  value: ProductImageFieldValue[];
  onChange: (images: ProductImageFieldValue[]) => void;
  fieldError?: string;
};

export function AdminProductImagesField({ value, onChange, fieldError }: AdminProductImagesFieldProps) {
  const [pending, setPending] = useState<PendingImageItem[]>([]);
  const [uploading, startUpload] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const storageHint =
    typeof window === "undefined"
      ? null
      : process.env.NEXT_PUBLIC_UPLOAD_STORAGE_DRIVER ?? "local";

  useEffect(() => {
    const blobs = blobUrlsRef.current;
    return () => {
      blobs.forEach((url) => URL.revokeObjectURL(url));
      blobs.clear();
    };
  }, []);

  const commitImages = useCallback(
    (images: ProductImageFieldValue[]) => {
      onChange(normalizeProductImages(images));
    },
    [onChange],
  );

  function setPrimary(index: number) {
    commitImages(
      value.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  }

  function removeImage(index: number) {
    const next = value.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((img) => img.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true };
    }
    commitImages(next);
  }

  function updateAlt(index: number, altFa: string) {
    commitImages(value.map((img, i) => (i === index ? { ...img, altFa } : img)));
  }

  function reorderImages(from: number, to: number) {
    commitImages(moveImageInList(value, from, to));
  }

  function removePending(id: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
        blobUrlsRef.current.delete(item.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }

  const uploadFiles = useCallback(
    (files: File[]) => {
      if (!filesWithinLimit(files.length, value.length, pending.length)) {
        toast.error("حداکثر ۱۲ تصویر برای هر محصول مجاز است.");
        return;
      }

      const placeholders: PendingImageItem[] = files.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(previewUrl);
        return {
          id: createImageId(),
          previewUrl,
          status: "uploading",
          fileName: file.name,
        };
      });

      setPending((prev) => [...prev, ...placeholders]);

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      startUpload(async () => {
        const response = await fetch("/api/upload-product-images", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as
          | { ok: true; uploads: { url: string; publicId?: string; width?: number; height?: number }[] }
          | { ok: false; error?: { message?: string }; message?: string };

        placeholders.forEach((p) => {
          URL.revokeObjectURL(p.previewUrl);
          blobUrlsRef.current.delete(p.previewUrl);
        });
        setPending((prev) => prev.filter((p) => !placeholders.some((ph) => ph.id === p.id)));

        if (!response.ok || !result.ok) {
          const message = result.ok
            ? "آپلود ناموفق بود."
            : result.error?.message ?? result.message ?? "آپلود ناموفق بود.";
          toast.error(message);
          return;
        }

        const start = value.length;
        const added: ProductImageFieldValue[] = result.uploads.map((u, i) => ({
          id: createImageId(),
          url: u.url,
          altFa: "",
          sortOrder: start + i,
          isPrimary: value.length === 0 && i === 0,
          publicId: u.publicId,
        }));

        commitImages([...value, ...added]);
        toast.success(`${added.length.toLocaleString("fa-IR")} تصویر آپلود شد.`);
      });
    },
    [commitImages, pending.length, value],
  );

  const totalSlots = value.length + pending.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>تصاویر محصول</Label>
        <span className="text-xs text-muted-foreground">
          {totalSlots.toLocaleString("fa-IR")} / ۱۲
          {storageHint === "cloudinary" ? " · Cloudinary" : " · ذخیره محلی"}
        </span>
      </div>

      <AdminImageDropzone
        onFiles={uploadFiles}
        uploading={uploading}
        currentCount={value.length}
        pendingCount={pending.length}
      />

      {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}

      {value.length === 0 && pending.length === 0 ? null : (
        <ul
          className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2",
            uploading && "pointer-events-none opacity-95",
          )}
          aria-label="گالری تصاویر محصول"
        >
          {pending.map((item) => (
            <AdminProductImageCard
              key={item.id}
              previewUrl={item.previewUrl}
              altFa=""
              isPrimary={false}
              index={0}
              total={totalSlots}
              uploading
              errorMessage={item.errorMessage}
              draggable={false}
              onAltChange={() => {}}
              onSetPrimary={() => {}}
              onRemove={() => removePending(item.id)}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
            />
          ))}

          {value.map((image, index) => (
            <AdminProductImageCard
              key={image.id}
              previewUrl={image.url}
              altFa={image.altFa}
              isPrimary={image.isPrimary}
              index={pending.length + index}
              total={totalSlots}
              isDragOver={dragOverIndex === index && dragIndex !== index}
              onAltChange={(alt) => updateAlt(index, alt)}
              onSetPrimary={() => setPrimary(index)}
              onRemove={() => removeImage(index)}
              onMoveUp={() => reorderImages(index, index - 1)}
              onMoveDown={() => reorderImages(index, index + 1)}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragOver={() => setDragOverIndex(index)}
              onDrop={() => {
                if (dragIndex !== null) reorderImages(dragIndex, index);
                setDragIndex(null);
                setDragOverIndex(null);
              }}
            />
          ))}
        </ul>
      )}

      <p className="text-xs leading-6 text-muted-foreground">
        برای تغییر ترتیب: در دسکتاپ بکشید؛ در موبایل از دکمه‌های بالا/پایین استفاده کنید. با تنظیم{" "}
        <code className="rounded bg-muted px-1" dir="ltr">
          UPLOAD_STORAGE_DRIVER=cloudinary
        </code>{" "}
        آپلود مستقیم به Cloudinary فعال می‌شود.
      </p>
    </div>
  );
}
