"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Menu, Moon, Sun, Monitor, Trophy, X, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Leaderboard", path: "/", icon: Trophy },
    { label: "Admin", path: "/admin" },
  ];

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/10 shadow-lg 
      bg-white/10 dark:bg-black/20 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <motion.div
          onClick={() => router.push("/")}
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <h1 className="text-xl font-bold tracking-tight text-foreground relative">
            MXians LeetBoard
            {/* Glow effect */}
            <span className="absolute inset-0 blur-xl opacity-30 group-hover:opacity-60 group-hover:text-primary transition" />
          </h1>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => router.push(item.path)}
              className={`relative font-medium px-4 py-2 rounded-xl transition-all duration-300 
                hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-md hover:shadow-primary/30
                ${
                  pathname === item.path
                    ? "text-primary bg-white/20 shadow-inner"
                    : "text-muted-foreground"
                }`}
            >
              {item.label}
            </Button>
          ))}

          {isAdmin && (
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="flex items-center gap-1 font-medium rounded-xl shadow-lg hover:shadow-red-500/40"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          )}

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full p-2 bg-white/20 dark:bg-black/30
                  hover:shadow-md hover:shadow-primary/40 transition"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border border-white/20 bg-white/20 dark:bg-black/30 backdrop-blur-xl shadow-lg"
            >
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full p-2 bg-white/20 dark:bg-black/30 hover:shadow-md hover:shadow-primary/40 transition"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-white/10 bg-white/20 dark:bg-black/30 backdrop-blur-2xl shadow-lg rounded-b-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`justify-start font-medium rounded-lg px-3 py-2 transition-all duration-300
                    hover:bg-white/30 dark:hover:bg-white/10 hover:shadow-md hover:shadow-primary/30
                    ${
                      pathname === item.path
                        ? "text-primary bg-white/30 shadow-inner"
                        : "text-muted-foreground"
                    }`}
                >
                  {item.label}
                </Button>
              ))}

              {isAdmin && (
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="destructive"
                  className="justify-start flex items-center gap-2 rounded-lg shadow-lg hover:shadow-red-500/40"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              )}

              {/* Theme Switcher */}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <span className="text-sm text-muted-foreground font-medium">Theme</span>
                <div className="grid grid-cols-3 gap-2">
                  {["light", "dark", "system"].map((mode) => (
                    <Button
                      key={mode}
                      variant="outline"
                      onClick={() => setTheme(mode)}
                      className={`flex items-center justify-center rounded-lg backdrop-blur-md
                        bg-white/20 dark:bg-black/20 border border-white/20
                        hover:shadow-md hover:shadow-primary/30 transition
                        ${theme === mode ? "border-primary text-primary" : ""}`}
                    >
                      {mode === "light" && <Sun className="h-4 w-4 mr-1" />}
                      {mode === "dark" && <Moon className="h-4 w-4 mr-1" />}
                      {mode === "system" && <Monitor className="h-4 w-4 mr-1" />}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
