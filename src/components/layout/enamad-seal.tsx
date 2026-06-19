const ENAMAD_ID = "746421";
const ENAMAD_CODE = "fPPuL6i6yXkALAgNtwZsLXDuNO8WXF8w";
const ENAMAD_URL = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_LOGO_URL = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

/** کد رسمی نماد اعتماد الکترونیکی — بدون rel="noopener noreferrer" */
export function EnamadSeal() {
  return (
    <a referrerPolicy="origin" target="_blank" href={ENAMAD_URL}>
      <img
        referrerPolicy="origin"
        src={ENAMAD_LOGO_URL}
        alt="نماد اعتماد الکترونیکی"
        style={{ cursor: "pointer" }}
        {...{ code: ENAMAD_CODE }}
      />
    </a>
  );
}
