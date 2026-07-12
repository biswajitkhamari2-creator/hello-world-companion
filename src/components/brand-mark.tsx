import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const SUFFIX = "by Sidheswar Enterprises";

/**
 * Professional brand lockup:
 *   UPSC Genius AI  ·  by Sidheswar Enterprises
 */
export function BrandMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const iconBox =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize =
    size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const title =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
      ? "text-base"
      : "text-sm sm:text-lg";
  const suffix =
    size === "lg"
      ? "text-sm sm:text-base"
      : size === "sm"
      ? "text-[10px]"
      : "text-[10px] sm:text-xs";

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm",
          iconBox
        )}
      >
        <BookOpen className={iconSize} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "font-serif font-semibold tracking-tight whitespace-nowrap",
            title
          )}
        >
          <span className="animate-upsc-flip">UPSC</span>{" "}
          <span className="text-accent">Genius AI</span>
        </span>
        <span
          className={cn(
            "font-mono italic tracking-wide text-muted-foreground whitespace-nowrap",
            suffix
          )}
          aria-label="by Sidheswar Enterprises"
        >
          <span className="font-semibold not-italic text-muted-foreground">{SUFFIX}</span>
        </span>
      </span>
    </span>
  );
}
