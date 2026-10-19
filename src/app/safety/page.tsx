import Link from "next/link";
import { PageHeader } from "@/components/Bits";
import type { MessageKey } from "@/i18n/en";
import { getServerT, titleFor } from "@/i18n/server";

export const generateMetadata = titleFor("footer.safety");

const ICONS = ["🪪", "🔒", "⭐", "📍", "⏱️", "🆘", "🩺", "🚩"];

export default async function Safety() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader eyebrow={t("footer.safety")} title={t("safe.title")} sub={t("safe.sub")} />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2">
        {ICONS.map((e, i) => (
          <div key={e} className="card flex gap-4 p-6">
            <span className="shrink-0 text-4xl">{e}</span>
            <div className="min-w-0">
              <h2 className="text-lg font-black">{t(`safe.${i + 1}t` as MessageKey)}</h2>
              <p className="mt-1 text-ink/75">{t(`safe.${i + 1}d` as MessageKey)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-[16px] bg-blush p-6">
          <h2 className="text-xl font-black">{t("safe.notTitle")}</h2>
          <p className="mt-1 text-ink/75">{t("safe.notText")}</p>
        </div>
        <p className="mt-6 text-sm text-ink/70">
          {t("safe.privacy")} <Link href="/legal#privacy" className="font-bold text-brand-dark underline">{t("footer.privacy")}</Link>
        </p>
        <div className="mt-8 text-center"><Link href="/signup" className="btn-primary">{t("safe.cta")}</Link></div>
      </div>
    </>
  );
}
