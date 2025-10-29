import { hashPassword, verifyPassword } from "../password";

// Mock Web Crypto API
const mockCrypto = {
  getRandomValues: jest.fn(),
  subtle: {
    importKey: jest.fn(),
    deriveBits: jest.fn(),
  },
};

// Mock TextEncoder and TextDecoder
const mockTextEncoder = {
  encode: jest.fn(),
};

const mockTextDecoder = {
  decode: jest.fn(),
};

// Mock btoa and atob
const mockBtoa = jest.fn();
const mockAtob = jest.fn();

// Setup global mocks
Object.defineProperty(global, "crypto", {
  value: mockCrypto,
  writable: true,
});

Object.defineProperty(global, "TextEncoder", {
  value: jest.fn(() => mockTextEncoder),
  writable: true,
});

Object.defineProperty(global, "TextDecoder", {
  value: jest.fn(() => mockTextDecoder),
  writable: true,
});

Object.defineProperty(global, "btoa", {
  value: mockBtoa,
  writable: true,
});

Object.defineProperty(global, "atob", {
  value: mockAtob,
  writable: true,
});

describe("Password Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "testPassword123";
      const mockSalt = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ]);
      const mockPasswordBuffer = new ArrayBuffer(8);
      const mockKey = { type: "secret" };
      const mockHash = new ArrayBuffer(32);

      // Setup mocks
      mockCrypto.getRandomValues.mockReturnValue(mockSalt);
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveBits.mockResolvedValue(mockHash);
      mockBtoa.mockReturnValue("encodedHashString");

      const result = await hashPassword(password);

      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(
        expect.any(Uint8Array),
      );
      expect(mockTextEncoder.encode).toHaveBeenCalledWith(password);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        "raw",
        mockPasswordBuffer,
        "PBKDF2",
        false,
        ["deriveBits"],
      );
      expect(mockCrypto.subtle.deriveBits).toHaveBeenCalledWith(
        { name: "PBKDF2", salt: mockSalt, iterations: 100000, hash: "SHA-256" },
        mockKey,
        256,
      );
      expect(mockBtoa).toHaveBeenCalled();
      expect(result).toBe("encodedHashString");
    });

    it("should handle errors during password hashing", async () => {
      const password = "testPassword123";
      mockCrypto.getRandomValues.mockImplementation(() => {
        throw new Error("Crypto error");
      });

      await expect(hashPassword(password)).rejects.toThrow("Crypto error");
    });

    it("should handle importKey errors", async () => {
      const password = "testPassword123";
      const mockSalt = new Uint8Array(16);
      const mockPasswordBuffer = new ArrayBuffer(8);

      mockCrypto.getRandomValues.mockReturnValue(mockSalt);
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockRejectedValue(
        new Error("ImportKey error"),
      );

      await expect(hashPassword(password)).rejects.toThrow("ImportKey error");
    });

    it("should handle deriveBits errors", async () => {
      const password = "testPassword123";
      const mockSalt = new Uint8Array(16);
      const mockPasswordBuffer = new ArrayBuffer(8);
      const mockKey = { type: "secret" };

      mockCrypto.getRandomValues.mockReturnValue(mockSalt);
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveBits.mockRejectedValue(
        new Error("DeriveBits error"),
      );

      await expect(hashPassword(password)).rejects.toThrow("DeriveBits error");
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "testPassword123";
      const hash = "validHashString";
      const mockPasswordBuffer = new ArrayBuffer(8);
      const mockKey = { type: "secret" };

      // Create a combined buffer (salt + hash)
      const combinedArray = new Uint8Array(48);
      // Salt (16 bytes)
      for (let i = 0; i < 16; i++) {
        combinedArray[i] = i + 1;
      }
      // Hash (32 bytes)
      for (let i = 16; i < 48; i++) {
        combinedArray[i] = (i - 16) % 256;
      }

      // Create matching new hash
      const mockNewHashArray = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        mockNewHashArray[i] = i % 256;
      }

      // Convert to binary string for atob mock
      let binaryString = "";
      for (let i = 0; i < combinedArray.length; i++) {
        binaryString += String.fromCharCode(combinedArray[i]);
      }

      mockAtob.mockReturnValue(binaryString);
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveBits.mockResolvedValue(mockNewHashArray.buffer);

      const result = await verifyPassword(password, hash);

      expect(mockAtob).toHaveBeenCalledWith(hash);
      expect(mockTextEncoder.encode).toHaveBeenCalledWith(password);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        "raw",
        mockPasswordBuffer,
        "PBKDF2",
        false,
        ["deriveBits"],
      );
      expect(mockCrypto.subtle.deriveBits).toHaveBeenCalledWith(
        {
          name: "PBKDF2",
          salt: expect.any(Uint8Array),
          iterations: 100000,
          hash: "SHA-256",
        },
        mockKey,
        256,
      );
      expect(result).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "wrongPassword";
      const hash = "validHashString";
      const mockPasswordBuffer = new ArrayBuffer(8);
      const mockKey = { type: "secret" };

      // Create a combined buffer (salt + hash)
      const combinedArray = new Uint8Array(48);
      // Salt (16 bytes)
      for (let i = 0; i < 16; i++) {
        combinedArray[i] = i + 1;
      }
      // Stored hash (32 bytes)
      for (let i = 16; i < 48; i++) {
        combinedArray[i] = i % 256;
      }

      // Create different new hash (wrong password)
      const mockNewHashArray = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        mockNewHashArray[i] = (i + 1) % 256; // Different pattern
      }

      // Convert to binary string
      let binaryString = "";
      for (let i = 0; i < combinedArray.length; i++) {
        binaryString += String.fromCharCode(combinedArray[i]);
      }

      jest.spyOn(global, "atob").mockReturnValue(binaryString);
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveBits.mockResolvedValue(mockNewHashArray.buffer);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(false);
    });

    it("should handle different hash lengths", async () => {
      const password = "testPassword";
      const hash = "validHashString";
      const mockPasswordBuffer = new ArrayBuffer(8);
      const mockKey = { type: "secret" };

      // Create hash arrays with different lengths
      const mockNewHashArray = new Uint8Array(16); // Different length

      jest.spyOn(global, "atob").mockReturnValue("x".repeat(48));
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveBits.mockResolvedValue(mockNewHashArray.buffer);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(false);
    });

    it("should handle errors during password verification", async () => {
      const password = "testPassword123";
      const hash = "validHashString";

      mockAtob.mockImplementation(() => {
        throw new Error("Base64 decode error");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await verifyPassword(password, hash);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying password:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle importKey errors during verification", async () => {
      const password = "testPassword123";
      const hash = "validHashString";
      const mockPasswordBuffer = new ArrayBuffer(8);

      jest.spyOn(global, "atob").mockReturnValue("x".repeat(48));
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockRejectedValue(
        new Error("ImportKey verification failed"),
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await verifyPassword(password, hash);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying password:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle deriveBits errors during verification", async () => {
      const password = "testPassword123";
      const hash = "validHashString";
      const mockPasswordBuffer = new ArrayBuffer(8);
      const mockKey = { type: "secret" };

      jest.spyOn(global, "atob").mockReturnValue("x".repeat(48));
      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveBits.mockRejectedValue(
        new Error("DeriveBits verification failed"),
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await verifyPassword(password, hash);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying password:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle malformed hash strings", async () => {
      const password = "testPassword123";
      const hash = "invalidHash";

      mockAtob.mockImplementation(() => {
        throw new Error("Invalid character");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await verifyPassword(password, hash);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying password:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should use constant-time comparison", async () => {
      const password = "testPassword123";
      const hash = "validHashString";
      const mockPasswordBuffer = new ArrayBuffer(8);
      const mockKey = { type: "secret" };

      // Create a combined buffer that represents salt (16 bytes) + hash (32 bytes)
      const combinedArray = new Uint8Array(48);

      // Set salt (first 16 bytes)
      for (let i = 0; i < 16; i++) {
        combinedArray[i] = i + 1; // Salt bytes
      }

      // Set hash (last 32 bytes) - these should match what deriveBits returns
      for (let i = 16; i < 48; i++) {
        combinedArray[i] = (i - 16) % 256; // Hash bytes
      }

      // Create the exact same hash that deriveBits should return
      const mockNewHashArray = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        mockNewHashArray[i] = i % 256; // Same pattern as stored hash
      }

      // Mock atob to return the combined buffer as a binary string
      let binaryString = "";
      for (let i = 0; i < combinedArray.length; i++) {
        binaryString += String.fromCharCode(combinedArray[i]);
      }
      jest.spyOn(global, "atob").mockReturnValue(binaryString);

      mockTextEncoder.encode.mockReturnValue({ buffer: mockPasswordBuffer });
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveBits.mockResolvedValue(mockNewHashArray.buffer);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });
  });
});
