export const TOAST_ADAPTER_NOTE = "react-hot-toast adapter";

import * as React from "react";
import { toast as hotToast } from "react-hot-toast";

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

  if (title) {
    children.push(
      React.createElement(
        "div",
        { key: "title", className: "text-sm font-semibold" },
        title
      )
    );
  }

  if (description) {
    children.push(
      React.createElement(
        "div",
        { key: "description", className: "text-sm opacity-90 mt-1" },
        description
      )
    );
  }

  const variantClasses: Record<Variant, string> = {
    default: "border-2 bg-background text-foreground",
    destructive:
      "destructive group border-2 border-destructive bg-destructive text-destructive-foreground",
    success: "group border-2 border-[#B5CC89] bg-[#B5CC89]/15 text-foreground",
    info: "group border-2 border-blue-300 bg-blue-50 text-blue-900",
    warning: "group border-2 border-amber-300 bg-amber-50 text-amber-900",
  };

  const baseClass =
    "max-w-md w-full rounded-md border p-4 shadow flex items-start justify-between gap-4";

  const containerClass = `${baseClass} ${
    variant ? variantClasses[variant] : variantClasses.default
  }`;

  const content = React.createElement(
    "div",
    { key: "content", className: "flex-1" },
    children
  );

  const actionNode = action
    ? React.createElement(
        "div",
        { key: "action", className: "ml-4 flex items-center" },
        action
      )
    : null;

  return React.createElement(
    "div",
    {
      className: containerClass,
    },
    [content, actionNode]
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
    // Simple update: remove the old toast and show a new one with updated content.
    hotToast.dismiss(id);
    const newId = hotToast.custom(
      () =>
        renderContent(
          next.title ?? opts.title,
          next.description ?? opts.description,
          next.variant ?? opts.variant,
          next.action ?? opts.action
        ),
      { duration: next.duration ?? opts.duration ?? DEFAULT_DURATION }
    );

    return {
      id: newId,
      dismiss: () => hotToast.dismiss(String(newId)),
      update: () => {
        // noop for simplicity
        return {
          id: newId,
          dismiss: () => hotToast.dismiss(String(newId)),
          update: () => ({} as unknown as ToastHandle),
        } as ToastHandle;
      },
    } as ToastHandle;
  };

  return { id, dismiss, update };
}

/**
 * Hook used across the codebase. Keeps the same surface as before:
 * const { toast, dismiss } = useToast()
 */
export function useToast() {
  return {
    toast: (opts: ToastOptions) => toast(opts),
    dismiss: (toastId?: string | number) =>
      toastId ? hotToast.dismiss(String(toastId)) : hotToast.dismiss(),
  };
}
