import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Employee, UserRole, ROLE_LABELS, DEPARTMENT_LIST, LEAVE_TYPE_LABELS } from '@/types/leave';
import { toast } from 'sonner';
import { Plus, Edit, UserX, UserCheck, Search, History, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Employees: React.FC = () => {
  const { user } = useAuth();
  const { employees, addEmployee, updateEmployee, deactivateEmployee, activateEmployee, getEmployeeHistory, getEmployeeAdjustments } = useHR();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'activate'; employee: Employee } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as UserRole,
    department: '',
    teamId: '',
    joinDate: new Date().toISOString().split('T')[0],
    managerId: '',
    teamLeadId: '',
  });

  if (!user || user.role !== 'hr_admin') {
    return <div className="p-8 text-center text-muted-foreground">Access denied. HR Admin only.</div>;
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const managers = employees.filter(e => ['manager', 'director'].includes(e.role) && e.status === 'active');
  const teamLeads = employees.filter(e => e.role === 'team_lead' && e.status === 'active');

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    addEmployee({
      ...formData,
      status: 'active',
    });
    
    toast.success(`Employee ${formData.name} added successfully`);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return;

    updateEmployee(selectedEmployee.id, formData, user.id, user.name);
    toast.success(`Employee ${formData.name} updated successfully`);
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeactivate = () => {
    if (!confirmAction || confirmAction.type !== 'deactivate') return;
    deactivateEmployee(confirmAction.employee.id, user.id, user.name);
    toast.success(`${confirmAction.employee.name} has been deactivated`);
    setConfirmAction(null);
  };

  const handleActivate = () => {
    if (!confirmAction || confirmAction.type !== 'activate') return;
    activateEmployee(confirmAction.employee.id, user.id, user.name);
    toast.success(`${confirmAction.employee.name} has been activated`);
    setConfirmAction(null);
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      teamId: employee.teamId,
      joinDate: employee.joinDate,
      managerId: employee.managerId || '',
      teamLeadId: employee.teamLeadId || '',
    });
    setIsEditDialogOpen(true);
  };

  const openHistoryDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsHistoryDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: '',
      teamId: '',
      joinDate: new Date().toISOString().split('T')[0],
      managerId: '',
      teamLeadId: '',
    });
  };

  const history = selectedEmployee ? getEmployeeHistory(selectedEmployee.id) : [];
  const adjustmentHistory = selectedEmployee ? getEmployeeAdjustments(selectedEmployee.id) : [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Employee Management"
        description="Add, edit, and manage employee records and access"
        action={
          <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENT_LIST.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(employee => (
                <TableRow key={employee.id} className={employee.status === 'inactive' ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ROLE_LABELS[employee.role]}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(employee.joinDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openHistoryDialog(employee)}>
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {employee.status === 'active' ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setConfirmAction({ type: 'deactivate', employee })}
                        >
                          <UserX className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setConfirmAction({ type: 'activate', employee })}
                        >
                          <UserCheck className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Enter the employee details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_LIST.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Join Date</Label>
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Lead</Label>
                <Select value={formData.teamLeadId} onValueChange={(v) => setFormData({ ...formData, teamLeadId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {teamLeads.map(tl => (
                      <SelectItem key={tl.id} value={tl.id}>{tl.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Manager</Label>
                <Select value={formData.managerId} onValueChange={(v) => setFormData({ ...formData, managerId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {managers.map(mgr => (
                      <SelectItem key={mgr.id} value={mgr.id}>{mgr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_LIST.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Lead</Label>
                <Select value={formData.teamLeadId} onValueChange={(v) => setFormData({ ...formData, teamLeadId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {teamLeads.map(tl => (
                      <SelectItem key={tl.id} value={tl.id}>{tl.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Manager</Label>
                <Select value={formData.managerId} onValueChange={(v) => setFormData({ ...formData, managerId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {managers.map(mgr => (
                      <SelectItem key={mgr.id} value={mgr.id}>{mgr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>History: {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>View change history and leave adjustments</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="changes">
            <TabsList className="mb-4">
              <TabsTrigger value="changes">Role/Status Changes</TabsTrigger>
              <TabsTrigger value="adjustments">Leave Adjustments</TabsTrigger>
              <TabsTrigger value="balance">Current Balance</TabsTrigger>
            </TabsList>
            <TabsContent value="changes">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No change history found</p>
              ) : (
                <div className="space-y-3">
                  {history.map(h => (
                    <div key={h.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{h.changeType} Change</p>
                        <p className="text-sm text-muted-foreground">
                          {h.oldValue || '(none)'} → {h.newValue}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {h.changedByName} • {format(new Date(h.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="adjustments">
              {adjustmentHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No adjustments found</p>
              ) : (
                <div className="space-y-3">
                  {adjustmentHistory.map(adj => (
                    <div key={adj.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge variant={adj.adjustmentType === 'credit' ? 'default' : 'destructive'}>
                        {adj.adjustmentType === 'credit' ? '+' : '-'}{adj.days}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{LEAVE_TYPE_LABELS[adj.leaveType]}</p>
                        <p className="text-sm text-muted-foreground">
                          Balance: {adj.previousBalance} → {adj.newBalance}
                        </p>
                        <p className="text-sm text-muted-foreground">{adj.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {adj.adjustedByName} • {format(new Date(adj.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="balance">
              {selectedEmployee && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(selectedEmployee.leaveBalance).map(([type, balance]) => (
                    <div key={type} className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{balance}</p>
                      <p className="text-sm text-muted-foreground">{LEAVE_TYPE_LABELS[type as keyof typeof LEAVE_TYPE_LABELS]}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate/Activate Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'deactivate' ? 'Deactivate Employee?' : 'Activate Employee?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'deactivate'
                ? `${confirmAction.employee.name} will lose system access immediately. This action can be reversed.`
                : `${confirmAction?.employee.name} will regain system access.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction?.type === 'deactivate' ? handleDeactivate : handleActivate}
              className={confirmAction?.type === 'deactivate' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmAction?.type === 'deactivate' ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;