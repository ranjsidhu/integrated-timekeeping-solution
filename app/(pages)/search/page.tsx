import type { Metadata } from "next";
import { AuthWrapper, Layout } from "@/app/components";
import { getSession } from "@/utils/auth/getSession";
import Search from "./Search";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage() {
  const session = await getSession();

  return (
    <AuthWrapper session={session}>
      <Layout>
        <Search />
      </Layout>
    </AuthWrapper>
  );
}
