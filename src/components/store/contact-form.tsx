"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "loading" | "success" | "error";

const FIELD_CLASS =
  "border-border bg-background placeholder:text-muted-foreground/60";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameFa: String(fd.get("nameFa") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          subjectFa: String(fd.get("subjectFa") ?? ""),
          bodyFa: String(fd.get("bodyFa") ?? ""),
          website: String(fd.get("website") ?? ""),
        }),
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

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center border border-primary/40 bg-card px-6 py-12 text-center"
      >
        <CheckCircle2 className="size-9 stroke-[1.2] text-primary" aria-hidden />
        <h2 className="ds-heading mt-4 text-foreground">پیام شما ارسال شد</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button
          variant="outline"
          size="touch"
          className="mt-6 px-6"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
          }}
        >
          ارسال پیام دیگر
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {/* تله‌ی ربات — از دید کاربر و صفحه‌خوان پنهان */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">وب‌سایت</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">
            نام و نام خانوادگی <span className="text-primary">*</span>
          </Label>
          <Input
            id="contact-name"
            name="nameFa"
            required
            autoComplete="name"
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-phone">
            شماره تماس <span className="text-primary">*</span>
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            dir="ltr"
            autoComplete="tel"
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">ایمیل (اختیاری)</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-subject">موضوع</Label>
          <Input id="contact-subject" name="subjectFa" className={FIELD_CLASS} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-body">
          متن پیام <span className="text-primary">*</span>
        </Label>
        <Textarea
          id="contact-body"
          name="bodyFa"
          required
          rows={6}
          className={FIELD_CLASS}
          aria-describedby={message ? "contact-status" : undefined}
          aria-invalid={status === "error" || undefined}
        />
      </div>

      {message && status === "error" ? (
        <p id="contact-status" role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          variant="luxury"
          size="touch"
          disabled={status === "loading"}
          className="gap-2 px-8"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          ارسال پیام
        </Button>
      </div>
    </form>
  );
}
