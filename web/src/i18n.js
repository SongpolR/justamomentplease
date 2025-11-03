import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      app_title: "Virtual Pager",
      health_ok: "All systems are go",

      // Auth / Signup
      signup: "Sign up",
      login: "Sign in",
      logout: "Sign out",
      your_name: "Your name",
      email: "Email",
      password: "Password",
      shop_name: "Shop name",
      shop_logo: "Shop logo (≤2MB, ≤1024×1024)",
      create_account: "Create your account",
      invalid_login: "Invalid login",
      password_rule: "Min 8, 1 uppercase, 1 number. Allowed: !@#$%^&*._-",
      field_requirements: "Requirements",
      logo_requirements_title: "Logo requirements",
      logo_req_size: "File size ≤ 2 MB",
      logo_req_resolution: "Resolution ≤ 1024×1024 px",
      logo_req_types: "PNG / JPG / JPEG",
      password_requirements_title: "Password requirements",
      pw_req_length: "At least 8 characters",
      pw_req_upper: "At least 1 uppercase letter (A–Z)",
      pw_req_number: "At least 1 number (0–9)",
      pw_req_chars:
        "Allowed characters: letters, numbers, ! @ # $ % ^ & * . _ -",
      preview: "Preview",
      invalid_image_file: "Invalid image file",
      logo_too_big: "Logo must be ≤ 2 MB",
      logo_too_large_resolution: "Logo must be ≤ 1024×1024 px",

      // Misc
      or_signin: "Or sign in",
    },
  },
  th: {
    translation: {
      app_title: "เพจเจอร์เรียกคิว",
      health_ok: "ระบบพร้อมทำงาน",

      signup: "สมัครสมาชิก",
      login: "เข้าสู่ระบบ",
      logout: "ออกจากระบบ",
      your_name: "ชื่อของคุณ",
      email: "อีเมล",
      password: "รหัสผ่าน",
      shop_name: "ชื่อร้าน",
      shop_logo: "โลโก้ร้าน (≤2MB, ≤1024×1024)",
      create_account: "สร้างบัญชีของคุณ",
      invalid_login: "เข้าสู่ระบบไม่สำเร็จ",
      password_rule:
        "อย่างน้อย 8 ตัว มีตัวพิมพ์ใหญ่ 1 ตัว ตัวเลข 1 ตัว อนุญาต !@#$%^&*._-",
      field_requirements: "ข้อกำหนด",
      logo_requirements_title: "ข้อกำหนดโลโก้",
      logo_req_size: "ขนาดไฟล์ ≤ 2 MB",
      logo_req_resolution: "ความละเอียด ≤ 1024×1024 พิกเซล",
      logo_req_types: "รองรับ PNG / JPG / JPEG",
      password_requirements_title: "ข้อกำหนดรหัสผ่าน",
      pw_req_length: "อย่างน้อย 8 ตัวอักษร",
      pw_req_upper: "มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A–Z)",
      pw_req_number: "มีตัวเลขอย่างน้อย 1 ตัว (0–9)",
      pw_req_chars: "อักขระที่อนุญาต: A–Z a–z 0–9 และ ! @ # $ % ^ & * . _ -",
      preview: "ตัวอย่าง",
      invalid_image_file: "ไฟล์รูปภาพไม่ถูกต้อง",
      logo_too_big: "โลโก้ต้องมีขนาด ≤ 2 MB",
      logo_too_large_resolution: "โลโก้ต้องมีความละเอียด ≤ 1024×1024 พิกเซล",

      or_signin: "หรือ เข้าสู่ระบบ",
    },
  },
};

i18n
  .use(LanguageDetector) // 👈 add this
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    detection: {
      // persist in localStorage
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
