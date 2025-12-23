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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import { LeavePolicy, LeaveType, LEAVE_TYPE_LABELS } from '@/types/leave';

const LeavePolicyManagement: React.FC = () => {
  const { user } = useAuth();
  const { policies, updatePolicy, addPolicy, deletePolicy } = useHR();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leaveType: 'casual' as LeaveType,
    name: '',
    annualQuota: 0,
    carryForward: false,
    maxCarryForward: 0,
    description: '',
  });

  // Restrict access to HR/Admin only
  if (!user || user.role !== 'hr_admin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied. Only HR Admins can manage policies.</p>
      </div>
    );
  }

  const handleOpenDialog = (policy?: LeavePolicy) => {
    if (policy) {
      setEditingId(policy.id);
      setFormData({
        leaveType: policy.leaveType,
        name: policy.name,
        annualQuota: policy.annualQuota,
        carryForward: policy.carryForward,
        maxCarryForward: policy.maxCarryForward,
        description: policy.description,
      });
    } else {
      setEditingId(null);
      setFormData({
        leaveType: 'casual',
        name: '',
        annualQuota: 0,
        carryForward: false,
        maxCarryForward: 0,
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (editingId) {
      updatePolicy(editingId, {
        name: formData.name,
        annualQuota: formData.annualQuota,
        carryForward: formData.carryForward,
        maxCarryForward: formData.maxCarryForward,
        description: formData.description,
      });
    } else {
      addPolicy({
        leaveType: formData.leaveType,
        name: formData.name,
        annualQuota: formData.annualQuota,
        carryForward: formData.carryForward,
        maxCarryForward: formData.maxCarryForward,
        description: formData.description,
      });
    }
    setOpenDialog(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      deletePolicy(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Leave Policies" description="Configure leave types and quotas" />
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {policies.map(policy => (
              <Card key={policy.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{policy.leaveType}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(policy)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(policy.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Quota</p>
                    <p className="text-2xl font-bold">{policy.annualQuota}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Carry Forward</p>
                      <Badge variant={policy.carryForward ? 'default' : 'secondary'}>
                        {policy.carryForward ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {policy.carryForward && (
                      <div>
                        <p className="text-muted-foreground">Max Carry Forward</p>
                        <p className="font-semibold">{policy.maxCarryForward}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{policy.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Policy' : 'Add New Policy'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update policy details.' : 'Create a new leave policy.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingId && (
              <div>
                <Label htmlFor="leaveType">Leave Type</Label>
                <select
                  id="leaveType"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={formData.leaveType}
                  onChange={e => setFormData(prev => ({ ...prev, leaveType: e.target.value as LeaveType }))}
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="wfh">Work From Home</option>
                  <option value="comp_off">Compensatory Off</option>
                </select>
              </div>
            )}
            <div>
              <Label htmlFor="name">Policy Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Casual Leave"
              />
            </div>
            <div>
              <Label htmlFor="annualQuota">Annual Quota (Days)</Label>
              <Input
                id="annualQuota"
                type="number"
                value={formData.annualQuota}
                onChange={e => setFormData(prev => ({ ...prev, annualQuota: parseInt(e.target.value) || 0 }))}
                placeholder="12"
                min="0"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="carryForward"
                checked={formData.carryForward}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, carryForward: checked as boolean }))}
              />
              <Label htmlFor="carryForward" className="cursor-pointer">
                Allow Carry Forward
              </Label>
            </div>
            {formData.carryForward && (
              <div>
                <Label htmlFor="maxCarryForward">Max Carry Forward (Days)</Label>
                <Input
                  id="maxCarryForward"
                  type="number"
                  value={formData.maxCarryForward}
                  onChange={e => setFormData(prev => ({ ...prev, maxCarryForward: parseInt(e.target.value) || 0 }))}
                  placeholder="6"
                  min="0"
                />
              </div>
            )}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Policy description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Update' : 'Add'} Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeavePolicyManagement;
