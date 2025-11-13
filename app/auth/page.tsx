import { AuthForm } from "@/components/AuthForm";
import { pricingPlans } from "@/components/LandingPage";
import { getServerSession } from "@/lib/articlesService";
import { ensureProfile, hasActivePlan } from "@/lib/profile";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function AuthPage() {
  const {
    data: { user },
  } = await getServerSession();
  const profile = user ? await ensureProfile(user) : null;
  const hasEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasEnv) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500">
        Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY pour activer cette page.
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Authentification</p>
          <h1 className="text-3xl font-semibold text-slate-900">Connexion par lien magique</h1>
          <p className="text-base text-slate-600">
            Entrez votre adresse e-mail et nous vous enverrons un lien sécurisé. Cliquez simplement
            dessus : pas de mot de passe à mémoriser.
          </p>
        </div>
        <AuthForm />
      </div>
    );
  }

  const expiryLabel = profile.plan_expires_at
    ? format(new Date(profile.plan_expires_at), "dd MMM yyyy", { locale: fr })
    : "Illimité";

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Mon espace</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Ton plan World Sports Pulse</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Plan</p>
            <p className="text-xl font-semibold capitalize text-slate-900">{profile.plan}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Expiration</p>
            <p className="text-xl font-semibold text-slate-900">{expiryLabel}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Statut</p>
            <p className="text-xl font-semibold text-slate-900">
              {hasActivePlan(profile) ? "Actif" : "Suspendu"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500 text-center">Comparer</p>
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          Choisis l’offre qui correspond à ton usage
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <span className="mb-4 inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {plan.badge}
              </span>
              <h3 className="text-2xl font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-midnight">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-midnight">•</span> {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.cta.href}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-midnight px-4 py-2 text-sm font-semibold text-midnight transition hover:bg-midnight hover:text-white"
              >
                {plan.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
