"use client";

import { useNotification } from "@/app/providers";
import InlineNotification from "./InlineNotification/InlineNotification";
import ToastNotification from "./ToastNotification/ToastNotification";

export default function Notifications() {
  const { notifications, removeNotification } = useNotification();

  if (!notifications || notifications.length === 0) return null;

  const n = notifications[0];

  const handleClose = () => {
    removeNotification(0);
  };

  const commonProps = {
    kind: n.kind,
    title: n.title,
    subtitle: n.subtitle,
    caption: n.caption,
    type: n.type,
    onClose: handleClose,
    "data-testid": "notification",
  };

  return n.type === "toast" ? (
    <div className="fixed top-4 right-4 z-9001 pointer-events-auto">
      <ToastNotification
        {...commonProps}
        timeout={5000}
        lowContrast
        role="alert"
      />
    </div>
  ) : (
    <InlineNotification {...commonProps} lowContrast role="alert" />
  );
}
