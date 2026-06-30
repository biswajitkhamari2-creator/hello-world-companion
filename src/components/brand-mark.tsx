import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const SUFFIX = "by Sidheswar Enterprises";

/**
 * Animated brand lockup:
 *   UPSC Mitra  ·  by Sidheswar Enterprises (typed + erased loop)
 */
export function BrandMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "erasing" | "wait">("typing");

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < SUFFIX.length) {
        t = setTimeout(() => setText(SUFFIX.slice(0, text.length + 1)), 70);
      } else {
        t = setTimeout(() => setPhase("hold"), 1600);
      }
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("erasing"), 200);
    } else if (phase === "erasing") {
      if (text.length > 0) {
        t = setTimeout(() => setText(SUFFIX.slice(0, text.length - 1)), 35);
      } else {
        t = setTimeout(() => setPhase("wait"), 500);
      }
    } else {
      t = setTimeout(() => setPhase("typing"), 300);
    }
    return () => clearTimeout(t);
  }, [text, phase]);

  const iconBox =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize =
    size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const title =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
      ? "text-base"
      : "text-base sm:text-lg";
  const suffix =
    size === "lg"
      ? "text-sm sm:text-base"
      : size === "sm"
      ? "text-[10px]"
      : "text-[11px] sm:text-xs";

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
            "truncate font-serif font-semibold tracking-tight",
            title
          )}
        >
          UPSC <span className="text-accent">Genius AI</span>
        </span>
        <span
          className={cn(
            "truncate font-mono italic tracking-wide text-muted-foreground",
            suffix
          )}
          aria-label="by Sidheswar Enterprises"
        >
          <span
            className="bg-clip-text font-semibold not-italic text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #e11d48 0%, #f59e0b 50%, #10b981 100%)",
            }}
          >
            {text}
          </span>
          <span
            className="ml-0.5 inline-block w-[1px] animate-pulse bg-accent align-middle"
            style={{ height: "0.9em" }}
            aria-hidden="true"
          />
        </span>
      </span>
    </span>
  );
}
