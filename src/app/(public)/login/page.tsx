import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={<section className="mx-auto w-full max-w-xl rounded-xl border bg-white p-6 shadow-sm text-sm text-slate-600">Loading sign in form...</section>}
    >
      <LoginForm />
    </Suspense>
  );
}
