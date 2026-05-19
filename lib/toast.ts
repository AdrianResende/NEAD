"use client";

import { showToast } from "nextjs-toast-notify";

const BASE_TOAST_OPTIONS = {
  position: "top-right" as const,
  progress: true,
};

export function notifySuccess(message: string) {
  showToast.success(message, {
    ...BASE_TOAST_OPTIONS,
    duration: 3000,
  });
}

export function notifyError(message: string) {
  showToast.error(message, {
    ...BASE_TOAST_OPTIONS,
    duration: 4500,
  });
}

export function notifyInfo(message: string) {
  showToast.info(message, {
    ...BASE_TOAST_OPTIONS,
    duration: 3000,
  });
}
