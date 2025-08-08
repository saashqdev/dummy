"use client";

import Page401 from "@/components/pages/Page401";
import Page404 from "@/components/pages/Page404";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {
    status?: number;
    message?: string;
    digest?: string;
  };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("[error]", error);
  }, [error]);

  let errorTitle = error?.message || error?.message || "Error";
  let errorStack = error?.stack;

  if (error?.status === 404 || error.message === "404" || error.message === t("shared.notFound")) {
    return <Page404 title={errorTitle} withFooter={false} />;
  }
  if (error?.status === 401 || error.message === "401" || error.message === "Unauthorized") {
    return <Page401 withFooter={false} />;
  }

  if (KNOWN_ERORS.hasOwnProperty(errorTitle)) {
    let knownError = KNOWN_ERORS[errorTitle];
    errorTitle = knownError.title;
    if (knownError.description !== undefined) {
    }
    if (knownError.stack !== undefined) {
      errorStack = knownError.stack;
    }
  }
  return (
    <div className="px-4 py-4">
      <div className="mx-auto w-full space-y-2 rounded-md border-2 border-dashed border-border bg-background p-12 text-center text-foreground shadow-md">
        <div className="flex flex-col justify-center space-y-1 break-words">
          <div className="mx-auto text-red-500">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <div className="text-xl font-bold">{errorTitle}</div>
        </div>

        <button onClick={() => reset()}>{t("shared.clickHereToTryAgain")}</button>

        {errorStack && (
          <div className="pt-4">
            <div className="break-words border-t border-dashed border-border pt-3 text-left text-sm text-muted-foreground">{errorStack}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const KNOWN_ERORS: Record<string, { title: string; description?: string; stack?: string }> = {
  // "Cannot read properties of null (reading 'useContext')": {
  //   title: "Compiling... reload in a few seconds.",
  //   description: "This error is usually temporary and should be resolved by reloading the page.",
  // },
};
