'use client';

import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: number;
  user_id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

const supabase = createClient();

interface UsersTableProps {
  usersData: User[];
}

export default function UsersTable({ usersData }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(usersData);
  const [sortColumn, setSortColumn] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'user_id'>>({
    name: '',
    email: '',
    department: '',
    role: '',
  });

  const handleSort = (column: keyof User) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id: string) => {
    await supabase.from('roles').delete().eq('user_id', id);
    await supabase.auth.admin.deleteUser(id);
    setUsers(users.filter((user) => user.user_id !== id));
  };

  const handleEdit = (id: number) => {
    const user = users.find((user) => user.id === id);
    if (user) {
      setEditingUser(user);
      setIsDialogOpen(true);
    }
  };

  async function addNewUser(newUser: Omit<User, 'id' | 'user_id'>) {
    const {
      data: { user },
    } = await supabase.auth.admin.createUser({
      email: newUser.email,
      password: newUser.email,
      email_confirm: true,
    });

    if (user) {
      await supabase.from('roles').insert({
        user_id: user.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
      });
    }
  }

  const handleSaveUser = async () => {
    if (editingUser) {
      // Update the user in the Supabase 'roles' table
      await supabase
        .from('roles')
        .update({
          name: editingUser.name,
          email: editingUser.email,
          department: editingUser.department,
          role: editingUser.role,
        })
        .eq('user_id', editingUser.user_id);

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? editingUser : user,
        ),
      );
      setIsDialogOpen(false);
      setEditingUser(null);
    } else {
      const id = Math.max(...users.map((u) => u.id), 0) + 1;
      const userWithId = { ...newUser, id, user_id: '' }; // Assuming 'user_id' will be generated by Supabase
      setUsers([...users, userWithId]);
      await addNewUser(newUser);
      setNewUser({ name: '', email: '', department: '', role: '' });
      setIsDialogOpen(false);
    }
  };

  const handleChange = (key: keyof User, value: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [key]: value });
    } else {
      setNewUser({ ...newUser, [key]: value });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingUser ? editingUser.name : newUser.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Input
                  id="department"
                  value={
                    editingUser ? editingUser.department : newUser.department
                  }
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">
                  Group
                </Label>
                <Input
                  id="group"
                  value={editingUser ? editingUser.role : newUser.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <Button onClick={handleSaveUser}>
                {editingUser ? 'Save Changes' : 'Add User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {['name', 'email', 'department', 'group'].map((column) => (
              <TableHead
                key={column}
                className="cursor-pointer"
                onClick={() => handleSort(column as keyof User)}
              >
                <div className="flex items-center">
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                  {sortColumn === column &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp className="ml-2 size-4" />
                    ) : (
                      <ChevronDown className="ml-2 size-4" />
                    ))}
                </div>
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(user.id)}
                  >
                    <Pencil className="size-4" />
                    <span className="sr-only">Edit user</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete user</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
