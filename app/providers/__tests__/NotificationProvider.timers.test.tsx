import { act, fireEvent, render, screen } from "@testing-library/react";

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
            kind: "info",
            title: "T",
            subtitle: "x",
            type: "toast",
          })
        }
      >
        Add
      </button>
      <div data-testid="count">{String(notifications.length)}</div>
      {notifications.map((n, i) => (
        <div key={`${n.title}-${n.timeout}-${i}`} data-testid={`notif-${i}`}>
          <span>{n.title}</span>
          <button type="button" onClick={() => removeNotification(i)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

describe("NotificationProvider timers and cleanup", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("auto-removes a notification after timeout", () => {
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    const add = screen.getByText("Add");
    fireEvent.click(add);

    expect(screen.getByTestId("count").textContent).toBe("1");

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("clearTimeout is called when removing notification manually", () => {
    const clearSpy = jest.spyOn(global, "clearTimeout");

    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByTestId("count").textContent).toBe("1");

    fireEvent.click(screen.getByText("Remove"));

    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(clearSpy).toHaveBeenCalled();

    clearSpy.mockRestore();
  });

  it("clears timers on unmount", () => {
    const clearSpy = jest.spyOn(global, "clearTimeout");

    const { unmount } = render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByTestId("count").textContent).toBe("1");

    unmount();

    expect(clearSpy).toHaveBeenCalled();

    clearSpy.mockRestore();
  });
});
