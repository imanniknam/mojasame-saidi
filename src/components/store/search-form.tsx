"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchFormProps = {
  defaultQuery?: string;
  autoFocus?: boolean;
};

export function SearchForm({ defaultQuery = "", autoFocus = false }: SearchFormProps) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/search");
    }
  }

  function onClear() {
    router.push("/search");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" role="search">
      <Label htmlFor="store-search-q" className="sr-only">
        جستجو در محصولات
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="store-search-q"
            name="q"
            type="search"
            defaultValue={defaultQuery}
            autoFocus={autoFocus}
            enterKeyHint="search"
            autoComplete="off"
            placeholder="نام محصول، دسته یا کد…"
            className="h-12 border-border/90 bg-muted/25 pe-12 text-base shadow-inner sm:h-11"
          />
        </div>
        <div className="flex gap-2">
          {defaultQuery ? (
            <Button
              type="button"
              variant="outline"
              size="touch"
              className="shrink-0 px-4"
              onClick={onClear}
              aria-label="پاک کردن جستجو"
            >
              <X className="size-5" />
            </Button>
          ) : null}
          <Button type="submit" variant="luxury" size="touch" className="min-w-[7rem] flex-1 sm:flex-none">
            جستجو
          </Button>
        </div>
      </div>
    </form>
  );
}
