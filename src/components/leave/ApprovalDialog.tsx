import React, { useState } from 'react';
import { LeaveRequest, LEAVE_TYPE_LABELS, STATUS_LABELS } from '@/types/leave';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Calendar, Clock, FileText, User, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ApprovalDialogProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment: string) => void;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-pending/10 text-pending-foreground border-pending/30',
  approved: 'bg-approved/10 text-approved-foreground border-approved/30',
  rejected: 'bg-rejected/10 text-rejected-foreground border-rejected/30',
};

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
}) => {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!request) return null;

  const handleApprove = () => {
    onApprove(request.id, comment || undefined);
    setComment('');
    setAction(null);
    onOpenChange(false);
  };

  const handleReject = () => {
    if (!comment.trim()) return;
    onReject(request.id, comment);
    setComment('');
    setAction(null);
    onOpenChange(false);
  };

  const formatDateRange = () => {
    const start = format(new Date(request.startDate), 'EEEE, MMMM d, yyyy');
    const end = format(new Date(request.endDate), 'EEEE, MMMM d, yyyy');
    return start === end ? start : `${start} to ${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Leave Request Details
            <Badge variant="outline" className={cn("ml-2", statusStyles[request.status])}>
              {STATUS_LABELS[request.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and take action on this leave request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{request.employeeName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3" />
                {request.department}
              </p>
            </div>
          </div>

          {/* Leave Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Leave Type</span>
              <Badge variant="secondary">{LEAVE_TYPE_LABELS[request.leaveType]}</Badge>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date Range</p>
                <p className="text-sm text-muted-foreground">{formatDateRange()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm">
                <span className="font-medium">{request.daysCount}</span> {request.daysCount === 1 ? 'day' : 'days'} 
                ({request.dayType === 'full' ? 'Full Day' : request.dayType === 'first_half' ? 'First Half' : 'Second Half'})
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm text-muted-foreground">{request.reason}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Approval History */}
          {request.approvals.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">Approval History</p>
              <div className="space-y-2">
                {request.approvals.map((approval, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    {approval.status === 'approved' ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : approval.status === 'rejected' ? (
                      <XCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                    <span className="capitalize">{approval.stage.replace('_', ' ')}</span>
                    {approval.approverName && (
                      <span className="text-muted-foreground">by {approval.approverName}</span>
                    )}
                    {approval.timestamp && (
                      <span className="text-muted-foreground ml-auto">
                        {format(new Date(approval.timestamp), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Section */}
          <div className="space-y-3">
            <Label>Comments {action === 'reject' && <span className="text-destructive">*</span>}</Label>
            <Textarea
              placeholder={action === 'reject' ? 'Please provide a reason for rejection...' : 'Add a comment (optional)...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (action === 'reject' && comment.trim()) {
                handleReject();
              } else {
                setAction('reject');
              }
            }}
            disabled={action === 'reject' && !comment.trim()}
          >
            {action === 'reject' ? 'Confirm Reject' : 'Reject'}
          </Button>
          <Button onClick={handleApprove}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
