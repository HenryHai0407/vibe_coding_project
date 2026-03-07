import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/auth/dashboard-home";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardHome user={session.user} />;
}
