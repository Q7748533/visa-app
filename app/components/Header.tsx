"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full p-4 md:p-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
        <Link href="/">Airport<span className="text-blue-600">Matrix</span></Link>
      </h1>
      <nav className="hidden md:flex gap-6 text-sm font-bold text-slate-600" aria-label="Primary navigation">
        <Link href="/airports" className="hover:text-blue-600 transition-colors">All Airports</Link>
        <Link href="/about" className="hover:text-blue-600 transition-colors">How it Works</Link>
      </nav>
      {/* 移动端菜单按钮 */}
      <button 
        className="md:hidden p-2 text-slate-600 hover:text-blue-600"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg md:hidden">
          <nav className="flex flex-col p-4 gap-3" aria-label="Mobile navigation">
            <Link 
              href="/airports" 
              className="text-slate-600 hover:text-blue-600 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Airports
            </Link>
            <Link 
              href="/about" 
              className="text-slate-600 hover:text-blue-600 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
