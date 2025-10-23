export const TOAST_ADAPTER_NOTE = "react-hot-toast adapter";

import * as React from "react";
import { toast as hotToast } from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle, Info } from '@/lib/icons';
import { useAudio } from "@/contexts/SoundContext";

type Variant = "default" | "destructive" | "success" | "info" | "warning";

type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  variant?: Variant;
  action?: React.ReactNode;
};

type ToastHandle = {
  id: string | number;
  dismiss: () => void;
  update: (opts: ToastOptions) => ToastHandle;
};

const DEFAULT_DURATION = 3000;

/**
 * Render toast content using React.createElement so file can remain .ts
 */
function renderContent(
  title?: React.ReactNode,
  description?: React.ReactNode,
  variant?: Variant,
  action?: React.ReactNode
) {
  const children: Array<React.ReactNode> = [];

  // Icon mapping for each variant
  const iconMap: Record<Variant, React.ReactNode> = {
    default: null,
    success: React.createElement(CheckCircle, {
      key: "icon",
      className: "w-5 h-5 flex-shrink-0 mt-0.5",
      "aria-hidden": "true",
    }),
    destructive: React.createElement(XCircle, {
      key: "icon",
      className: "w-5 h-5 flex-shrink-0 mt-0.5",
      "aria-hidden": "true",
    }),
    warning: React.createElement(AlertTriangle, {
      key: "icon",
      className: "w-5 h-5 flex-shrink-0 mt-0.5",
      "aria-hidden": "true",
    }),
    info: React.createElement(Info, {
      key: "icon",
      className: "w-5 h-5 flex-shrink-0 mt-0.5",
      "aria-hidden": "true",
    }),
  };

  const icon = variant ? iconMap[variant] : null;

  if (title) {
    children.push(
      React.createElement(
        "div",
        {
          key: "title",
          className: "text-sm font-semibold leading-tight text-opacity-100",
        },
        title
      )
    );
  }

  if (description) {
    children.push(
      React.createElement(
        "div",
        {
          key: "description",
          className: "text-xs mt-1 leading-relaxed text-opacity-90",
        },
        description
      )
    );
  }

  const variantClasses: Record<Variant, string> = {
    default:
      "border-2 bg-background/95 backdrop-blur-sm text-foreground shadow-lg",
    destructive:
      "destructive group border-2 border-red-500 bg-red-50/95 dark:bg-red-950/95 backdrop-blur-sm text-red-900 dark:text-red-100 shadow-lg",
    success:
      "group border-2 border-[#B5CC89] bg-[#B5CC89]/20 dark:bg-[#B5CC89]/25 backdrop-blur-sm text-[#1a3009] dark:text-[#B5CC89] shadow-lg",
    info: "group border-2 border-blue-500 bg-blue-50/95 dark:bg-blue-950/95 backdrop-blur-sm text-blue-900 dark:text-blue-100 shadow-lg",
    warning:
      "group border-2 border-amber-500 bg-amber-50/95 dark:bg-amber-950/95 backdrop-blur-sm text-amber-900 dark:text-amber-100 shadow-lg",
  };

  const baseClass =
    "max-w-md w-full rounded-xl border p-4 shadow-lg flex items-start gap-3 font-['Ubuntu']";

  const containerClass = `${baseClass} ${
    variant ? variantClasses[variant] : variantClasses.default
  }`;

  const content = React.createElement(
    "div",
    { key: "content", className: "flex-1 min-w-0" },
    children
  );

  const actionNode = action
    ? React.createElement(
        "div",
        { key: "action", className: "flex items-center flex-shrink-0" },
        action
      )
    : null;

  return React.createElement(
    "div",
    {
      className: containerClass,
    },
    [icon, content, actionNode].filter(Boolean)
  );
}

/**
 * Show a toast via react-hot-toast and return a handle similar to the old API.
 */
export function toast(opts: ToastOptions): ToastHandle {
  const id = hotToast.custom(
    () =>
      renderContent(opts.title, opts.description, opts.variant, opts.action),
    {
      duration: opts.duration ?? DEFAULT_DURATION,
    }
  );

  const dismiss = () => hotToast.dismiss(String(id));

  const update = (next: ToastOptions) => {
    // Update in-place by reusing the same id so animations and ordering are preserved.
    // react-hot-toast supports passing an `id` option to replace an existing toast.
    const updatedId = hotToast.custom(
      () =>
        renderContent(
          next.title ?? opts.title,
          next.description ?? opts.description,
          next.variant ?? opts.variant,
          next.action ?? opts.action
        ),
      { id, duration: next.duration ?? opts.duration ?? DEFAULT_DURATION }
    );

    return {
      id: updatedId,
      dismiss: () => hotToast.dismiss(String(updatedId)),
      update: (nxt: ToastOptions) =>
        // Delegate to same update logic to allow chained updates
        update(nxt),
    } as ToastHandle;
  };

  return { id, dismiss, update };
}

/**
 * Hook used across the codebase. Keeps the same surface as before:
 * const { toast, dismiss } = useToast()
 */
export function useToast() {
  const { play } = useAudio();
  return {
    toast: (opts: ToastOptions) => {
      // Phát âm thanh theo biến thể thông báo
      // - success => "success"
      // - destructive (lỗi/thất bại) => "alert"
      // - default/info/warning => "notification"
      const v = opts?.variant;
      if (v === "success") {
        play("success");
      } else if (v === "destructive") {
        play("alert");
      } else if (v === "info" || v === "warning" || v === "default") {
        play("notification");
      }
      return toast(opts);
    },
    dismiss: (toastId?: string | number) =>
      toastId ? hotToast.dismiss(String(toastId)) : hotToast.dismiss(),
  };
}
