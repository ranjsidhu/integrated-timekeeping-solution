import "@testing-library/jest-dom";
jest.useFakeTimers();
jest.spyOn(global, "setTimeout");

// Global test setup
global.console = {
  ...console,
  // Suppress console.error and console.warn in tests unless explicitly needed
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
