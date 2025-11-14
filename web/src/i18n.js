// web/src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLang = localStorage.getItem("lang") || "en";

i18n.use(initReactI18next).init({
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },

  resources: {
    /* ------------------------------------------------------------------
     * ENGLISH
     * ------------------------------------------------------------------ */
    en: {
      translation: {
        /* ---------- General ---------- */
        loading: "Loading...",
        logout: "Logout",
        email: "Email",
        password: "Password",
        name: "Name",
        actions: "Actions",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        invalid_email: "Invalid email format",
        confirm: "Confirm",
        cancel: "Cancel",
        back: "Back",

        /* ---------- Auth / Login ---------- */
        login: "Login",
        signup: "Sign up",
        create_account: "Create account",
        sign_in_google: "Sign in with Google",
        reset_password: "Reset Password",
        incorrect_password: "Incorrect password.",
        verify_now: "Verify now",
        reset_password_here: "Reset password here",
        login_type_owner: "Owner",
        login_type_staff: "Staff",

        /* Owner login error cases */
        login_error_unverified: "Your email has not been verified.",
        login_error_bad_password: "Incorrect password.",
        login_error_no_account: "This email is not registered.",

        /* Staff login error cases */
        login_staff_not_found: "This email is not linked to any staff account.",
        login_staff_invite_pending:
          "Your staff account has not been activated yet.",
        login_staff_inactive: "This staff account is inactive.",
        login_staff_bad_password: "Incorrect password.",
        login_staff_contact_owner:
          "Please contact your shop owner to continue.",

        /* ---------- Signup ---------- */
        signup_success:
          "Sign up successful! Please check your email to verify your account.",
        password_requirements: "Password must include:",
        password_rule_uppercase: "At least one uppercase letter",
        password_rule_number: "At least one number",
        password_rule_length: "At least 8 characters",
        password_rule_symbol: "Allowed symbols: ! @ # $ % ^ & * . _ -",
        password_confirm: "Confirm Password",
        password_mismatch: "Passwords do not match",

        /* ---------- Email verification ---------- */
        verification_title: "Email Verification",
        verification_success:
          "Your email has been successfully verified. You can now log in.",
        resend_verification: "Resend verification email",

        /* ---------- Error Codes ---------- */
        errors: {
          1999: "Something went wrong. Please try again.",
          1000: "Invalid request.",
          1001: "Email already exists.",
          1002: "Email already in use.",
          1003: "Incorrect password.",
          1007: "Account not found.",
          1200: "Email not verified.",
          1202: "Invalid token.",
          1203: "Token expired.",
          1300: "Staff account inactive.",
          1403: "Staff invite pending.",
        },

        /* ---------- Staff Setup / Reset ---------- */
        staff_setup_title: "Activate Staff Account",
        staff_setup_intro:
          "Create your password to activate your staff account.",
        staff_reset_title: "Reset Staff Password",
        staff_reset_intro:
          "Enter your new password to complete the reset process.",
        reset_link_sent: "Password reset link sent successfully.",

        /* ------------------------------------------------------------------
         * ORDERS PAGE
         * ------------------------------------------------------------------ */
        orders_title: "Orders",
        orders_intro:
          "This is the shared order workspace for owners and staff. Here you will see active orders, create new ones, and mark them as ready or done.",
        orders_placeholder:
          "In the next step, we will add the real-time order list and actions here.",

        /* ------------------------------------------------------------------
         * SHOP SETTINGS
         * ------------------------------------------------------------------ */
        shop_settings_title: "Shop Settings",
        shop_name: "Shop Name",
        shop_logo: "Shop Logo",
        shop_update: "Update Shop",
        shop_update_success: "Shop information updated successfully.",
        shop_name_label: "Shop Name",
        order_numbering_mode: "Order numbering mode",
        numbering_sequential: "Sequential (resets daily)",
        numbering_random: "Random",
        customer_sound: "Customer notification sound",
        save_changes: "Save Changes",
        delete_shop: "Delete Shop",
        delete_shop_confirm:
          "Are you sure you want to delete this shop? This action cannot be undone.",

        /* Staff management section */
        invite_staff: "Invite Staff",
        staff_list: "Staff List",
        staff_name_label: "Staff Name",
        staff_email: "Staff Email",
        send_invite: "Send Invite",
        resend_invite: "Resend Invite",
        invite_sent: "Invitation email sent successfully.",
        invite_resent: "Invitation email resent successfully.",
        staff_deactivated: "Staff deactivated successfully.",
        confirm_deactivate: "Are you sure you want to deactivate this staff?",
        no_staff: "No staff members found.",

        /* ------------------------------------------------------------------
         * ACCOUNT SETTINGS
         * ------------------------------------------------------------------ */
        account_settings_title: "Account Settings",
        account_role: "Role",
        role_owner: "Owner",
        role_staff: "Staff",
        account_settings_intro:
          "Manage your personal account settings here. Additional options such as password change will be added soon.",
        change_password: "Change Password",
        password_change_coming: "Change password (coming soon)",
      },
    },

    /* ------------------------------------------------------------------
     * THAI
     * ------------------------------------------------------------------ */
    th: {
      translation: {
        /* ---------- General ---------- */
        loading: "กำลังโหลด...",
        logout: "ออกจากระบบ",
        email: "อีเมล",
        password: "รหัสผ่าน",
        name: "ชื่อ",
        actions: "การทำงาน",
        status: "สถานะ",
        active: "เปิดใช้งาน",
        inactive: "ปิดใช้งาน",
        invalid_email: "รูปแบบอีเมลไม่ถูกต้อง",
        confirm: "ยืนยัน",
        cancel: "ยกเลิก",
        back: "กลับ",

        /* ---------- Auth / Login ---------- */
        login: "เข้าสู่ระบบ",
        signup: "สมัครสมาชิก",
        create_account: "สร้างบัญชี",
        sign_in_google: "เข้าสู่ระบบด้วย Google",
        reset_password: "รีเซ็ตรหัสผ่าน",
        incorrect_password: "รหัสผ่านไม่ถูกต้อง",
        verify_now: "ยืนยันตอนนี้",
        reset_password_here: "รีเซ็ตรหัสผ่านที่นี่",
        login_type_owner: "เจ้าของ",
        login_type_staff: "พนักงาน",

        login_error_unverified: "อีเมลของคุณยังไม่ได้รับการยืนยัน",
        login_error_bad_password: "รหัสผ่านไม่ถูกต้อง",
        login_error_no_account: "ไม่พบบัญชีนี้",

        login_staff_not_found: "อีเมลนี้ไม่พบในรายชื่อพนักงาน",
        login_staff_invite_pending: "บัญชีพนักงานยังไม่ได้เปิดใช้งาน",
        login_staff_inactive: "บัญชีพนักงานถูกปิดใช้งาน",
        login_staff_bad_password: "รหัสผ่านไม่ถูกต้อง",
        login_staff_contact_owner: "กรุณาติดต่อเจ้าของร้าน",

        /* ---------- Signup ---------- */
        signup_success: "สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
        password_requirements: "รหัสผ่านต้องประกอบด้วย:",
        password_rule_uppercase: "ตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว",
        password_rule_number: "ตัวเลขอย่างน้อย 1 ตัว",
        password_rule_length: "ความยาวอย่างน้อย 8 ตัวอักษร",
        password_rule_symbol: "สัญลักษณ์ที่อนุญาต: ! @ # $ % ^ & * . _ -",
        password_confirm: "ยืนยันรหัสผ่าน",
        password_mismatch: "รหัสผ่านไม่ตรงกัน",

        /* ---------- Email verification ---------- */
        verification_title: "ยืนยันอีเมล",
        verification_success:
          "ยืนยันอีเมลเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบได้",
        resend_verification: "ส่งอีเมลยืนยันอีกครั้ง",

        /* ---------- Error Codes ---------- */
        errors: {
          1999: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
          1000: "คำขอไม่ถูกต้อง",
          1001: "อีเมลนี้ถูกใช้ไปแล้ว",
          1002: "อีเมลนี้มีผู้ใช้แล้ว",
          1003: "รหัสผ่านไม่ถูกต้อง",
          1007: "ไม่พบบัญชี",
          1200: "ยังไม่ได้ยืนยันอีเมล",
          1202: "โทเคนไม่ถูกต้อง",
          1203: "โทเคนหมดอายุ",
          1300: "บัญชีพนักงานถูกปิดใช้งาน",
          1403: "บัญชีพนักงานยังไม่ได้เปิดใช้งาน",
        },

        /* ---------- Staff Setup / Reset ---------- */
        staff_setup_title: "เปิดใช้งานบัญชีพนักงาน",
        staff_setup_intro: "สร้างรหัสผ่านเพื่อเปิดใช้งานบัญชีพนักงานของคุณ",
        staff_reset_title: "รีเซ็ตรหัสผ่านพนักงาน",
        staff_reset_intro: "กรอกรหัสผ่านใหม่เพื่อรีเซ็ตบัญชี",
        reset_link_sent: "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว",

        /* ------------------------------------------------------------------
         * ORDERS PAGE
         * ------------------------------------------------------------------ */
        orders_title: "ออเดอร์",
        orders_intro:
          "พื้นที่ทำงานร่วมของเจ้าของร้านและพนักงาน ที่นี่คุณจะเห็นออเดอร์ที่กำลังดำเนินการ สร้างออเดอร์ใหม่ และเปลี่ยนสถานะได้",
        orders_placeholder:
          "ในขั้นตอนถัดไป เราจะเพิ่มรายการออเดอร์แบบเรียลไทม์ที่นี่",

        /* ------------------------------------------------------------------
         * SHOP SETTINGS
         * ------------------------------------------------------------------ */
        shop_settings_title: "ตั้งค่าร้านค้า",
        shop_name: "ชื่อร้าน",
        shop_logo: "โลโก้ร้าน",
        shop_update: "อัปเดตร้าน",
        shop_update_success: "อัปเดตข้อมูลร้านเรียบร้อยแล้ว",
        shop_name_label: "ชื่อร้าน",
        order_numbering_mode: "รูปแบบหมายเลขออเดอร์",
        numbering_sequential: "ลำดับต่อเนื่อง (รีเซ็ตทุกวัน)",
        numbering_random: "สุ่ม",
        customer_sound: "เสียงแจ้งเตือนลูกค้า",
        save_changes: "บันทึกการเปลี่ยนแปลง",
        delete_shop: "ลบร้าน",
        delete_shop_confirm:
          "คุณแน่ใจหรือไม่ว่าต้องการลบร้าน? การกระทำนี้ไม่สามารถย้อนกลับได้",

        /* Staff management */
        invite_staff: "เชิญพนักงาน",
        staff_list: "รายชื่อพนักงาน",
        staff_name_label: "ชื่อพนักงาน",
        staff_email: "อีเมลพนักงาน",
        send_invite: "ส่งคำเชิญ",
        resend_invite: "ส่งคำเชิญอีกครั้ง",
        invite_sent: "ส่งคำเชิญเรียบร้อยแล้ว",
        invite_resent: "ส่งคำเชิญอีกครั้งเรียบร้อยแล้ว",
        staff_deactivated: "ปิดการใช้งานพนักงานเรียบร้อยแล้ว",
        confirm_deactivate: "คุณแน่ใจหรือไม่ว่าต้องการปิดการใช้งานพนักงานนี้?",
        no_staff: "ยังไม่มีพนักงาน",

        /* ------------------------------------------------------------------
         * ACCOUNT SETTINGS
         * ------------------------------------------------------------------ */
        account_settings_title: "ตั้งค่าบัญชี",
        account_role: "บทบาท",
        role_owner: "เจ้าของร้าน",
        role_staff: "พนักงาน",
        account_settings_intro:
          "ตั้งค่าบัญชีส่วนตัวของคุณได้ที่นี่ ฟีเจอร์เพิ่มเติม เช่น เปลี่ยนรหัสผ่าน จะถูกเพิ่มในภายหลัง",
        change_password: "เปลี่ยนรหัสผ่าน",
        password_change_coming: "เปลี่ยนรหัสผ่าน (เร็วๆ นี้)",
      },
    },
  },
});

export default i18n;
