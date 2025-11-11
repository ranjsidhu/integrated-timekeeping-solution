"use server";

const getUserDetails = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/user/${encodeURIComponent(email)}`,
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
  } catch (error: unknown) {
    console.error("Error fetching user details:", (error as Error).message);
    return null;
  }
};

export { getUserDetails };
