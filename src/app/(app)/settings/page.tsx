import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-600">Manage your account preferences and security basics for this MVP.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded border p-4">
          <h2 className="font-semibold">Account</h2>
          <p className="text-sm text-slate-700">Signed in as: {session.user.email}</p>
          <p className="text-xs text-slate-600">Display name is set during registration in this MVP version.</p>
        </div>

        <div className="space-y-2 rounded border p-4">
          <h2 className="font-semibold">Security</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Passwords are hashed with bcrypt before storage.</li>
            <li>Register and sign-in endpoints include basic rate limiting.</li>
            <li>Session-protected data is always user-scoped on the server.</li>
          </ul>
        </div>
      </div>

      <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        More advanced preferences (theme, notifications, exports) are planned for post-MVP phases.
      </div>
    </section>
  );
}
