import { gsap } from "gsap";

/**
 * Unified scroll utilities to avoid jitter on mobile (especially iOS Safari)
 * and to standardize behavior when GSAP ScrollSmoother is enabled.
 */

type SmootherInstance = {
  scrollTop: () => number;
  scrollTo: (target: number | Element, clamp?: boolean, align?: string) => void;
};

type ScrollAlign = "top" | "center";

/**
 * Kill any active tween on the window to prevent competing scroll animations.
 * Call this before starting a new programmatic scroll.
 */
export function killActiveScroll(): void {
  try {
    gsap.killTweensOf(window);
  } catch {
    // no-op
  }
}

/**
 * Read sticky navbar height. Prefers CSS var set by Navbar, falls back to measured nav element or default 64px.
 */
export function getHeaderHeight(): number {
  try {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue(
      "--navbar-height"
    );
    const parsed = parseInt(cssVar || "", 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  } catch {
    // ignore
  }

  const nav = document.querySelector("nav") as HTMLElement | null;
  const measured = nav?.clientHeight ?? 64;
  return measured;
}

/**
 * Try to get the ScrollSmoother instance via dynamic import.
 * Returns null if not available or not initialized.
 */
export async function getSmoother(): Promise<SmootherInstance | null> {
  try {
    const mod = await import("gsap/ScrollSmoother");
    const ScrollSmoother = (mod as any).ScrollSmoother ?? (mod as any).default;
    if (!ScrollSmoother || typeof ScrollSmoother.get !== "function") {
      return null;
    }
    const inst = ScrollSmoother.get();
    return inst ?? null;
  } catch {
    return null;
  }
}

/**
 * Compute absolute target Y with offset and alignment relative to viewport.
 */
function computeTargetY(
  target: number | Element,
  align: ScrollAlign,
  offset: number
): number {
  if (typeof target === "number") {
    return Math.max(0, target - offset);
  }

  const rect = target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const elementTop = rect.top + scrollTop;

  if (align === "center") {
    const y =
      elementTop -
      window.innerHeight / 2 +
      (target as HTMLElement).offsetHeight / 2;
    return Math.max(0, y - offset);
  }

  // align === "top"
  return Math.max(0, elementTop - offset);
}

/**
 * Unified programmatic scroll:
 * - Prioritize ScrollSmoother.scrollTo if available
 * - Fallback to native window.scrollTo with smooth behavior
 *
 * target: Element | string (id) | number (absolute Y)
 * options:
 *  - offset: number (default headerHeight + 8)
 *  - align: "top" | "center" (default "top")
 *  - clamp: boolean | string for smoother align string (default "top")
 */
export function scrollToTarget(
  target: HTMLElement | string | number,
  options?: { offset?: number; align?: ScrollAlign; clampAlign?: string }
): void {
  const headerHeight = getHeaderHeight();
  const baseOffset = options?.offset ?? headerHeight + 8;
  const align = options?.align ?? "top";
  const clampAlign =
    options?.clampAlign ?? (align === "top" ? "top 0px" : "top 80px");

  let element: HTMLElement | null = null;
  if (typeof target === "string") {
    element = document.getElementById(target);
    if (!element) return;
  }

  const absY = computeTargetY(element ?? (target as number), align, baseOffset);

  // Attempt smoother first; if not available, fallback to native.
  (async () => {
    try {
      const smoother = await getSmoother();
      if (smoother) {
        // Use element if provided for better alignment; otherwise absolute Y
        if (element) {
          smoother.scrollTo(element, true, clampAlign);
        } else {
          smoother.scrollTo(absY, true);
        }
        return;
      }
    } catch {
      // ignore and fallback
    }

    // Native smooth scroll fallback
    try {
      window.scrollTo({
        top: absY,
        behavior: "smooth",
      });
    } catch {
      // As a last resort, jump scroll
      window.scrollTo(0, absY);
    }
  })();
}

/**
 * Helper: Scroll the element into view using native scroll, then compensate sticky navbar.
 * Only used when explicit behavior is needed without ScrollSmoother.
 */
export function scrollIntoViewWithOffset(
  el: HTMLElement,
  offset?: number
): void {
  const headerHeight = getHeaderHeight();
  const baseOffset = offset ?? headerHeight + 8;

  try {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Compensate sticky navbar after native scrollIntoView
    window.scrollBy({ top: -baseOffset, behavior: "smooth" });
  } catch {
    // Fallback to absolute computation
    const y = computeTargetY(el, "top", baseOffset);
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}
