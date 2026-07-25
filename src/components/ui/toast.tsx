import { Toast } from "radix-ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { create } from "zustand";

type ToastType = "default" | "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  add(item: Omit<ToastItem, "id">): void;
  remove(id: string): void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (item) =>
    set((state) => ({
      toasts: [...state.toasts, { ...item, id: crypto.randomUUID() }],
    })),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  show(
    message: string,
    options?: { description?: string; type?: ToastType; duration?: number },
  ) {
    useToastStore.getState().add({
      message,
      description: options?.description,
      type: options?.type ?? "default",
      duration: options?.duration ?? 4000,
    });
  },
  success(
    message: string,
    options?: { description?: string; duration?: number },
  ) {
    toast.show(message, { ...options, type: "success" });
  },
  error(
    message: string,
    options?: { description?: string; duration?: number },
  ) {
    toast.show(message, { ...options, type: "error" });
  },
};

const typeStyles: Record<ToastType, string> = {
  default: "border-stone-600 bg-stone-800",
  success: "border-emerald-700 bg-emerald-900/80",
  error: "border-rose-700 bg-rose-900/80",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);

  return (
    <Toast.Provider swipeDirection="right">
      {children}

      {toasts.map((item) => (
        <Toast.Root
          key={item.id}
          duration={item.duration}
          onOpenChange={(open) => {
            if (!open) remove(item.id);
          }}
          className={clsx(
            "flex items-start justify-between gap-3 rounded-lg border p-3 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-2",
            typeStyles[item.type],
          )}
        >
          <div className="flex flex-col gap-0.5">
            <Toast.Title className="text-sm font-medium text-white">
              {item.message}
            </Toast.Title>
            {item.description && (
              <Toast.Description className="text-xs text-stone-300">
                {item.description}
              </Toast.Description>
            )}
          </div>

          <Toast.Close
            className="shrink-0 cursor-pointer rounded p-0.5 text-stone-400 hover:text-white"
            aria-label="Dismiss"
          >
            <XMarkIcon className="size-4" />
          </Toast.Close>
        </Toast.Root>
      ))}

      <Toast.Viewport className="fixed right-4 bottom-4 z-9999 flex w-80 flex-col gap-2 outline-none" />
    </Toast.Provider>
  );
}
