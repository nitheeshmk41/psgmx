"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface POTDProps {
  potd: {
    link: string;
    question: {
      title: string;
      difficulty: string;
    };
  };
}

export default function POTDBadge({ potd }: POTDProps) {
  return (
    <motion.a
      href={`https://leetcode.com${potd.link}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                 bg-green-500/10 dark:bg-green-400/10 text-sm font-medium 
                 text-green-700 dark:text-green-200 hover:bg-green-500/20 
                 dark:hover:bg-green-400/20 transition-colors"
    >
      {/* Problem name */}
      {potd.question.title}

      {/* Difficulty */}
      <span
        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
          potd.question.difficulty === "Easy"
            ? "bg-green-500/20 text-green-800 dark:bg-green-400/20 dark:text-green-100"
            : potd.question.difficulty === "Medium"
            ? "bg-yellow-500/20 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-100"
            : "bg-red-500/20 text-red-800 dark:bg-red-400/20 dark:text-red-100"
        }`}
      >
        {potd.question.difficulty}
      </span>

      {/* Arrow */}
      <ArrowRight className="w-4 h-4 opacity-70" />
    </motion.a>
  );
}
