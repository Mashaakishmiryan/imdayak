import { Suspense } from "react";
import { titleFor } from "@/i18n/server";
import FindClient from "./FindClient";

export const generateMetadata = titleFor("nav.find");

export default function Page() {
  return (
    <Suspense>
      <FindClient />
    </Suspense>
  );
}
