import Link from "next/link";
import { getServerT } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getServerT();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl">🧸</p>
      <h1 className="mt-4 text-3xl font-black">{t("nf.title")}</h1>
      <p className="mt-2 text-ink/70">{t("nf.sub")}</p>
      <Link href="/" className="btn-primary mt-6">{t("nf.home")}</Link>
    </div>
  );
}
