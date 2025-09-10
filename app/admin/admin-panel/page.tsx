"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const router = useRouter();

  // ✅ Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/admin/login");
    });
  }, [router]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      toast.error("Failed to fetch users");
    } else {
      setUsers(data || []);
    }
  };

  // ✅ Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
    } else {
      toast.success("Logged out successfully!");
      router.push("/admin");
    }
  };

  // ✅ Call refresh API to fetch LeetCode stats & update DB
  const refreshUser = async (leetcode_id: string) => {
    try {
      const res = await fetch(`/api/refreshUser/${leetcode_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refresh");
      toast.success(`Synced stats for ${leetcode_id}`);
    } catch (err: any) {
      toast.error("Refresh failed: " + err.message);
    }
  };

  // ✅ Insert user + refresh
  const addUser = async () => {
    if (!form.username || !form.leetcode_id) {
      toast.error("Username and LeetCode ID required");
      return;
    }

    const { error } = await supabase.from("users").insert([form]);
    if (error) {
      toast.error("Failed to add user: " + error.message);
    } else {
      toast.success("User added successfully!");
      await refreshUser(form.leetcode_id); // 🔥 auto refresh stats
      setForm({ username: "", roll_num: "", leetcode_id: "", class: "" });
      fetchUsers();
    }
  };

  // ✅ Bulk upload + refresh
  const bulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const text = await file.text();
    // map JSON to correct keys if necessary
    const records: User[] = JSON.parse(text).map((r: any) => ({
      username: r.username || r.name,
      roll_num: r.roll_num || r.rollnum,
      leetcode_id: r.leetcode_id,
      class: r.class,
    }));

    const { error } = await supabase.from("users").insert(records);
    if (error) {
      toast.error("Bulk upload failed: " + error.message);
    } else {
      toast.success("Bulk upload complete!");
      for (const rec of records) {
        if (rec.leetcode_id) await refreshUser(rec.leetcode_id);
      }
      fetchUsers();
    }
  };

  const deleteUser = async (id: number, leetcode_id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete user: " + error.message);
    } else {
      toast.success(`User ${leetcode_id} deleted`);
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Logout Button */}
      <div className="flex justify-end">
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add User</CardTitle>
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
                <Button onClick={() => refreshUser(u.leetcode_id)}>
                  Refresh Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
