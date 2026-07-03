"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function FieldHelper({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground mt-1">{children}</p>;
}

export function FieldTooltip({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger type="button" className="inline-flex ml-1 text-muted-foreground hover:text-foreground transition-colors">
        <Info className="w-3 h-3" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
