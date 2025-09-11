"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { refreshUser as refreshUserLib } from "@/lib/refreshUser";

interface User {
  id: number;
  username: string;
  roll_num: string;
  leetcode_id: string;
  class: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    username: "",
    roll_num: "",
    leetcode_id: "",
    class: "",
  });
  const [loadingAll, setLoadingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingSingleId, setLoadingSingleId] = useState<number | null>(null); // for single user loading
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/admin/login");
    });
  }, [router]);

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error("Failed to fetch users: " + err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Refresh single user
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

  // Admin refresh all users
  const refreshAllUsers = async () => {
    setLoadingAll(true);
    setProgress(0);
    for (let i = 0; i < users.length; i++) {
      await refreshUser(users[i]);
      setProgress(Math.round(((i + 1) / users.length) * 100));
    }
    setLoadingAll(false);
    toast.success("All users refreshed!");
  };

  // Add single user
  const addUser = async () => {
    if (!form.username || !form.leetcode_id) {
      toast.error("Username and LeetCode ID required");
      return;
    }

    try {
      const { error } = await supabase.from("users").insert([form]);
      if (error) throw error;
      toast.success("User added! Fetching stats...");
      await refreshUser({ ...form, id: 0 } as User); // temporary id for refresh
      setForm({ username: "", roll_num: "", leetcode_id: "", class: "" });
    } catch (err: any) {
      toast.error("Failed to add user: " + err.message);
    }
  };

  // Bulk upload
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
      }));
    } catch {
      toast.error("Invalid JSON file");
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

  // Delete user
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-1/2">
          <Button
            onClick={refreshAllUsers}
            disabled={loadingAll}
            className="w-full"
          >
            Refresh All Users
          </Button>
          {loadingAll && <Progress value={progress} className="mt-2" />}
        </div>

        <Button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/admin");
          }}
          variant="destructive"
        >
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add User / Bulk Upload</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            placeholder="Roll No"
            value={form.roll_num}
            onChange={(e) => setForm({ ...form, roll_num: e.target.value })}
          />
          <Input
            placeholder="LeetCode ID"
            value={form.leetcode_id}
            onChange={(e) => setForm({ ...form, leetcode_id: e.target.value })}
          />
          <Input
            placeholder="Class"
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value })}
          />
          <Button onClick={addUser}>Add</Button>
          <input type="file" accept=".json" onChange={bulkUpload} />
          {progress > 0 && (
            <Progress value={progress} className="w-full mt-2" />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => (
          <Card key={u.id}>
            <CardHeader>
              <CardTitle>
                {u.username} ({u.roll_num})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>LeetCode ID: {u.leetcode_id}</p>
              <p>Class: {u.class}</p>
              <div className="flex gap-3 mt-3">
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(u.id, u.leetcode_id)}
                >
                  Delete
                </Button>
                <Button
                  onClick={() => refreshUser(u)}
                  disabled={loadingSingleId === u.id}
                >
                  {loadingSingleId === u.id ? "Refreshing..." : "Refresh Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
