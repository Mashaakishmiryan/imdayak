import { Suspense } from "react";
import { titleFor } from "@/i18n/server";
import SignupClient from "./SignupClient";

export const generateMetadata = titleFor("nav.signup");

export default function Page() {
  return (
    <Suspense>
      <SignupClient />
    </Suspense>
  );
}
