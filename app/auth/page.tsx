import { AuthForm } from "@/components/AuthForm";
import { getServerSession } from "@/lib/articlesService";

export default async function AuthPage() {
  await getServerSession();
  const hasEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Supabase Auth</p>
        <h1 className="text-3xl font-semibold text-slate-900">Connexion par lien magique</h1>
        <p className="text-base text-slate-600">
          Configure ton projet Supabase pour activer l’authentification email. Cette page consomme
          le client Supabase côté navigateur.
        </p>
      </div>
      {hasEnv ? (
        <AuthForm />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500">
          Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY pour activer cette page.
        </div>
      )}
    </div>
  );
}
