import Link from "next/link";
import { ArrowRight, LineChart, Shield, Users } from "lucide-react";

const highlights = [
  {
    title: "Alertes multi-fédérations",
    description: "Suivez les communiqués IF, NOC et OCOG triés par langue, sport et poids officiel.",
    icon: LineChart,
  },
  {
    title: "Confiance olympique",
    description: "Flux modéré et contextualisé : topics gouvernance, intégrité, nomination, calendrier.",
    icon: Shield,
  },
  {
    title: "Collaboration prête",
    description: "Widgets embarqués, filtres dynamiques, exports pour ton équipe communication.",
    icon: Users,
  },
];

const plans = [
  {
    name: "Essai 30 jours",
    price: "0€",
    description: "Accès complet pendant 30 jours, sans carte bancaire.",
    features: ["Widgets illimités", "Alertes e-mail", "Accès équipe"],
    cta: { label: "Créer mon compte", href: "/auth" },
    badge: "GRATUIT",
  },
  {
    name: "Plan Personnel",
    price: "29€ / mois",
    description: "Idéal pour les chefs de projet comms ou analystes fédéraux.",
    features: ["Export CSV/Slides", "Support prioritaire", "Roadmap partagée"],
    cta: { label: "Parler avec nous", href: "mailto:hello@olympicnewshub.com?subject=Plan%20Personnel" },
    badge: "POPULAIRE",
  },
  {
    name: "Offre Entreprise",
    price: "Sur devis",
    description: "Workflow sur mesure (n8n, CRM, intranet). Gouvernance multi-clients.",
    features: ["SLA dédié", "Onboarding équipe", "Widgets illimités"],
    cta: { label: "Contacter le studio", href: "mailto:hello@olympicnewshub.com?subject=Offre%20Entreprise" },
    badge: "SUR MESURE",
  },
];

export function LandingPage() {
  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden rounded-3xl bg-midnight px-8 py-12 text-white">
        <div className="max-w-4xl space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-300">World Sports Pulse</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Centralise les actus officielles des organisations olympiques.
          </h1>
          <p className="text-lg text-slate-200">
            Un tableau de bord unique pour surveiller les communiqués, nominations, rapports et calendriers
            d’une dizaine de fédérations internationales, NOC et comités d’organisation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-midnight transition hover:bg-slate-100"
            >
              Essayer maintenant
            </Link>
            <a
              href="mailto:hello@olympicnewshub.com"
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Parler avec un expert <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 hidden w-1/3 rounded-3xl bg-gradient-to-b from-white/10 to-transparent lg:block" />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="space-y-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <item.icon className="h-10 w-10 text-midnight" />
            <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>

      <section id="plans" className="space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Plans</p>
          <h2 className="text-3xl font-semibold text-slate-900">Choisis le rythme qui te convient</h2>
          <p className="text-base text-slate-600">
            Tous les plans incluent le monitoring multi-fédérations, les widgets embarqués et l’assistance onboarding.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
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
      </section>
    </div>
  );
}
