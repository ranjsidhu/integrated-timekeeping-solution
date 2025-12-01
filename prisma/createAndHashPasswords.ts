import { hashPassword } from "@/utils/auth/password";

async function getPasswordFromPasswordWolf(length: number) {
  try {
    const url = `https://passwordwolf.com/api/?length=${length}&special=1&upper=1&lower=1&numbers=1`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("PasswordWolf failed");
    const data = await res.json();
    return data[0].password;
  } catch (error: unknown) {
    console.error(
      "Error fetching password from PasswordWolf:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

const createAndHashPassword = async (user: string) => {
  const plainTextPassword = await getPasswordFromPasswordWolf(15);
  const hashedPassword = await hashPassword(plainTextPassword);

  console.log("\n");
  console.log("---Plaintext/Hashed Pair Start---");
  console.log(`🚀 ~ createAndHashPasswords ~ user: ${user}`);
  console.log("🚀 ~ createAndHashPasswords ~ password:", plainTextPassword);
  console.log("🚀 ~ createAndHashPasswords ~ hashedPassword:", hashedPassword);
  console.log("---Plaintext/Hashed Pair End---");
  console.log("\n");

  return hashedPassword;
};

export { createAndHashPassword };
