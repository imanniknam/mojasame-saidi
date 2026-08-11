-- فرم تماس با ما حالا شماره موبایل را الزامی و ایمیل را اختیاری می‌کند.
-- جدول در حال حاضر خالی است (بررسی شد)، پس نیازی به بک‌فیل قبل از سخت‌گیری روی phone نیست.
ALTER TABLE "ContactMessage" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "ContactMessage" ALTER COLUMN "phone" SET NOT NULL;
