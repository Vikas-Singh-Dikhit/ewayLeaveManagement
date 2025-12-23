import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeaveType, LEAVE_TYPE_LABELS } from '@/types/leave';
import { toast } from 'sonner';
import { Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

const LeaveAdjustments: React.FC = () => {
  const { user } = useAuth();
  const { employees, adjustments, adjustLeaveBalance } = useHR();
  
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'casual' as LeaveType,
    adjustmentType: 'credit' as 'credit' | 'debit',
    days: 1,
    reason: '',
  });

  if (!user || user.role !== 'hr_admin') {
    return <div className="p-8 text-center text-muted-foreground">Access denied. HR Admin only.</div>;
  }

  const activeEmployees = employees.filter(e => e.status === 'active');
  const selectedEmployee = employees.find(e => e.id === formData.employeeId);

  const filteredAdjustments = adjustments.filter(adj =>
    adj.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjust = () => {
    if (!formData.employeeId || !formData.reason.trim()) {
      toast.error('Please select an employee and provide a reason');
      return;
    }

    if (formData.days <= 0) {
      toast.error('Days must be greater than 0');
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    adjustLeaveBalance(
      formData.employeeId,
      employee.name,
      formData.leaveType,
      formData.adjustmentType,
      formData.days,
      formData.reason,
      user.id,
      user.name
    );

    toast.success(
      `${formData.adjustmentType === 'credit' ? 'Credited' : 'Debited'} ${formData.days} ${LEAVE_TYPE_LABELS[formData.leaveType]} days for ${employee.name}`
    );
    
    setIsAdjustDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      leaveType: 'casual',
      adjustmentType: 'credit',
      days: 1,
      reason: '',
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leave Adjustments"
        description="Manually credit or debit employee leave balances"
        action={
          <Button onClick={() => { resetForm(); setIsAdjustDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Adjustment
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {adjustments.filter(a => a.adjustmentType === 'credit').reduce((sum, a) => sum + a.days, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Days Credited</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {adjustments.filter(a => a.adjustmentType === 'debit').reduce((sum, a) => sum + a.days, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Days Debited</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{adjustments.length}</p>
                <p className="text-sm text-muted-foreground">Total Adjustments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Adjustments History */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAdjustments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No adjustments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Balance Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Adjusted By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map(adj => (
                  <TableRow key={adj.id}>
                    <TableCell>{format(new Date(adj.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{adj.employeeName}</TableCell>
                    <TableCell>{LEAVE_TYPE_LABELS[adj.leaveType]}</TableCell>
                    <TableCell>
                      <Badge variant={adj.adjustmentType === 'credit' ? 'default' : 'destructive'}>
                        {adj.adjustmentType === 'credit' ? '+' : '-'}{adj.days} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {adj.previousBalance} → {adj.newBalance}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{adj.reason}</TableCell>
                    <TableCell>{adj.adjustedByName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Leave Adjustment</DialogTitle>
            <DialogDescription>Credit or debit leave days for an employee. A reason is mandatory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.department})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmployee && (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm font-medium">Current Balance:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedEmployee.leaveBalance).map(([type, bal]) => (
                    <Badge key={type} variant="outline">
                      {LEAVE_TYPE_LABELS[type as LeaveType]}: {bal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Select value={formData.leaveType} onValueChange={(v) => setFormData({ ...formData, leaveType: v as LeaveType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action *</Label>
                <Select value={formData.adjustmentType} onValueChange={(v) => setFormData({ ...formData, adjustmentType: v as 'credit' | 'debit' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (+)</SelectItem>
                    <SelectItem value="debit">Debit (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Days *</Label>
              <Input
                type="number"
                min={0.5}
                step={0.5}
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason * (Mandatory)</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Enter reason for this adjustment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjust}>
              {formData.adjustmentType === 'credit' ? 'Credit' : 'Debit'} Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveAdjustments;