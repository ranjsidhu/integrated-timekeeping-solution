/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { exportToCSV } from "./exportToCsv";

describe("exportToCSV", () => {
  let mockCreateElement: jest.SpyInstance;
  let mockAppendChild: jest.SpyInstance;
  let mockRemoveChild: jest.SpyInstance;
  let mockClick: jest.Mock;
  let mockCreateObjectURL: jest.Mock;
  let mockSetAttribute: jest.Mock;

  beforeEach(() => {
    mockClick = jest.fn();
    mockSetAttribute = jest.fn();

    const mockLink = {
      setAttribute: mockSetAttribute,
      click: mockClick,
      style: { visibility: "" },
    };

    mockCreateElement = jest
      .spyOn(document, "createElement")
      .mockReturnValue(mockLink as any);
    mockAppendChild = jest
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => mockLink as any);
    mockRemoveChild = jest
      .spyOn(document.body, "removeChild")
      .mockImplementation(() => mockLink as any);

    mockCreateObjectURL = jest.fn().mockReturnValue("blob:mock-url");
    global.URL.createObjectURL = mockCreateObjectURL;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("basic functionality", () => {
    it("generates CSV with headers and data", () => {
      const data = [
        { name: "Alice", age: 30, city: "New York" },
        { name: "Bob", age: 25, city: "London" },
      ];

      exportToCSV(data, "test");

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      const blob = mockCreateObjectURL.mock.calls[0][0];
      expect(blob.type).toBe("text/csv;charset=utf-8;");
    });

    it("does nothing when data array is empty", () => {
      exportToCSV([], "test");

      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it("creates link element with correct attributes", () => {
      const data = [{ name: "Alice" }];

      exportToCSV(data, "test_file");

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockSetAttribute).toHaveBeenCalledWith("href", "blob:mock-url");
      expect(mockSetAttribute).toHaveBeenCalledWith(
        "download",
        expect.stringContaining("test_file_"),
      );
    });

    it("includes current date in filename", () => {
      const data = [{ name: "Alice" }];
      const today = new Date().toISOString().split("T")[0];

      exportToCSV(data, "export");

      expect(mockSetAttribute).toHaveBeenCalledWith(
        "download",
        `export_${today}.csv`,
      );
    });

    it("triggers download by clicking link", () => {
      const data = [{ name: "Alice" }];

      exportToCSV(data, "test");

      expect(mockClick).toHaveBeenCalled();
    });

    it("adds and removes link from DOM", () => {
      const data = [{ name: "Alice" }];

      exportToCSV(data, "test");

      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it("sets link visibility to hidden", () => {
      const data = [{ name: "Alice" }];
      const mockLink = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: { visibility: "" },
      };
      mockCreateElement.mockReturnValue(mockLink as any);

      exportToCSV(data, "test");

      expect(mockLink.style.visibility).toBe("hidden");
    });
  });

  describe("CSV formatting", () => {
    it("creates proper CSV structure", () => {
      const data = [
        { name: "Alice", email: "alice@test.com" },
        { name: "Bob", email: "bob@test.com" },
      ];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("name,email");
        expect(csv).toContain("Alice,alice@test.com");
        expect(csv).toContain("Bob,bob@test.com");
      };
      reader.readAsText(blob);
    });

    it("escapes values containing commas", () => {
      const data = [{ name: "Doe, John", city: "New York" }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain('"Doe, John"');
      };
      reader.readAsText(blob);
    });

    it("escapes values containing quotes", () => {
      const data = [{ name: 'John "Johnny" Doe', city: "Boston" }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain('"John ""Johnny"" Doe"');
      };
      reader.readAsText(blob);
    });

    it("escapes values containing both commas and quotes", () => {
      const data = [{ description: 'Said "Hello, World!"', count: 5 }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain('"Said ""Hello, World!"""');
      };
      reader.readAsText(blob);
    });

    it("handles null values", () => {
      const data = [{ name: "Alice", city: null }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("Alice,");
      };
      reader.readAsText(blob);
    });

    it("handles undefined values", () => {
      const data = [{ name: "Alice", city: undefined }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("Alice,");
      };
      reader.readAsText(blob);
    });

    it("handles numeric values", () => {
      const data = [{ name: "Alice", age: 30, score: 95.5 }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("Alice,30,95.5");
      };
      reader.readAsText(blob);
    });

    it("handles boolean values", () => {
      const data = [{ name: "Alice", active: true, admin: false }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("Alice,true,false");
      };
      reader.readAsText(blob);
    });

    it("uses keys from first object as headers", () => {
      const data = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25, city: "London" },
      ];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        const lines = csv.split("\n");
        expect(lines[0]).toBe("name,age");
        expect(lines[2]).toBe("Bob,25,");
      };
      reader.readAsText(blob);
    });

    it("handles multiple rows with various data types", () => {
      const data = [
        { name: "Alice", hours: 40, email: "alice@test.com" },
        { name: "Bob, Jr.", hours: 35, email: "bob@test.com" },
        { name: 'Charlie "Chuck"', hours: 32, email: null },
      ];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("name,hours,email");
        expect(csv).toContain("Alice,40,alice@test.com");
        expect(csv).toContain('"Bob, Jr.",35,bob@test.com');
        expect(csv).toContain('"Charlie ""Chuck""",32,');
      };
      reader.readAsText(blob);
    });
  });

  describe("edge cases", () => {
    it("handles single row data", () => {
      const data = [{ name: "Alice", age: 30 }];

      exportToCSV(data, "test");

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it("handles empty string values", () => {
      const data = [{ name: "", email: "" }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain(",");
      };
      reader.readAsText(blob);
    });

    it("handles object with special characters in keys", () => {
      const data = [{ "First Name": "Alice", "Last-Name": "Smith" }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("First Name,Last-Name");
      };
      reader.readAsText(blob);
    });

    it("handles zero values", () => {
      const data = [{ name: "Alice", score: 0, count: 0 }];

      exportToCSV(data, "test");

      const blob = mockCreateObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      reader.onload = () => {
        const csv = reader.result as string;
        expect(csv).toContain("Alice,0,0");
      };
      reader.readAsText(blob);
    });
  });
});
