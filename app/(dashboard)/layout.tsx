import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentSession } from "@/lib/auth/session";
import { LayoutDashboard, Briefcase, Book, FileText, Users, Settings } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/login");
  }

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/movimientos", label: "Movimientos", icon: <Briefcase className="h-5 w-5" /> },
    { href: "/talonario", label: "Talonario", icon: <Book className="h-5 w-5" /> },
    { href: "/rendicion-boletas", label: "Rendición Boletas", icon: <FileText className="h-5 w-5" /> },
    { href: "/usuarios", label: "Usuarios", icon: <Users className="h-5 w-5" /> },
    { href: "/configuracion", label: "Configuracion", icon: <Settings className="h-5 w-5" /> },
  ];

  const allowedLinks =
    session.user.role === "ADMIN"
      ? links
      : links.filter((link) => link.href !== "/usuarios" && link.href !== "/configuracion");

  return (
    <div className="min-h-[100dvh] bg-surface">
      <div className="grid min-h-[100dvh] grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="bg-surface-bright/80 backdrop-blur-[12px] p-6 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.05)] border-none">
          <h2 className="mb-8 font-semibold tracking-wide text-lg text-primary">The Reverent Ledger</h2>
          <nav className="space-y-2">
            {allowedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-on-surface-variant transition-all duration-200 hover:bg-surface-container-lowest hover:text-primary hover:shadow-sm"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex flex-col bg-surface">
          <header className="sticky top-0 z-10 bg-surface-bright/80 backdrop-blur-[12px] px-8 py-5 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.02)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted uppercase">MVP local - ETAPA 2</p>
                <p className="text-sm font-medium text-on-surface">
                  {session.user.name} ({session.user.role})
                </p>
              </div>
              <LogoutButton />
            </div>
          </header>
          <main className="p-8 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
