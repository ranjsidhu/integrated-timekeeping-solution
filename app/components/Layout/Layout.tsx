import type { LayoutProps } from "@/types/layout.types";
import Header from "../Header/Header";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex justify-center items-center w-screen m-0">
      <Header />
      <main className="pt-12 max-w-5xl flex justify-center items-center w-full">
        {children}
      </main>
    </div>
  );
}
