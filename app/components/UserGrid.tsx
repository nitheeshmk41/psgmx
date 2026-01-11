"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Trophy, Code2, RefreshCw, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserDetailModal from "./UserDetailModal";
import SearchAndFilter from "./SearchAndFilter";
import { User } from "@/app/types";

interface UserGridProps {
  users: User[];
  onRefresh: (user: User) => Promise<void>;
  refreshingIds: number[];
}

const USERS_PER_PAGE = 12;

export default function UserGrid({ users, onRefresh, refreshingIds }: UserGridProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterClass, setFilterClass] = useState<"G1" | "G2" | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [rankType, setRankType] = useState<"weekly" | "overall">("weekly");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter users when props or filter state changes
  useEffect(() => {
    const matches = users.filter((user) => {
      const matchesClass = filterClass === "ALL" || user.class === filterClass;
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roll_num.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    });
    setFilteredUsers(matches);
    setCurrentPage(1);
  }, [users, filterClass, searchTerm]);

  // Compute ranks for display
  const usersWithRanks = useMemo(() => computeRanks(filteredUsers), [filteredUsers]);

  // Top lists based on filtered data
  const top3Weekly = useMemo(() => {
    return [...usersWithRanks]
      .sort((a, b) => (a.weeklyRank ?? Infinity) - (b.weeklyRank ?? Infinity))
      .slice(0, 3);
  }, [usersWithRanks]);

  const isSearching = searchTerm.trim() !== "";

  const sortedUsers = useMemo(() => {
    let sorted = [...usersWithRanks].sort((a, b) =>
      rankType === "weekly"
        ? (a.weeklyRank ?? Infinity) - (b.weeklyRank ?? Infinity)
        : (a.overallRank ?? Infinity) - (b.overallRank ?? Infinity)
    );

    if (rankType === "weekly" && !isSearching) {
       const top3Ids = new Set(top3Weekly.map(u => u.id));
       sorted = sorted.filter(u => !top3Ids.has(u.id));
    }
    return sorted;
  }, [usersWithRanks, rankType, isSearching, top3Weekly]);

  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const onPageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const onNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const onPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  return (
    <div className="space-y-6">
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterClass={filterClass}
        onFilterChange={setFilterClass}
        totalResults={filteredUsers.length}
      />

      {!isSearching && (
        <>
          <Leaderboard
            title="Top 3 Weekly Leaders"
            users={top3Weekly}
          />
        </>
      )}

      <div className="flex justify-center">
        <Tabs
          defaultValue={rankType}
          onValueChange={(value) => setRankType(value as "weekly" | "overall")}
        >
          <TabsList>
            <TabsTrigger value="weekly">Weekly Rank</TabsTrigger>
            <TabsTrigger value="overall">Overall Rank</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedUsers.map((user) => (
          <UserDetailModal key={user.id} user={user}>
            <div className="cursor-pointer h-full">
              <UserCard
                user={user}
                refreshUser={onRefresh}
                refreshingIds={refreshingIds}
                rankType={rankType}
              />
            </div>
          </UserDetailModal>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious className={cn(!canGoPrev && "pointer-events-none opacity-50")} onClick={onPrevPage} />
              </PaginationItem>
              {renderPaginationItems(totalPages, currentPage, onPageChange)}
              <PaginationItem>
                <PaginationNext className={cn(!canGoNext && "pointer-events-none opacity-50")} onClick={onNextPage} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {sortedUsers.length === 0 && <NoUsers />}
    </div>
  );
}

// ---------------- Components ----------------

function UserCard({
  user,
  refreshUser,
  refreshingIds,
  rankType,
}: {
  user: User;
  refreshUser: (user: User) => Promise<void>;
  refreshingIds: number[];
  rankType: "weekly" | "overall";
}) {
  const isTop3Overall = rankType === "overall" && (user.overallRank || 999) <= 3;
  
  return (
    <Card className={cn(
        "group relative h-full flex flex-col hover:shadow-lg transition-all duration-300",
        isTop3Overall && "border-yellow-500/50 bg-yellow-500/5 dark:bg-yellow-500/10 shadow-yellow-500/10"
    )}>
       <div className="absolute top-2 right-2 flex gap-1 z-10">
         <span className={cn(
             "text-xs font-bold px-2 py-0.5 rounded-full",
             isTop3Overall ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" : "bg-primary/10 text-primary"
         )}>
            #{rankType === "weekly" ? user.weeklyRank : user.overallRank}
         </span>
       </div>
      <CardHeader className="flex flex-row items-center gap-3 pb-2 pt-4">
        <Avatar className="w-12 h-12 border border-border">
          <AvatarImage src={user.profileimg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
          <AvatarFallback>{user.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate pr-6">{user.username}</p>
          <p className="text-xs text-muted-foreground">{user.roll_num}</p>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pt-2">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{user.totalsolved}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{user.weekly_solved}</span>
            <span className="text-xs text-muted-foreground">Week</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs h-8"
          onClick={(e) => {
            e.stopPropagation();
            refreshUser(user);
          }}
          disabled={refreshingIds.includes(user.id)}
        >
          <RefreshCw className={cn("h-3 w-3 mr-2", refreshingIds.includes(user.id) && "animate-spin")} />
          Refresh Stats
        </Button>
      </CardContent>
    </Card>
  );
}

function Leaderboard({
  title,
  users,
}: {
  title: string;
  users: User[];
}) {
  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((user, idx) => (
          <UserDetailModal key={user.id} user={user}>
             <Card 
               className={cn(
                 "group relative cursor-pointer hover:shadow-lg transition-all duration-300 border-2",
                 idx === 0 ? "border-yellow-400/50 bg-yellow-400/5" : 
                 idx === 1 ? "border-gray-400/50 bg-gray-400/5" : 
                 "border-amber-600/50 bg-amber-600/5"
               )}
             >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  {idx === 0 && <Award className="w-8 h-8 text-yellow-500 fill-yellow-500" />}
                  {idx === 1 && <Award className="w-7 h-7 text-gray-400 fill-gray-400" />}
                  {idx === 2 && <Award className="w-6 h-6 text-amber-600 fill-amber-600" />}
              </div>

              <CardHeader className="flex flex-col items-center pb-2 pt-6 text-center">
                  <Avatar className="w-16 h-16 border-2 border-background shadow-sm">
                    <AvatarImage src={user.profileimg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="mt-2">
                    <p className="font-semibold text-lg">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.roll_num}</p>
                  </div>
              </CardHeader>
              <CardContent className="text-center pb-4">
                 <div className="flex justify-center gap-4 text-sm">
                     <div className="flex flex-col">
                        <span className="font-bold text-lg">{user.weekly_solved}</span>
                        <span className="text-xs text-muted-foreground">Weekly</span>
                     </div>
                     <div className="w-px bg-border/50" />
                     <div className="flex flex-col">
                        <span className="font-bold text-lg">{user.totalsolved}</span>
                        <span className="text-xs text-muted-foreground">Total</span>
                     </div>
                 </div>
              </CardContent>
            </Card>
          </UserDetailModal>
        ))}
      </div>
    </div>
  );
}

// ---------------- Helpers ----------------

function renderPaginationItems(totalPages: number, currentPage: number, onPageChange: (page: number) => void) {
  const items: React.ReactNode[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);

  if (startPage > 1) {
    items.push(
      <PaginationItem key={1}>
        <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
      </PaginationItem>
    );
    if (startPage > 2) items.push(<PaginationItem key="ellipsis1"><PaginationEllipsis /></PaginationItem>);
  }

  for (let i = startPage; i <= endPage; i++) {
    items.push(
      <PaginationItem key={i}>
        <PaginationLink onClick={() => onPageChange(i)} isActive={currentPage === i}>
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) items.push(<PaginationItem key="ellipsis2"><PaginationEllipsis /></PaginationItem>);
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
      </PaginationItem>
    );
  }

  return items;
}

function NoUsers() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto max-w-sm">
        <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No users found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
      </div>
    </div>
  );
}

function computeRanks(users: User[]) {
  const cloned = users.map((u) => ({ ...u }));
  
  // Weekly Rank -> Overall Solved -> Roll Number (Last 3 digits reversed logic?? No, lower is better usually for rank? Or lexicographical?)
  // Logic: "25mx201 is 1st rank, 336 is 2nd rank" => Lower string value is better rank.
  cloned.sort((a, b) => {
      // 1. Weekly Solved (Desc)
      if ((b.weekly_solved || 0) !== (a.weekly_solved || 0)) {
          return (b.weekly_solved || 0) - (a.weekly_solved || 0);
      }
      // 2. Overall Solved (Desc)
      if ((b.totalsolved || 0) !== (a.totalsolved || 0)) {
          return (b.totalsolved || 0) - (a.totalsolved || 0);
      }
      // 3. Roll Number (Asc) - Lexicographical comparison for strings ("25mx201" < "25mx336")
      return a.roll_num.localeCompare(b.roll_num);
  });
  
  cloned.forEach((user, idx) => {
    // Handle ties
    // A tie only occurs if ALL sorting criteria are identical. 
    // Since Roll Number is unique (usually), there shouldn't be shared ranks unless duplicate roll numbers exists or logic differs.
    // If the user wants strictly same rank for same score, we ignore roll number for *ranking* number but use it for *ordering*.
    // But the request implies ordering: "25mx201 is 1st rank, 336 is 2nd rank."
    // This implies they get DIFFERENT ranks (1 and 2).
    
    // So simpler: just rank by index + 1.
    user.weeklyRank = idx + 1;
  });

  // Overall Rank Logic (just for reference if needed, usually total solved is primary)
  const overallSorted = [...cloned].sort((a, b) => (b.totalsolved || 0) - (a.totalsolved || 0));
  
  overallSorted.forEach((user, idx) => {
      // Simple ranking for overall too
      if (idx > 0 && user.totalsolved === overallSorted[idx - 1].totalsolved) {
           user.overallRank = overallSorted[idx - 1].overallRank;
      } else {
           user.overallRank = idx + 1;
      }
  });

  return cloned; 
}
