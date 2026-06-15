import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentSession } from "@/lib/current-session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.role !== "ADMIN") {
    redirect("/login?error=forbidden");
  }

  return (
    <AppShell session={session} section="admin">
      {children}
    </AppShell>
  );
}
