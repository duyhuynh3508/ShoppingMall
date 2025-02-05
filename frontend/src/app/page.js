// src/app/page.js
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  const { data: session } = useSession();
  console.log(session);
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/logo.jpg" alt="Logo" width={50} height={50} />
          <h1 className="text-xl font-bold ml-2">Sikico</h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/"><p className="hover:text-blue-600">Home</p></Link></li>
            <li><Link href="/contact"><p className="hover:text-blue-600">Contact</p></Link></li>
            <li><Link href="/blog"><p className="hover:text-blue-600">Blog</p></Link></li>
            <li>
              {session && session.user ? (
              <div className="text-center flex items-center justify-center space-x-4">
              <h2 className="font-bold">Welcome, {session.user.name}!</h2>
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            </div>
            ) : (
              <Link href="/auth/signin">
                  <p className="hover:text-blue-600">Login</p>
                </Link>
            )}
            </li>
            <li>{session && session.user ? (<button
                  onClick={() => signOut()}
                  className="hover:text-blue-600"
                >
                  Log Out
                </button>) : '' }</li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Welcome to Sikico</h2>
          </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
        <p>&copy; 2025 My Website. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;