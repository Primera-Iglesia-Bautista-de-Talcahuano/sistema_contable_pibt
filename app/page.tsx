import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function Home() {
  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_right,_var(--color-primary-fixed),_#f7f9fb_40%)] flex items-center justify-center p-6">
      <Card className="mx-auto max-w-4xl p-16 shadow-[0px_40px_80px_-20px_rgba(0,104,95,0.12)] border-none bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
             <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Sistema Contable Iglesia</p>
             <h1 className="text-5xl font-bold tracking-tight text-on-surface leading-tight">
               Gracia & Precisión <br />
               en la <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">Gestión Ministerial</span>
             </h1>
          </div>

          <p className="max-w-2xl text-lg font-medium text-on-surface-variant leading-relaxed">
            Una plataforma diseñada para trascender la frialdad de la contabilidad tradicional, brindando claridad y transparencia a la administración de su congregación.
          </p>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6">
            <Button
              variant="primary"
              className="h-14 px-10 text-lg shadow-xl shadow-primary/20"
              render={<Link href="/login" />}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              className="h-14 px-10 text-lg border-none bg-surface-container-low hover:bg-surface-container-high transition-colors"
              render={<Link href="/dashboard" />}
            >
              Panel de Control
            </Button>
          </div>

          <div className="pt-16 grid grid-cols-3 gap-12 border-t border-outline-variant/20 w-full opacity-60">
             <div className="space-y-1">
                <p className="text-2xl font-bold text-on-surface">V1.0</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sistema Activo</p>
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-bold text-on-surface">V2.0</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Diseño Moderno</p>
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-bold text-on-surface">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Privacidad</p>
             </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
