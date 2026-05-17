/** تبدیل عنوان فارسی به پیشنهاد اسلاگ لاتین */
export function suggestSlugFromTitle(title: string): string {
  const map: Record<string, string> = {
    آ: "a",
    ا: "a",
    ب: "b",
    پ: "p",
    ت: "t",
    ث: "s",
    ج: "j",
    چ: "ch",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "z",
    ر: "r",
    ز: "z",
    ژ: "zh",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "z",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "gh",
    ک: "k",
    گ: "g",
    ل: "l",
    م: "m",
    ن: "n",
    و: "v",
    ه: "h",
    ی: "y",
    ئ: "y",
    ء: "",
    " ": "-",
    "_": "-",
  };

  let slug = "";
  for (const char of title.trim().toLowerCase()) {
    if (map[char] !== undefined) slug += map[char];
    else if (/[a-z0-9-]/.test(char)) slug += char;
  }

  return slug
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
