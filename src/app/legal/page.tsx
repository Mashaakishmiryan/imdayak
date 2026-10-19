import { PageHeader } from "@/components/Bits";
import type { MessageKey } from "@/i18n/en";
import { getServerT, titleFor } from "@/i18n/server";

export const generateMetadata = titleFor("legal.eyebrow");

const DOCS: [string, MessageKey, MessageKey][] = [
  ["terms", "footer.terms", "legal.terms.d"],
  ["privacy", "footer.privacy", "legal.privacy.d"],
  ["cookies", "footer.cookies", "legal.cookies.d"],
  ["nanny-agreement", "footer.agreement", "legal.agreement.d"],
  ["refunds", "legal.refunds.t", "legal.refunds.d"],
];

export default async function Legal() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader eyebrow={t("legal.eyebrow")} title={t("legal.title")} sub={t("legal.sub")} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        {DOCS.map(([id, title, body]) => (
          <section key={id} id={id} className="card scroll-mt-24 p-6">
            <h2 className="text-xl font-black">{t(title)}</h2>
            <p className="mt-2 text-ink/75">{t(body)}</p>
          </section>
        ))}
      </div>
    </>
  );
}
