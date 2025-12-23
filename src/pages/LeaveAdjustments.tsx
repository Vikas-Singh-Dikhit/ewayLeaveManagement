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
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, AlertCircle } from 'lucide-react';
import { LeaveType, LEAVE_TYPE_LABELS } from '@/types/leave';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LeaveAdjustments: React.FC = () => {
  const { user } = useAuth();
  const { employees, adjustments, adjustLeaveBalance, getAdjustmentsByEmployee } = useHR();
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'casual' as LeaveType,
    days: 0,
    reason: '',
  });

  // Restrict access to HR/Admin only
  if (!user || user.role !== 'hr_admin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied. Only HR Admins can adjust leave balances.</p>
      </div>
    );
  }

  const handleOpenDialog = () => {
    setFormData({
      employeeId: '',
      leaveType: 'casual',
      days: 0,
      reason: '',
    });
    setOpenDialog(true);
  };

  const handleAdjust = () => {
    if (!formData.employeeId || !formData.reason.trim()) {
      alert('Please select employee and provide reason');
      return;
    }

    adjustLeaveBalance(
      formData.employeeId,
      formData.leaveType,
      formData.days,
      formData.reason,
      user.id,
      user.name
    );
    setOpenDialog(false);
  };

  const selectedEmployee = employees.find(e => e.id === formData.employeeId);
  const selectedLeaveBalance = selectedEmployee?.leaveBalance[formData.leaveType] || 0;
  const newBalance = selectedLeaveBalance + formData.days;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Leave Adjustments" description="Credit or debit leave balance (HR Only)" />
        <Button onClick={handleOpenDialog} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Adjust Balance
        </Button>
      </div>

      <Alert className="bg-orange-50 border-orange-200">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          All adjustments are logged in the audit trail and require a mandatory reason.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Recent Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Old Balance</TableHead>
                  <TableHead>New Balance</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Adjusted By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.length > 0 ? (
                  adjustments.map(adj => (
                    <TableRow key={adj.id}>
                      <TableCell className="font-medium">{adj.employeeName}</TableCell>
                      <TableCell>{LEAVE_TYPE_LABELS[adj.leaveType]}</TableCell>
                      <TableCell>
                        <Badge variant={adj.days > 0 ? 'default' : 'destructive'}>
                          {adj.days > 0 ? '+' : ''}{adj.days}
                        </Badge>
                      </TableCell>
                      <TableCell>{adj.oldBalance}</TableCell>
                      <TableCell className="font-semibold">{adj.newBalance}</TableCell>
                      <TableCell className="max-w-xs truncate">{adj.reason}</TableCell>
                      <TableCell>{adj.adjustedByName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{adj.timestamp.split('T')[0]}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No adjustments yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjust Leave Balance</DialogTitle>
            <DialogDescription>
              Credit or debit leave balance for an employee. Positive values add leave, negative values deduct.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Select value={formData.employeeId} onValueChange={employeeId => setFormData(prev => ({ ...prev, employeeId }))}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select value={formData.leaveType} onValueChange={leaveType => setFormData(prev => ({ ...prev, leaveType: leaveType as LeaveType }))}>
                <SelectTrigger id="leaveType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">{LEAVE_TYPE_LABELS.casual}</SelectItem>
                  <SelectItem value="sick">{LEAVE_TYPE_LABELS.sick}</SelectItem>
                  <SelectItem value="earned">{LEAVE_TYPE_LABELS.earned}</SelectItem>
                  <SelectItem value="wfh">{LEAVE_TYPE_LABELS.wfh}</SelectItem>
                  <SelectItem value="comp_off">{LEAVE_TYPE_LABELS.comp_off}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedEmployee && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">{selectedLeaveBalance}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">New Balance</p>
                    <p className={`text-2xl font-bold ${newBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {newBalance}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="days">Days to Adjust</Label>
              <Input
                id="days"
                type="number"
                value={formData.days}
                onChange={e => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 2 (credit) or -1 (debit)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use positive numbers to add days, negative to deduct
              </p>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Mandatory)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Bonus for excellent performance, Correction for double counting"
                className="min-h-20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be logged in the audit trail
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} className="bg-red-600 hover:bg-red-700">
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveAdjustments;
