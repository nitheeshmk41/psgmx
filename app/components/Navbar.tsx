"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Menu,
  Moon,
  Sun,
  Trophy,
  X,
  LogOut,
  Github,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      }
    };
    fetchUserRole();
    
    // Fetch GitHub Stars
    fetch("https://api.github.com/repos/nitheeshmk41/psgmx")
      .then(res => res.json())
      .then(data => setStars(data.stargazers_count))
      .catch(err => console.error("Error fetching stars:", err));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Home", path: "/", icon: Trophy },
    { label: "Admin", path: "/admin" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/10">
        
        {/* Brand Icon */}
        <div 
           onClick={() => router.push("/")}
           className="relative h-10 w-10 overflow-hidden rounded-full cursor-pointer hover:scale-105 transition-transform border border-zinc-200 dark:border-white/20 shadow-sm"
        >
             <Image 
               src="/psg_logo.jpeg" 
               alt="PSG Logo" 
               fill
               className="object-cover"
             />
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1 hidden md:block" />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => router.push(item.path)}
              className={`relative rounded-full px-5 py-2 font-medium text-sm transition-all duration-300
                ${
                  pathname === item.path
                    ? "text-primary bg-zinc-100 dark:bg-white/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-white/5"
                }`}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-1">
           {/* GitHub Star */}
           <a
            href="https://github.com/nitheeshmk41/psgmx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors border border-zinc-200 dark:border-white/10 group"
          >
            <Github className="h-4 w-4 group-hover:text-primary transition-colors" />
            {stars !== null && (
               <span className="text-xs font-semibold font-mono">{stars}</span>
            )}
          </a>

           {/* Theme Toggle */}
           <div 
             className="relative h-9 w-9 flex items-center justify-center rounded-full cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
           >
              <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-400" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
           </div>

          {isAdmin && (
             <Button
                onClick={handleLogout}
                size="icon"
                variant="ghost" 
                className="rounded-full h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-500/10"
             >
                <LogOut className="h-4 w-4" />
             </Button>
          )}
          
          {/* Mobile Toggle */}
          <div className="md:hidden ml-1">
             <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full h-9 w-9 hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
       <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 p-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl border border-zinc-200 dark:border-white/20 shadow-2xl min-w-[200px] flex flex-col gap-1 pointer-events-auto"
          >
             {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => {
                     router.push(item.path);
                     setIsMobileMenuOpen(false);
                  }}
                  className="justify-start rounded-xl w-full"
                >
                   {item.label}
                </Button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
