import { create } from "zustand";

type ToastType = "default" | "success" | "error";

export interface ToastItem {
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

export const useToastStore = create<ToastStore>((set) => ({
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
  success(message: string, options?: { description?: string; duration?: number }) {
    toast.show(message, { ...options, type: "success" });
  },
  error(message: string, options?: { description?: string; duration?: number }) {
    toast.show(message, { ...options, type: "error" });
  },
};
