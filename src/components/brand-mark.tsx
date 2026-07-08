import { useEffect, useRef, useState } from "react";
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
  const stateRef = useRef({ i: 0, dir: 1 as 1 | -1, pause: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current;
      if (s.pause > 0) {
        s.pause -= 1;
        return;
      }
      s.i += s.dir;
      if (s.i >= SUFFIX.length) {
        s.i = SUFFIX.length;
        s.dir = -1;
        s.pause = 22; // ~1.8s hold at full
      } else if (s.i <= 0) {
        s.i = 0;
        s.dir = 1;
        s.pause = 6; // ~0.5s hold empty
      }
      setText(SUFFIX.slice(0, s.i));
    }, 80);
    return () => clearInterval(id);
  }, []);

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
          <span className="brand-flip inline-block">UPSC</span>{" "}
          <span className="text-accent">Genius AI</span>
        </span>
        <span
          className={cn(
            "font-mono italic tracking-wide text-muted-foreground whitespace-nowrap",
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
