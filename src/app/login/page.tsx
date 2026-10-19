import { Suspense } from "react";
import { titleFor } from "@/i18n/server";
import LoginClient from "./LoginClient";

export const generateMetadata = titleFor("nav.login");

export default function Page() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
