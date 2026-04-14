import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked } from "lucide-react";

export default async function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center p-6 bg-surface">
      <Card className="w-full max-w-md bg-surface-container-low shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 text-primary">
            <BookMarked className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-on-surface">Sistema Contable Iglesia</CardTitle>
          <CardDescription className="text-on-surface-variant font-medium text-base mt-2">Gestión Ministerial de Finanzas</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center pt-6 pb-8">
          <blockquote className="text-center max-w-sm">
            <p className="text-xs italic leading-relaxed text-on-surface-variant/70">
              &ldquo;Evitamos que alguien nos censure en cuanto a esta ofrenda generosa...
              procurando hacer lo que es honesto, no sólo delante del Señor,
              sino también delante de los hombres.&rdquo;
            </p>
            <cite className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 not-italic">
              2 Corintios 8:20-21
            </cite>
          </blockquote>
        </CardFooter>
      </Card>
    </main>
  );
}
