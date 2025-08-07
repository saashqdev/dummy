"use client";

import EmptyResultsIcon from "@/components/ui/icons/EmptyResultsIcon";
import clsx from "clsx";

interface Props {
  description: string;
  className?: string;
}

export default function EmptyState({ description, className }: Props) {
  return (
    <div className={clsx(className, "px-1.6 rounded-md border-2 border-dashed border-border py-16 text-center")}>
      <EmptyResultsIcon className="mx-auto w-10" />
      <h3 className="mt-2 text-sm font-medium">{description}</h3>
    </div>
  );
}
