"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useRef } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigation } from "@/components/layout/navigation-context";

/** مودال جستجو — مشترک بین هدر و نوار پایین موبایل */
export function SearchNavDialog() {
  const { searchOpen, setSearchOpen } = useNavigation();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formId = useId();

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 80);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    }
  }

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent anchor="top" className="gap-5 p-5 sm:p-6">
        <DialogHeader className="text-start">
          <DialogTitle>جستجو در محصولات</DialogTitle>
          <DialogDescription>
            نام محصول، دسته یا ویژگی را بنویسید؛ اینتر برای مشاهده نتایج.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2 text-start">
            <Label htmlFor={`${formId}-q`} className="sr-only">
              عبارت جستجو
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={inputRef}
                id={`${formId}-q`}
                name="q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="مثلاً گلدان سنگی، تندیس، جاشمعی…"
                className="h-14 border-border/90 bg-muted/25 pe-12 text-base shadow-inner md:h-12"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="touch"
              className="w-full sm:w-auto sm:px-4 sm:py-2"
              onClick={() => setSearchOpen(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="luxury"
              size="touch"
              className="w-full sm:w-auto sm:px-6 sm:py-2"
            >
              جستجو
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
