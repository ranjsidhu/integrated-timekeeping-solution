import { fireEvent, render, screen } from "@testing-library/react";

import { NotificationProvider, useNotification } from "../NotificationProvider";

function Consumer() {
  const { notifications, addNotification, removeNotification } =
    useNotification();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          addNotification({
            kind: "success",
            title: "Saved",
            subtitle: "Your changes were saved",
            type: "inline",
          })
        }
      >
        Add
      </button>
      <div data-testid="count">{String(notifications.length)}</div>
      {notifications.map((n, i) => (
        <div key={`${n.title}-${n.timeout}-${i}`} data-testid={`notif-${i}`}>
          <span>{n.title}</span>
          <span data-testid={`timeout-${i}`}>{String(n.timeout)}</span>
          <button type="button" onClick={() => removeNotification(i)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

describe("NotificationProvider", () => {
  it("throws when hook used outside provider", () => {
    // render a component that uses the hook without wrapping provider
    const Bad = () => {
      useNotification();
      return null;
    };

    expect(() => render(<Bad />)).toThrow(
      "useNotification must be used within a NotificationProvider",
    );
  });

  it("addNotification adds notifications and removeNotification removes them", () => {
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    expect(screen.getByTestId("count").textContent).toBe("0");

    const add = screen.getByText("Add");
    fireEvent.click(add);

    // one notification rendered
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByText("Saved")).toBeInTheDocument();

    // timeout should be a number (stringified in DOM)
    const timeoutText = screen.getByTestId("timeout-0").textContent || "";
    expect(Number(timeoutText)).toBeGreaterThan(Date.now());

    // remove it
    const remove = screen.getByText("Remove");
    fireEvent.click(remove);

    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});
