import React from "react";
import { Toaster as HotToaster } from "react-hot-toast";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";
import { gsap } from "gsap";

/**
 * Unified Toaster wrapper that uses react-hot-toast.
 * Project decided to keep react-hot-toast as the single toast implementation.
 *
 * This file replaces any previous Radix / custom Toaster component to avoid
 * confusion and API mismatch with useToast hook.
 */

type ToasterProps = React.ComponentProps<typeof HotToaster>;

export function Toaster(props: ToasterProps) {
  React.useEffect(() => {
    const container = document.querySelector("#__react-hot-toast") as
      | HTMLElement
      | null;

    if (!container) return;

    const smoothWrapper = document.querySelector("#smooth-wrapper");
    const targetParent = smoothWrapper ?? document.body;

    if (container.parentElement !== targetParent) {
      targetParent.appendChild(container);
    }

    const syncPosition = () => {
      const smoother = ScrollSmoother.get();
      const topOffset = smoother ? smoother.scrollTop() + 16 : window.scrollY + 16;
      const rightOffset = 16;

      container.style.position = "absolute";
      container.style.top = `${topOffset}px`;
      container.style.right = `${rightOffset}px`;
      container.style.transform = "none";
      container.style.zIndex = "9999";
    };

    syncPosition();

    const tickerFn = () => syncPosition();
    gsap.ticker.add(tickerFn);

    return () => {
      gsap.ticker.remove(tickerFn);
    };
  }, []);

  return (
    <HotToaster
      position="top-right"
      gutter={8}
      containerStyle={{
        pointerEvents: "none",
      }}
      toastOptions={{
        duration: 3000,
        style: {
          pointerEvents: "auto",
          position: "relative",
          transform: "none",
          fontFamily: "Ubuntu, sans-serif",
          fontSize: "14px",
          lineHeight: "1.4",
        },
        className: "toast-animation",
      }}
      {...props}
    />
  );
}

export default Toaster;
