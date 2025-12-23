import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Edit2, Lock, Unlock, History } from 'lucide-react';
import { UserRole, ROLE_LABELS, Employee } from '@/types/leave';

const EmployeeManagement: React.FC = () => {
  const { user } = useAuth();
  const { employees, addEmployee, updateEmployee, deactivateEmployee, activateEmployee, getEmployeeHistory } = useHR();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as UserRole,
    department: '',
    teamId: '',
    joinDate: '',
  });

  // Restrict access to HR/Admin only
  if (!user || user.role !== 'hr_admin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied. Only HR Admins can manage employees.</p>
      </div>
    );
  }

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        teamId: employee.teamId,
        joinDate: employee.joinDate,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        department: '',
        teamId: '',
        joinDate: new Date().toISOString().split('T')[0],
      });
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateEmployee(editingId, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        teamId: formData.teamId,
        joinDate: formData.joinDate,
      });
    } else {
      addEmployee({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        teamId: formData.teamId,
        joinDate: formData.joinDate,
        status: 'active',
        leaveBalance: { casual: 12, sick: 12, earned: 21, wfh: 24, comp_off: 0 },
      });
    }
    setOpenDialog(false);
  };

  const handleDeactivate = () => {
    if (deactivatingId) {
      deactivateEmployee(deactivatingId, deactivateReason);
      setDeactivatingId(null);
      setDeactivateReason('');
    }
  };

  const handleActivate = (employeeId: string) => {
    activateEmployee(employeeId);
  };

  const history = historyId ? getEmployeeHistory(historyId) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Employee Management" description="Add, edit, and manage employees" />
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABELS[emp.role]}</Badge>
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.joinDate}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(emp)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHistoryId(emp.id)}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      {emp.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeactivatingId(emp.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(emp.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Unlock className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update employee information and role.' : 'Add a new employee to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@company.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={role => setFormData(prev => ({ ...prev, role: role as UserRole }))}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <Label htmlFor="teamId">Team ID</Label>
              <Input
                id="teamId"
                value={formData.teamId}
                onChange={e => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                placeholder="e.g., team-1"
              />
            </div>
            <div>
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={e => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Update' : 'Add'} Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={!!deactivatingId} onOpenChange={() => setDeactivatingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
            <AlertDialogDescription>
              This action will deactivate the employee and revoke system access. They will not be able to log in or perform any actions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for Deactivation</Label>
            <Textarea
              id="reason"
              value={deactivateReason}
              onChange={e => setDeactivateReason(e.target.value)}
              placeholder="e.g., Left the company, Temporary leave"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} className="bg-red-600 hover:bg-red-700">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History Dialog */}
      <Dialog open={!!historyId} onOpenChange={() => setHistoryId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Employee Change History</DialogTitle>
            <DialogDescription>
              All role and status changes for this employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {history.length > 0 ? (
              history.map(entry => (
                <Card key={entry.id} className="bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Field Changed</p>
                        <p className="font-semibold capitalize">{entry.fieldChanged}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold">{entry.timestamp}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">From</p>
                        <p className="font-semibold">{entry.oldValue}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">To</p>
                        <p className="font-semibold">{entry.newValue}</p>
                      </div>
                      {entry.reason && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Reason</p>
                          <p className="font-semibold">{entry.reason}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Changed By</p>
                        <p className="font-semibold">{entry.changedByName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No history available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
