"use client";

import { useNotification } from "@/app/providers";
import InlineNotification from "./InlineNotification/InlineNotification";
import ToastNotification from "./ToastNotification/ToastNotification";

export default function Notifications() {
  const { notifications, removeNotification } = useNotification();

  if (!notifications || notifications.length === 0) return null;

  // Display up to 3 notifications
  const displayedNotifications = notifications.slice(0, 3);

  const toastNotifications = displayedNotifications.filter(
    (n) => n.type === "toast",
  );
  const inlineNotifications = displayedNotifications.filter(
    (n) => n.type !== "toast",
  );

  return (
    <>
      {/* Toast notifications stacked in top-right */}
      {toastNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-9001 pointer-events-auto space-y-2">
          {toastNotifications.map((n) => {
            const actualIndex = notifications.indexOf(n);
            return (
              <ToastNotification
                key={actualIndex}
                kind={n.kind}
                title={n.title}
                subtitle={n.subtitle}
                caption={n.caption}
                onClose={() => removeNotification(actualIndex)}
                timeout={5000}
                lowContrast
                role="alert"
                data-testid={`notification-${actualIndex}`}
              />
            );
          })}
        </div>
      )}

      {/* Inline notifications stacked */}
      {inlineNotifications.map((n) => {
        const actualIndex = notifications.indexOf(n);
        return (
          <div key={actualIndex} className="mb-2">
            <InlineNotification
              kind={n.kind}
              title={n.title}
              subtitle={n.subtitle}
              onClose={() => removeNotification(actualIndex)}
              lowContrast
              role="alert"
              data-testid={`notification-${actualIndex}`}
            />
          </div>
        );
      })}
    </>
  );
}
