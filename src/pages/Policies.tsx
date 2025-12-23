import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { LeavePolicy, LEAVE_TYPE_LABELS } from '@/types/leave';
import { toast } from 'sonner';
import { Edit, Calendar, RefreshCw, ArrowRight } from 'lucide-react';

const Policies: React.FC = () => {
  const { user } = useAuth();
  const { policies, updatePolicy } = useHR();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [formData, setFormData] = useState({
    annualQuota: 0,
    carryForward: false,
    maxCarryForward: 0,
    description: '',
    allowNegative: false,
    maxNegative: 0,
  });

  if (!user || user.role !== 'hr_admin') {
    return <div className="p-8 text-center text-muted-foreground">Access denied. HR Admin only.</div>;
  }

  const openEditDialog = (policy: LeavePolicy) => {
    setSelectedPolicy(policy);
    setFormData({
      annualQuota: policy.annualQuota,
      carryForward: policy.carryForward,
      maxCarryForward: policy.maxCarryForward,
      description: policy.description,
      allowNegative: false,
      maxNegative: 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleSavePolicy = () => {
    if (!selectedPolicy) return;

    updatePolicy(selectedPolicy.id, {
      annualQuota: formData.annualQuota,
      carryForward: formData.carryForward,
      maxCarryForward: formData.carryForward ? formData.maxCarryForward : 0,
      description: formData.description,
    }, user.id, user.name);

    toast.success(`${selectedPolicy.name} policy updated successfully`);
    setIsEditDialogOpen(false);
    setSelectedPolicy(null);
  };

  const getLeaveTypeIcon = (leaveType: string) => {
    const icons: Record<string, string> = {
      casual: '🏖️',
      sick: '🏥',
      earned: '⭐',
      wfh: '🏠',
      comp_off: '🎁',
    };
    return icons[leaveType] || '📋';
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leave Policies"
        description="Configure leave types, quotas, and carry forward rules"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {policies.map(policy => (
          <Card key={policy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getLeaveTypeIcon(policy.leaveType)}</span>
                  <div>
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <CardDescription>{LEAVE_TYPE_LABELS[policy.leaveType]}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(policy)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Annual Quota</span>
                </div>
                <span className="font-bold text-lg">{policy.annualQuota} days</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Carry Forward</span>
                </div>
                <div className="text-right">
                  {policy.carryForward ? (
                    <span className="font-medium text-green-600">Up to {policy.maxCarryForward} days</span>
                  ) : (
                    <span className="text-muted-foreground">Not allowed</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{policy.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Policy Reset Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Quota Reset Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Calendar Year Reset</p>
              <p className="text-sm text-muted-foreground">Leave quotas reset on January 1st each year</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-right">
              <p className="font-medium">Next Reset</p>
              <p className="text-sm text-primary">January 1, 2025</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            * Policy changes apply only to future leave requests. Existing approved leaves are not affected.
          </p>
        </CardContent>
      </Card>

      {/* Edit Policy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {selectedPolicy?.name}</DialogTitle>
            <DialogDescription>Update policy settings. Changes apply to future requests only.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Annual Quota (days)</Label>
              <Input
                type="number"
                min={0}
                max={365}
                value={formData.annualQuota}
                onChange={(e) => setFormData({ ...formData, annualQuota: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Allow Carry Forward</Label>
                <p className="text-sm text-muted-foreground">Unused days roll over to next year</p>
              </div>
              <Switch
                checked={formData.carryForward}
                onCheckedChange={(checked) => setFormData({ ...formData, carryForward: checked })}
              />
            </div>

            {formData.carryForward && (
              <div className="space-y-2">
                <Label>Maximum Carry Forward (days)</Label>
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={formData.maxCarryForward}
                  onChange={(e) => setFormData({ ...formData, maxCarryForward: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Allow Negative Balance</Label>
                <p className="text-sm text-muted-foreground">Employees can go into negative balance</p>
              </div>
              <Switch
                checked={formData.allowNegative}
                onCheckedChange={(checked) => setFormData({ ...formData, allowNegative: checked })}
              />
            </div>

            {formData.allowNegative && (
              <div className="space-y-2">
                <Label>Maximum Negative Days</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={formData.maxNegative}
                  onChange={(e) => setFormData({ ...formData, maxNegative: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePolicy}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Policies;