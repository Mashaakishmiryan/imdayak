import { Suspense } from "react";
import { titleFor } from "@/i18n/server";
import MatchesClient from "./MatchesClient";

export const generateMetadata = titleFor("tab.matches");

export default function Page() {
  return (
    <Suspense>
      <MatchesClient />
    </Suspense>
  );
}
