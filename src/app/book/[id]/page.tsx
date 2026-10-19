import { Suspense } from "react";
import { titleFor } from "@/i18n/server";
import BookClient from "./BookClient";

export const generateMetadata = titleFor("common.book");

export default function Page() {
  return (
    <Suspense>
      <BookClient />
    </Suspense>
  );
}
