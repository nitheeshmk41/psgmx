import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterClass: "G1" | "G2" | "ALL";
  onFilterChange: (value: "G1" | "G2" | "ALL") => void;
  totalResults: number;
}

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  filterClass,
  onFilterChange,
  totalResults,
}: SearchAndFilterProps) {
  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by username or roll number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Class Filter - Segmented Control */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={filterClass === "ALL" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("ALL")}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-all"
            >
              All
            </Button>
            <Button
              variant={filterClass === "G1" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("G1")}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-all"
            >
              G1
            </Button>
            <Button
              variant={filterClass === "G2" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("G2")}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-all"
            >
              G2
            </Button>
          </div>

          {/* Results Count */}
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterClass !== "ALL") && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-muted">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="outline" className="text-xs">
                Search: "{searchTerm}"
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-3 w-3 hover:bg-transparent"
                  onClick={clearSearch}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {filterClass !== "ALL" && (
              <Badge variant="outline" className="text-xs">
                Class: {filterClass}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-3 w-3 hover:bg-transparent"
                  onClick={() => onFilterChange("ALL")}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                onSearchChange("");
                onFilterChange("ALL");
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}