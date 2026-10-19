"use client";

import { useState } from "react";
import { PageHeader } from "@/components/Bits";
import { useT } from "@/lib/i18n";

export default function About() {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHeader eyebrow={t("about.eyebrow")} title={t("about.title")} sub={t("about.sub")} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <section className="min-w-0 space-y-4 text-ink/80">
          <h2 className="text-2xl font-black text-ink">{t("about.mission")}</h2>
          <p>{t("about.missionT")}</p>
          <h2 className="text-2xl font-black text-ink">{t("about.vision")}</h2>
          <p>{t("about.visionT")}</p>
          <div className="card p-5 text-sm">
            <p>{t("about.city")}</p>
            <p>📞 +374 10 000 000</p>
            <p>✉️ hello@imdayak.am</p>
            <p>Instagram · Facebook · Telegram</p>
          </div>
        </section>
        <form className="card min-w-0 space-y-4 p-7" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <h2 className="text-2xl font-black">{t("about.contact")}</h2>
          {sent ? (
            <p className="rounded-xl bg-ok/10 p-4 font-bold text-ok">{t("about.thanks")}</p>
          ) : (
            <>
              <label className="block"><span className="label">{t("about.name")}</span><input className="input" required /></label>
              <label className="block"><span className="label">{t("login.contact")}</span><input className="input" required /></label>
              <label className="block"><span className="label">{t("about.message")}</span><textarea className="input min-h-32" required /></label>
              <button className="btn-primary w-full">{t("common.send")}</button>
            </>
          )}
        </form>
      </div>
    </>
  );
}
