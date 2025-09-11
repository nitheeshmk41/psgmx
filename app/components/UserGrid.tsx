import React from "react";
import { RefreshCw, Trophy, Award, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

// Import your modal component
import UserDetailModal from "./UserDetailModal";

interface User {
  id: number;
  username: string;
  roll_num: string;
  class: "G1" | "G2";
  totalsolved: number;
  weekly_solved: number;
  leetcode_id?: string;
  profileimg?: string;
  weeklyRank?: number;
  overallRank?: number;
  isWeeklyTop?: boolean;
  isOverallTop?: boolean;
}

interface UserGridProps {
  users: User[];
  refreshingIds: number[];
  onRefreshUser: (user: User) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

function UserCard({ user, isRefreshing, onRefresh }: {
  user: User;
  isRefreshing: boolean;
  onRefresh: (user: User) => void;
}) {
  const getBadgeVariant = (className: string) => {
    return className === "G1" ? "default" : "secondary";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <UserDetailModal user={user}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 border-muted cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-background transition-transform group-hover:scale-110">
                <AvatarImage 
                  src={user.profileimg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm leading-none">{user.username}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getBadgeVariant(user.class)}
                    className="text-xs"
                  >
                    {user.class}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{user.roll_num}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal from opening
                onRefresh(user);
              }}
              disabled={isRefreshing || !user.leetcode_id}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">{user.totalsolved || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Solved</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{user.weekly_solved || 0}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
            </div>
          </div>

          {(user.weeklyRank && user.weeklyRank <= 3) && (
            <div className="mt-3 pt-3 border-t border-muted">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Weekly Rank:</span>
                <div className="flex items-center space-x-1">
                  {user.weeklyRank === 1 && <span>🥇</span>}
                  {user.weeklyRank === 2 && <span>🥈</span>}
                  {user.weeklyRank === 3 && <span>🥉</span>}
                  <span className="font-medium">#{user.weeklyRank}</span>
                </div>
              </div>
            </div>
          )}

          {/* Click to view details indicator */}
          <div className="mt-3 pt-3 border-t border-muted">
            <p className="text-xs text-muted-foreground text-center group-hover:text-primary transition-colors">
              Click to view details
            </p>
          </div>
        </CardContent>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </UserDetailModal>
  );
}

export default function UserGrid({
  users,
  refreshingIds,
  onRefreshUser,
  currentPage,
  totalPages,
  onPageChange,
  canGoNext,
  canGoPrev,
  onNextPage,
  onPrevPage,
}: UserGridProps) {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} • {users.length} users
        </div>
      </div>

      {users.length > 0 ? (
        <>
          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isRefreshing={refreshingIds.includes(user.id)}
                onRefresh={onRefreshUser}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={onPrevPage}
                      className={cn(!canGoPrev && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={onNextPage}
                      className={cn(!canGoNext && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto max-w-sm">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No users found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}