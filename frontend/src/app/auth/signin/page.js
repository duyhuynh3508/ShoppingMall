'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <div className="text-center my-4">or</div>
        <button  className="w-full flex items-center justify-center bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 mb-3"
        onClick={() => signIn("google", { callbackUrl: "/" })}>
          <FcGoogle className="mr-2 text-xl" /> Login with Google
        </button>
        <button className="w-full flex items-center justify-center bg-blue-800 text-white p-3 rounded-lg hover:bg-blue-900"
        onClick={() => signIn("facebook", { callbackUrl: "/" })}>
          <FaFacebook className="mr-2 text-xl" /> Login with Facebook
        </button>
      </div>
    </div>
  );
};

export default SignIn;