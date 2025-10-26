"use server";

const getUserDetails = async (email: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  const data = await response.json();
  return data;
};

export { getUserDetails };
