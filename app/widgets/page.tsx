import { WidgetBuilderClient } from "@/components/WidgetBuilderClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function WidgetBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Widget builder</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Génère ton embed Olympic News Hub
        </h1>
        <p className="text-base text-slate-600">
          Compose un widget filtré (sport, langue, topics, tri) puis récupère l’iframe à intégrer
          dans n’importe quel CMS. L’aperçu ci-dessous utilise les mêmes données que la page
          principale.
        </p>
      </div>
      <WidgetBuilderClient siteUrl={siteUrl} />
    </div>
  );
}
