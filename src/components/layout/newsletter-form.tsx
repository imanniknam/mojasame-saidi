"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm({ source = "footer" }: { source?: "footer" | "homepage" }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json()) as
        | { ok: true; message: string }
        | { ok: false; error: { message: string } };

      if (data.ok) {
        setStatus("success");
        setMessage(data.message);
        form.reset();
      } else {
        setStatus("error");
        setMessage(data.error.message);
      }
    } catch {
      setStatus("error");
      setMessage("ارتباط با سرور برقرار نشد. اتصال خود را بررسی کنید.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Label htmlFor="newsletter-email" className="sr-only">
        ایمیل برای عضویت در خبرنامه
      </Label>
      <div className="flex flex-col gap-2">
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          placeholder="ایمیل خود را وارد کنید"
          aria-describedby={message ? "newsletter-status" : undefined}
          aria-invalid={status === "error" || undefined}
          className="h-11 border-border bg-background text-sm placeholder:text-start placeholder:text-muted-foreground/70"
        />
        <Button
          type="submit"
          variant="luxury"
          size="touch"
          disabled={status === "loading"}
          className="gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          عضویت
        </Button>
      </div>

      {message ? (
        <p
          id="newsletter-status"
          role="status"
          aria-live="polite"
          className={
            status === "success"
              ? "mt-2.5 text-[0.75rem] text-primary"
              : "mt-2.5 text-[0.75rem] text-destructive"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
