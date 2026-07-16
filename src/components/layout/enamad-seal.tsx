const ENAMAD_ID = "757862";
const ENAMAD_CODE = "cIWUyYTDCLCQXkaASfnimoQSIzRFIXrZ";
const ENAMAD_URL = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_LOGO_URL = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

/** کد رسمی نماد اعتماد الکترونیکی — از img معمولی برای سازگاری با سرویس enamad */
export function EnamadSeal() {
  return (
    <a
      referrerPolicy="origin"
      target="_blank"
      rel="noopener noreferrer"
      href={ENAMAD_URL}
      className="inline-flex shrink-0 rounded-lg border border-border/50 bg-background/40 p-1.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-background/60"
      aria-label="نماد اعتماد الکترونیکی"
    >
      <img
        referrerPolicy="origin"
        src={ENAMAD_LOGO_URL}
        alt="نماد اعتماد الکترونیکی"
        className="h-14 w-auto cursor-pointer sm:h-16"
        {...{ code: ENAMAD_CODE }}
      />
    </a>
  );
}
