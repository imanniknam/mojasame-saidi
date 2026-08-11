const ENAMAD_ID = "757862";
const ENAMAD_CODE = "cIWUyYTDCLCQXkaASfnimoQSIzRFIXrZ";
const ENAMAD_URL = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_LOGO_URL = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_LOCAL_LOGO_URL = "/images/enamad-official.png";

/** کد رسمی نماد اعتماد الکترونیکی — از img معمولی برای سازگاری با سرویس enamad */
export function EnamadSeal() {
  // سرور ای‌نماد تصویر را برای referrer لوکال با 403 رد می‌کند. در توسعه همان
  // فایل رسمی را محلی نشان می‌دهیم؛ در تولید نشان زنده‌ی ای‌نماد بارگذاری می‌شود.
  const logoUrl =
    process.env.NODE_ENV === "development" ? ENAMAD_LOCAL_LOGO_URL : ENAMAD_LOGO_URL;

  return (
    // noreferrer نباید اضافه شود؛ سرویس ای‌نماد برای اعتبارسنجی به origin نیاز دارد.
    <a
      referrerPolicy="origin"
      target="_blank"
      rel="noopener"
      href={ENAMAD_URL}
      className="inline-flex shrink-0 rounded-lg border border-border/50 bg-background/40 p-1.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-background/60"
      aria-label="نماد اعتماد الکترونیکی"
    >
      <img
        referrerPolicy="origin"
        src={logoUrl}
        alt="نماد اعتماد الکترونیکی"
        width={125}
        height={136}
        className="h-20 w-auto cursor-pointer object-contain sm:h-24"
        {...{ code: ENAMAD_CODE }}
      />
    </a>
  );
}
