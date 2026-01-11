"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { refreshUser as refreshUserLib, User } from "@/lib/refreshUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, LogOut, UserPlus, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 👇 Form type allows empty class initially
type UserForm = Omit<User, "id" | "totalsolved" | "weekly_solved"> & {
  class?: "G1" | "G2" | "";
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>({
    username: "",
    roll_num: "",
    leetcode_id: "",
    class: "G1",
  });
  const [loadingAll, setLoadingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingSingleId, setLoadingSingleId] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/admin/login");
    });
  }, [router]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      const sortedUsers = (data || []).sort((a, b) =>
        a.roll_num.localeCompare(b.roll_num)
      ) as User[];
      setUsers(sortedUsers);
    } catch (err: any) {
      toast.error("Failed to fetch users: " + err.message);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filterUsers = (users: User[], classFilter: string) => {
    let filtered = users;
    if (classFilter !== "all") {
      filtered = users.filter(
        (u) => u.class?.toLowerCase() === classFilter.toLowerCase()
      );
    }
    setFilteredUsers(
      filtered.filter((u) =>
        u.roll_num.match(/^25mx(100|[1-2][0-9]{2}|3[0-6][0-9]|370)$/i)
      )
    );
  };

  useEffect(() => {
    filterUsers(users, classFilter);
  }, [classFilter, users]);

  const refreshUser = async (user: User) => {
    setLoadingSingleId(user.id);
    try {
      await refreshUserLib(user);
      await fetchUsers();
      toast.success(`Stats refreshed for ${user.username}`);
    } catch (err: any) {
      toast.error(`Failed to refresh ${user.username}: ${err.message}`);
    } finally {
      setLoadingSingleId(null);
    }
  };

  const refreshAllUsers = async () => {
    setLoadingAll(true);
    setProgress(0);
    for (let i = 0; i < filteredUsers.length; i++) {
      await refreshUser(filteredUsers[i]);
      setProgress(Math.round(((i + 1) / filteredUsers.length) * 100));
    }
    setLoadingAll(false);
    toast.success("All users refreshed!");
  };

  const addUser = async () => {
    if (!form.username || !form.leetcode_id) {
      toast.error("Username and LeetCode ID are required");
      return;
    }
    if (!form.roll_num.match(/^25mx(100|[1-2][0-9]{2}|3[0-6][0-9]|370)$/i)) {
      toast.error("Roll number must be between 25mx100 and 25mx370");
      return;
    }
    if (form.class && !["G1", "G2"].includes(form.class.toUpperCase())) {
      toast.error("Class must be either G1 or G2");
      return;
    }

    try {
      const { error } = await supabase.from("users").insert([form]);
      if (error) throw error;
      toast.success("User added! Fetching stats...");
      await refreshUser({ ...form, id: 0 } as User);
      setForm({ username: "", roll_num: "", leetcode_id: "", class: "G1" });
    } catch (err: any) {
      toast.error("Failed to add user: " + err.message);
    }
  };

  const bulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const text = await file.text();
    let records: User[];
    try {
      records = JSON.parse(text).map((r: any) => ({
        username: r.username || r.name,
        roll_num: r.roll_num || r.rollnum,
        leetcode_id: r.leetcode_id,
        class: r.class,
        id: 0,
      })) as User[];
      for (const record of records) {
        if (
          !record.roll_num.match(/^25mx(100|[1-2][0-9]{2}|3[0-6][0-9]|370)$/i)
        ) {
          throw new Error(`Invalid roll number: ${record.roll_num}`);
        }
        if (record.class && !["G1", "G2"].includes(record.class.toUpperCase())) {
          throw new Error(`Invalid class: ${record.class}`);
        }
      }
    } catch (err: any) {
      toast.error("Invalid JSON file: " + err.message);
      return;
    }

    try {
      const { error } = await supabase.from("users").insert(records);
      if (error) throw error;
      toast.success("Bulk upload complete! Fetching stats...");
      setProgress(0);
      for (let i = 0; i < records.length; i++) {
        await refreshUser(records[i]);
        setProgress(Math.round(((i + 1) / records.length) * 100));
      }
      toast.success("All users stats synced!");
    } catch (err: any) {
      toast.error("Bulk upload failed: " + err.message);
    }
  };

  const deleteUser = async (id: number, leetcode_id: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      toast.success(`User ${leetcode_id} deleted`);
      fetchUsers();
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6 md:p-8">
      <div className="container mx-auto space-y-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users and track progress statistics</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            onClick={refreshAllUsers}
            disabled={loadingAll}
            className="flex-1 md:flex-none bg-primary hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            {loadingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh All"
            )}
          </Button>
          <Button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/admin");
            }}
            variant="destructive"
            className="flex-1 md:flex-none shadow-md hover:shadow-lg transition-all"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {loadingAll && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-muted-foreground">
            Refreshing users: {progress}%
          </p>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="class-filter">Class</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger id="class-filter" className="w-[180px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="G1">G1</SelectItem>
                  <SelectItem value="G2">G2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add User Form */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roll_num">Roll Number</Label>
              <Input
                id="roll_num"
                placeholder="Enter roll number (25mx100 to 25mx370)"
                value={form.roll_num}
                onChange={(e) => setForm({ ...form, roll_num: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="leetcode_id">LeetCode ID</Label>
              <Input
                id="leetcode_id"
                placeholder="Enter LeetCode ID"
                value={form.leetcode_id}
                onChange={(e) =>
                  setForm({ ...form, leetcode_id: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="class">Class</Label>
              <Select
                value={form.class || ""}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    class: (value as "G1" | "G2") || undefined,
                  })
                }
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G1">G1</SelectItem>
                  <SelectItem value="G2">G2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addUser} className="mt-4">
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button asChild>
              <label htmlFor="bulk-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload JSON File
                <input
                  id="bulk-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={bulkUpload}
                />
              </label>
            </Button>
            {progress > 0 && (
              <div className="flex-1">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Uploading: {progress}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>LeetCode ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.roll_num}</TableCell>
                  <TableCell>{u.leetcode_id}</TableCell>
                  <TableCell>{u.class}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(u.id, u.leetcode_id || "")}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => refreshUser(u)}
                        disabled={loadingSingleId === u.id}
                      >
                        {loadingSingleId === u.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing
                          </>
                        ) : (
                          "Refresh"
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
