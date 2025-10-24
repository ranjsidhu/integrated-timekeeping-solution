import { Layout } from "@/app/components";
import LoginForm from "../../components/LoginForm/LoginForm";

export default async function Login() {
  return (
    <Layout>
      <div className="flex justify-center items-center w-full p-8 m-0 overflow-hidden min-h-screen">
        <div className="bg-white p-12 w-full max-w-md rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold text-[#161616]">Log in</h1>
            <p className="text-sm text-[#525252] mt-2">
              Sign in to your Integrated Timekeeping account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
}
