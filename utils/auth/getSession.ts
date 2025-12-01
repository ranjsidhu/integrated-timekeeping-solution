import { auth } from "../../auth";

/**
 * Retrieves the current user session.
 * @returns Session object if exists, otherwise null
 */
const getSession = async () => {
  const session = await auth();
  return session;
};

export { getSession };
