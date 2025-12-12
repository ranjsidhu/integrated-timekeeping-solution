jest.mock("@/app/providers", () => ({
  useNotification: jest.fn(),
}));

jest.mock("./ToastNotification/ToastNotification", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      const {
        onClose,
        "data-testid": dt,
        ...rest
      } = props as Record<string, unknown>;
      return React.createElement("div", {
        "data-testid": dt,
        onClick: onClose as unknown as () => void,
        ...(rest as Record<string, unknown>),
      });
    },
  };
});

jest.mock("./InlineNotification/InlineNotification", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      const {
        onClose,
        "data-testid": dt,
        ...rest
      } = props as Record<string, unknown>;
      return React.createElement("div", {
        "data-testid": dt,
        onClick: onClose as unknown as () => void,
        ...(rest as Record<string, unknown>),
      });
    },
  };
});

import { fireEvent, render, screen } from "@testing-library/react";
import { useNotification } from "@/app/providers";
import Notifications from "./Notifications";

const mockUseNotification = useNotification as unknown as jest.Mock;

describe("Notifications component", () => {
  afterEach(() => jest.resetAllMocks());

  it("renders nothing when no notifications", () => {
    mockUseNotification.mockReturnValue({
      notifications: [],
      removeNotification: jest.fn(),
    });

    const { container } = render(<Notifications />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a toast notification in top-right and responds to onClose", () => {
    const remove = jest.fn();

    mockUseNotification.mockReturnValue({
      notifications: [
        {
          kind: "success",
          title: "Hello",
          subtitle: undefined,
          caption: undefined,
          timeout: Date.now() + 5000,
          type: "toast",
        },
      ],
      removeNotification: remove,
    });

    const { container } = render(<Notifications />);

    const wrapper = container.querySelector("div.fixed");
    expect(wrapper).toBeTruthy();

    const el = screen.getByTestId("notification-0");
    expect(el).toBeInTheDocument();

    // clicking should call removeNotification via onClose
    fireEvent.click(el);
    expect(remove).toHaveBeenCalledWith(0);
  });

  it("renders an inline notification and responds to onClose", () => {
    const remove = jest.fn();
    mockUseNotification.mockReturnValue({
      notifications: [
        {
          kind: "info",
          title: "Inline",
          subtitle: undefined,
          caption: undefined,
          timeout: Date.now() + 5000,
          type: "inline",
        },
      ],
      removeNotification: remove,
    });

    render(<Notifications />);

    const el = screen.getByTestId("notification-0");
    expect(el).toBeInTheDocument();

    fireEvent.click(el);
    expect(remove).toHaveBeenCalledWith(0);
  });
});
