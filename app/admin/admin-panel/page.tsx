"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { refreshUser as refreshUserLib, User as RefreshUserType } from "@/lib/refreshUser";
import { resolveUserBatch, resolveUserGroup } from "@/lib/academics/resolve";
import { AcademicClass, User } from "@/app/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Loader2, LogOut, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";

type ClassRecord = {
  id: string;
  code: string;
  display_name: string;
  is_active: boolean;
  display_order: number;
};

type GroupRecord = {
  id: string;
  batch_id: string;
  name: string;
  is_active: boolean;
  display_order: number;
};

type UserForm = {
  username: string;
  roll_num: string;
  leetcode_id: string;
  class: string;
  batch_code: string;
  batch_display_name: string;
  group_name: string;
};

type AssignmentDraft = {
  batchCode: string;
  groupName: string;
  batchId?: string;
  groupId?: string;
};

const initialUserForm: UserForm = {
  username: "",
  roll_num: "",
  leetcode_id: "",
  class: "",
  batch_code: "",
  batch_display_name: "",
  group_name: "",
};

export default function AdminPanel() {
  const router = useRouter();

  const [sessionToken, setSessionToken] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [groups, setGroups] = useState<GroupRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState<number | null>(null);
  const [loadingSingleId, setLoadingSingleId] = useState<number | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [progress, setProgress] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [groupFilter, setGroupFilter] = useState("ALL");

  const [userForm, setUserForm] = useState<UserForm>(initialUserForm);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<number, AssignmentDraft>>({});

  const [newClass, setNewClass] = useState({ code: "", display_name: "", display_order: 1 });
  const [newGroup, setNewGroup] = useState({ batch_id: "", name: "", display_order: 1 });

  const adminFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
          ...(init?.headers || {}),
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Request failed");
      }
      return json;
    },
    [sessionToken]
  );

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase.from("users").select("*").order("roll_num", { ascending: true });
    if (error) {
      throw error;
    }
    setUsers((data || []) as User[]);
  }, []);

  const loadStructure = useCallback(async () => {
    try {
      const [classPayload, groupPayload] = await Promise.all([
        adminFetch("/api/admin/classes"),
        adminFetch("/api/admin/groups"),
      ]);
      setClasses(classPayload.classes || []);
      setGroups(groupPayload.groups || []);
    } catch (error) {
      const structureRes = await fetch("/api/academics/structure");
      const structureJson = await structureRes.json();
      const fallbackClasses: AcademicClass[] = structureJson.classes || [];
      setClasses(
        fallbackClasses.map((item) => ({
          id: item.id,
          code: item.code,
          display_name: item.displayName,
          is_active: item.isActive,
          display_order: item.displayOrder,
        }))
      );
      setGroups(
        fallbackClasses.flatMap((item) =>
          item.groups.map((group) => ({
            id: group.id,
            batch_id: item.id,
            name: group.name,
            is_active: group.isActive,
            display_order: group.displayOrder,
          }))
        )
      );
      console.warn("Admin structure tables unavailable, fallback mode enabled", error);
    }
  }, [adminFetch]);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/admin");
          return;
        }

        setSessionToken(session.access_token);
      } catch {
        router.push("/admin");
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    if (!sessionToken) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        await Promise.all([loadUsers(), loadStructure()]);
      } catch (error: any) {
        toast.error(error.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [sessionToken, loadUsers, loadStructure]);

  const activeClasses = useMemo(() => classes.filter((item) => item.is_active), [classes]);

  const groupedGroups = useMemo(() => {
    const map = new Map<string, GroupRecord[]>();
    for (const group of groups) {
      if (!map.has(group.batch_id)) map.set(group.batch_id, []);
      map.get(group.batch_id)!.push(group);
    }
    for (const [key, value] of map.entries()) {
      map.set(
        key,
        value.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name))
      );
    }
    return map;
  }, [groups]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const batch = (resolveUserBatch(user) || "").toUpperCase();
      const group = (resolveUserGroup(user) || "").toUpperCase();
      const query = searchText.trim().toLowerCase();

      const batchOk = batchFilter === "ALL" || batch === batchFilter.toUpperCase();
      const groupOk = groupFilter === "ALL" || group === groupFilter.toUpperCase();
      const queryOk =
        !query ||
        `${user.username || ""} ${user.roll_num || ""} ${user.leetcode_id || ""}`.toLowerCase().includes(query);

      return batchOk && groupOk && queryOk;
    });
  }, [users, searchText, batchFilter, groupFilter]);

  const dashboardStats = useMemo(() => {
    const totalProblems = users.reduce((sum, user) => sum + (user.totalsolved || 0), 0);
    const weeklyProblems = users.reduce((sum, user) => sum + (user.weekly_solved || 0), 0);

    return {
      totalClasses: activeClasses.length,
      totalGroups: groups.filter((group) => group.is_active).length,
      totalStudents: users.length,
      totalProblems,
      weeklyProblems,
    };
  }, [activeClasses.length, groups, users]);

  const resetUserForm = () => setUserForm(initialUserForm);

  const refreshSingleUser = async (user: User) => {
    setLoadingSingleId(user.id);
    try {
      await refreshUserLib(user as RefreshUserType);
      await loadUsers();
      toast.success(`Refreshed ${user.username}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to refresh user");
    } finally {
      setLoadingSingleId(null);
    }
  };

  const refreshAllUsers = async () => {
    setLoadingAll(true);
    setProgress(0);
    try {
      for (let i = 0; i < filteredUsers.length; i++) {
        await refreshSingleUser(filteredUsers[i]);
        setProgress(Math.round(((i + 1) / Math.max(filteredUsers.length, 1)) * 100));
      }
      toast.success("All visible students refreshed");
    } finally {
      setLoadingAll(false);
    }
  };

  const addStudent = async () => {
    if (!userForm.username.trim() || !userForm.leetcode_id.trim() || !userForm.roll_num.trim()) {
      toast.error("Username, roll number and LeetCode ID are required");
      return;
    }

    const payload = {
      ...userForm,
      class: userForm.group_name || userForm.class || null,
      totalsolved: 0,
      weekly_solved: 0,
    };

    const { error } = await supabase.from("users").insert([payload]);
    if (error) {
      toast.error(`Failed to add student: ${error.message}`);
      return;
    }

    await loadUsers();
    resetUserForm();
    toast.success("Student added");
  };

  const deleteStudent = async (id: number) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      toast.error(`Failed to delete student: ${error.message}`);
      return;
    }
    await loadUsers();
    toast.success("Student deleted");
  };

  const bulkUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      const text = await e.target.files[0].text();
      const rows = JSON.parse(text);
      if (!Array.isArray(rows)) throw new Error("JSON must be an array of students");

      const payload = rows.map((row: any) => ({
        username: row.username || row.name || "",
        roll_num: row.roll_num || row.rollnum || "",
        leetcode_id: row.leetcode_id || "",
        class: row.group_name || row.class || null,
        group_name: row.group_name || row.class || null,
        batch_code: row.batch_code || null,
        batch_display_name: row.batch_display_name || row.batch_code || null,
        totalsolved: row.totalsolved || 0,
        weekly_solved: row.weekly_solved || 0,
      }));

      const { error } = await supabase.from("users").insert(payload);
      if (error) throw error;

      await loadUsers();
      toast.success(`Imported ${payload.length} students`);
    } catch (error: any) {
      toast.error(error.message || "Invalid JSON file");
    }
  };

  const createClass = async () => {
    if (!newClass.code.trim() || !newClass.display_name.trim()) {
      toast.error("Class code and display name are required");
      return;
    }

    try {
      await adminFetch("/api/admin/classes", {
        method: "POST",
        body: JSON.stringify({
          code: newClass.code.trim().toUpperCase(),
          display_name: newClass.display_name.trim(),
          display_order: newClass.display_order,
          is_active: true,
        }),
      });
      await loadStructure();
      setNewClass({ code: "", display_name: "", display_order: 1 });
      toast.success("Class created");
    } catch (error: any) {
      toast.error(error.message || "Failed to create class");
    }
  };

  const updateClass = async (item: ClassRecord) => {
    try {
      await adminFetch(`/api/admin/classes/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(item),
      });
      toast.success("Class updated");
      await loadStructure();
    } catch (error: any) {
      toast.error(error.message || "Failed to update class");
    }
  };

  const deactivateClass = async (id: string) => {
    try {
      await adminFetch(`/api/admin/classes/${id}`, { method: "DELETE" });
      toast.success("Class deactivated");
      await loadStructure();
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate class");
    }
  };

  const createGroup = async () => {
    if (!newGroup.batch_id || !newGroup.name.trim()) {
      toast.error("Class and group name are required");
      return;
    }

    try {
      await adminFetch("/api/admin/groups", {
        method: "POST",
        body: JSON.stringify({
          ...newGroup,
          name: newGroup.name.trim(),
          is_active: true,
        }),
      });
      await loadStructure();
      setNewGroup({ batch_id: "", name: "", display_order: 1 });
      toast.success("Group created");
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    }
  };

  const updateGroup = async (item: GroupRecord) => {
    try {
      await adminFetch(`/api/admin/groups/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(item),
      });
      toast.success("Group updated");
      await loadStructure();
    } catch (error: any) {
      toast.error(error.message || "Failed to update group");
    }
  };

  const deactivateGroup = async (id: string) => {
    try {
      await adminFetch(`/api/admin/groups/${id}`, { method: "DELETE" });
      toast.success("Group deactivated");
      await loadStructure();
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate group");
    }
  };

  const saveStudentAssignment = async (student: User) => {
    const draft = assignmentDrafts[student.id];
    if (!draft) return;

    setSavingStudentId(student.id);
    try {
      await adminFetch("/api/admin/students", {
        method: "PATCH",
        body: JSON.stringify({
          id: student.id,
          class: draft.groupName || null,
          group_name: draft.groupName || null,
          group_id: draft.groupId || null,
          batch_code: draft.batchCode || null,
          batch_display_name: draft.batchCode || null,
          batch_id: draft.batchId || null,
        }),
      });

      setAssignmentDrafts((prev) => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });

      await loadUsers();
      toast.success("Student assignment updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to save student assignment");
    } finally {
      setSavingStudentId(null);
    }
  };

  const setStudentBatch = (student: User, batchCode: string) => {
    const batch = classes.find((item) => item.code === batchCode);
    const batchGroups = groups.filter((group) => group.batch_id === batch?.id && group.is_active);

    setAssignmentDrafts((prev) => ({
      ...prev,
      [student.id]: {
        batchCode,
        batchId: batch?.id,
        groupName: batchGroups[0]?.name || "",
        groupId: batchGroups[0]?.id,
      },
    }));
  };

  const setStudentGroup = (student: User, groupName: string) => {
    const current = assignmentDrafts[student.id] || {
      batchCode: resolveUserBatch(student),
      groupName: resolveUserGroup(student),
    };

    const batch = classes.find((item) => item.code === current.batchCode || item.display_name === current.batchCode);
    const group = groups.find((item) => item.batch_id === batch?.id && item.name === groupName);

    setAssignmentDrafts((prev) => ({
      ...prev,
      [student.id]: {
        ...current,
        groupName,
        groupId: group?.id,
      },
    }));
  };

  const getStudentBatchCode = (student: User) => assignmentDrafts[student.id]?.batchCode || resolveUserBatch(student);
  const getStudentGroupName = (student: User) => assignmentDrafts[student.id]?.groupName || resolveUserGroup(student);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">PSGMX Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage classes, groups, students, and LeetCode progress safely.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/")}> 
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
            <Button variant="outline" onClick={refreshAllUsers} disabled={loadingAll}>
              {loadingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} 
              Refresh Visible Students
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {loadingAll && (
          <Card>
            <CardContent className="pt-6">
              <Progress value={progress} className="w-full" />
              <p className="mt-2 text-xs text-muted-foreground">Refreshing students: {progress}%</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2 h-auto bg-transparent p-0">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="classes">Classes / Batches</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="leetcode">LeetCode Problems</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Stat title="Total Classes" value={dashboardStats.totalClasses} />
              <Stat title="Total Groups" value={dashboardStats.totalGroups} />
              <Stat title="Total Students" value={dashboardStats.totalStudents} />
              <Stat title="Problems Solved" value={dashboardStats.totalProblems} />
              <Stat title="Weekly Solved" value={dashboardStats.weeklyProblems} />
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Class</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3">
                <Input
                  placeholder="Code (e.g. 28MX)"
                  value={newClass.code}
                  onChange={(e) => setNewClass((prev) => ({ ...prev, code: e.target.value }))}
                />
                <Input
                  placeholder="Display name"
                  value={newClass.display_name}
                  onChange={(e) => setNewClass((prev) => ({ ...prev, display_name: e.target.value }))}
                />
                <Input
                  type="number"
                  min={1}
                  placeholder="Display order"
                  value={newClass.display_order}
                  onChange={(e) => setNewClass((prev) => ({ ...prev, display_order: Number(e.target.value || 1) }))}
                />
                <Button onClick={createClass}><Plus className="mr-2 h-4 w-4" />Create</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input value={item.code} onChange={(e) => setClasses((prev) => prev.map((c) => c.id === item.id ? { ...c, code: e.target.value.toUpperCase() } : c))} />
                        </TableCell>
                        <TableCell>
                          <Input value={item.display_name} onChange={(e) => setClasses((prev) => prev.map((c) => c.id === item.id ? { ...c, display_name: e.target.value } : c))} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={1} value={item.display_order} onChange={(e) => setClasses((prev) => prev.map((c) => c.id === item.id ? { ...c, display_order: Number(e.target.value || 1) } : c))} />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.is_active ? "true" : "false"}
                            onValueChange={(value) => setClasses((prev) => prev.map((c) => c.id === item.id ? { ...c, is_active: value === "true" } : c))}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" onClick={() => updateClass(item)}><Save className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => deactivateClass(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Group</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3">
                <Select value={newGroup.batch_id} onValueChange={(value) => setNewGroup((prev) => ({ ...prev, batch_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClasses.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Group name (G3, Team A, Section B)"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="number"
                  min={1}
                  placeholder="Display order"
                  value={newGroup.display_order}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, display_order: Number(e.target.value || 1) }))}
                />
                <Button onClick={createGroup}><Plus className="mr-2 h-4 w-4" />Create</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((item) => {
                      const className = classes.find((c) => c.id === item.batch_id)?.display_name || "Unknown";
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{className}</TableCell>
                          <TableCell>
                            <Input value={item.name} onChange={(e) => setGroups((prev) => prev.map((g) => g.id === item.id ? { ...g, name: e.target.value } : g))} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" min={1} value={item.display_order} onChange={(e) => setGroups((prev) => prev.map((g) => g.id === item.id ? { ...g, display_order: Number(e.target.value || 1) } : g))} />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.is_active ? "true" : "false"}
                              onValueChange={(value) => setGroups((prev) => prev.map((g) => g.id === item.id ? { ...g, is_active: value === "true" } : g))}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" onClick={() => updateGroup(item)}><Save className="h-4 w-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => deactivateGroup(item.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Student</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input id="new-username" value={userForm.username} onChange={(e) => setUserForm((prev) => ({ ...prev, username: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-roll">Roll Number</Label>
                  <Input id="new-roll" value={userForm.roll_num} onChange={(e) => setUserForm((prev) => ({ ...prev, roll_num: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-lc">LeetCode ID</Label>
                  <Input id="new-lc" value={userForm.leetcode_id} onChange={(e) => setUserForm((prev) => ({ ...prev, leetcode_id: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={userForm.batch_code || ""}
                    onValueChange={(value) => {
                      const cls = classes.find((item) => item.code === value);
                      setUserForm((prev) => ({
                        ...prev,
                        batch_code: value,
                        batch_display_name: value,
                        group_name: groupedGroups.get(cls?.id || "")?.[0]?.name || "",
                        class: groupedGroups.get(cls?.id || "")?.[0]?.name || "",
                      }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {activeClasses.map((item) => <SelectItem key={item.id} value={item.code}>{item.display_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Group</Label>
                  <Select
                    value={userForm.group_name || ""}
                    onValueChange={(value) => setUserForm((prev) => ({ ...prev, group_name: value, class: value }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                    <SelectContent>
                      {(groupedGroups.get(classes.find((item) => item.code === userForm.batch_code)?.id || "") || [])
                        .filter((item) => item.is_active)
                        .map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 flex items-end gap-2">
                  <Button onClick={addStudent}><Plus className="mr-2 h-4 w-4" />Add Student</Button>
                  <Button asChild variant="outline">
                    <label htmlFor="bulk-upload-json" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />Bulk Upload
                      <input id="bulk-upload-json" type="file" accept=".json" className="hidden" onChange={bulkUpload} />
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search and Filter Students</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3">
                <Input placeholder="Search username, roll, LeetCode ID" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <Select value={batchFilter} onValueChange={(value) => { setBatchFilter(value); setGroupFilter("ALL"); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Classes</SelectItem>
                    {activeClasses.map((item) => <SelectItem key={item.id} value={item.code}>{item.display_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Groups</SelectItem>
                    {(batchFilter === "ALL"
                      ? groups.filter((item) => item.is_active)
                      : groups.filter((item) => item.is_active && item.batch_id === classes.find((c) => c.code === batchFilter)?.id)
                    ).map((item) => (
                      <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>LeetCode ID</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((student) => {
                      const batchCode = getStudentBatchCode(student);
                      const currentClass = classes.find((item) => item.code === batchCode || item.display_name === batchCode);
                      const currentGroups = groupedGroups.get(currentClass?.id || "") || [];

                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.username}</TableCell>
                          <TableCell>{student.roll_num}</TableCell>
                          <TableCell>{student.leetcode_id}</TableCell>
                          <TableCell>
                            <Select value={batchCode || ""} onValueChange={(value) => setStudentBatch(student, value)}>
                              <SelectTrigger><SelectValue placeholder="Assign class" /></SelectTrigger>
                              <SelectContent>
                                {activeClasses.map((item) => (
                                  <SelectItem key={item.id} value={item.code}>{item.display_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={getStudentGroupName(student) || ""} onValueChange={(value) => setStudentGroup(student, value)}>
                              <SelectTrigger><SelectValue placeholder="Assign group" /></SelectTrigger>
                              <SelectContent>
                                {currentGroups.filter((item) => item.is_active).map((item) => (
                                  <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => refreshSingleUser(student)} disabled={loadingSingleId === student.id}>
                              {loadingSingleId === student.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" onClick={() => saveStudentAssignment(student)} disabled={!assignmentDrafts[student.id] || savingStudentId === student.id}>
                              {savingStudentId === student.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteStudent(student.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leetcode">
            <Card>
              <CardHeader>
                <CardTitle>LeetCode Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  LeetCode requests now run through a dedicated service layer with timeout, retries, parsing, and calendar-permission fallback.
                  Use Refresh in the Students tab to sync latest profiles.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Total classes: {dashboardStats.totalClasses}</p>
                <p>Total groups: {dashboardStats.totalGroups}</p>
                <p>Total students: {dashboardStats.totalStudents}</p>
                <p>Total problems solved: {dashboardStats.totalProblems}</p>
                <p>Weekly solved: {dashboardStats.weeklyProblems}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure environment variables for Supabase and LeetCode integrations in deployment settings.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
