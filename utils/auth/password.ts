/**
 * Utility functions for password hashing and verification using Web Crypto API
 */

// Convert string to ArrayBuffer
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

// Convert ArrayBuffer to base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 string to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Import the password as a key
  const key = await crypto.subtle.importKey(
    "raw",
    stringToBuffer(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  // Derive the hash
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  // Combine salt and hash
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);

  // Convert to base64 for storage
  return bufferToBase64(combined.buffer);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    // Convert stored hash back to ArrayBuffer
    const combined = base64ToBuffer(hash);

    // Extract salt and hash
    const salt = new Uint8Array(combined.slice(0, 16));
    const storedHash = new Uint8Array(combined.slice(16));

    // Import the password as a key
    const key = await crypto.subtle.importKey(
      "raw",
      stringToBuffer(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );

    // Derive the hash
    const newHash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    );

    // Compare hashes using constant-time comparison
    const newHashArray = new Uint8Array(newHash);
    if (storedHash.length !== newHashArray.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < storedHash.length; i++) {
      result |= storedHash[i] ^ newHashArray[i];
    }
    return result === 0;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
