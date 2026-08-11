import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const navigate = useNavigate();
  const login = useLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await login.mutateAsync({ username, password, twoFactorCode: requires2FA ? twoFactorCode : undefined });
      if (result.requiresTwoFactor) setRequires2FA(true);
      else navigate("/dashboard");
    } catch { /* handled by mutation state */ }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-char-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-card border border-char-800 bg-char-900 p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-flame-400 to-flame-600 font-display text-2xl text-char-950">B</div>
          <h1 className="font-display text-2xl tracking-wide">BONDOK</h1>
          <p className="mt-1 text-sm text-sesame-100/40">نظام إدارة المطاعم المتكامل</p>
        </div>
        {!requires2FA ? (
          <>
            <div><label className="block text-sm text-sesame-100/60 mb-1">اسم المستخدم</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-lg bg-char-950 border border-char-700 px-4 py-3 text-sesame-50 outline-none focus:border-flame-400" /></div>
            <div><label className="block text-sm text-sesame-100/60 mb-1">كلمة المرور</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg bg-char-950 border border-char-700 px-4 py-3 text-sesame-50 outline-none focus:border-flame-400" /></div>
          </>
        ) : (
          <div><label className="block text-sm text-sesame-100/60 mb-1">رمز التحقق</label><input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} required maxLength={6} placeholder="000000" className="w-full rounded-lg bg-char-950 border border-char-700 px-4 py-3 text-sesame-50 text-center text-2xl tracking-widest outline-none focus:border-flame-400" /></div>
        )}
        <button type="submit" disabled={login.isPending} className="w-full rounded-lg bg-gradient-to-l from-flame-400 to-flame-600 py-3 font-semibold text-char-950 hover:brightness-110 transition disabled:opacity-50">
          {login.isPending ? "جاري الدخول..." : requires2FA ? "تحقق" : "دخول"}
        </button>
        {login.isError && <p className="text-center text-sm text-chili-500">{(login.error as any)?.message ?? "خطأ في تسجيل الدخول"}</p>}
      </form>
    </div>
  );
}