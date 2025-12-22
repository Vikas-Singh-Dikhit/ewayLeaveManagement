import React from 'react';
import { LeaveRequest, LEAVE_TYPE_LABELS, STATUS_LABELS } from '@/types/leave';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, Clock, FileText, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequestCardProps {
  request: LeaveRequest;
  showEmployee?: boolean;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onView?: () => void;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-pending/10 text-pending-foreground border-pending/30',
  approved: 'bg-approved/10 text-approved-foreground border-approved/30',
  rejected: 'bg-rejected/10 text-rejected-foreground border-rejected/30',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

export const LeaveRequestCard: React.FC<LeaveRequestCardProps> = ({
  request,
  showEmployee = false,
  showActions = false,
  onApprove,
  onReject,
  onCancel,
  onView,
}) => {
  const formatDateRange = () => {
    const start = format(new Date(request.startDate), 'MMM d, yyyy');
    const end = format(new Date(request.endDate), 'MMM d, yyyy');
    return start === end ? start : `${start} - ${end}`;
  };

  const getDayTypeLabel = () => {
    switch (request.dayType) {
      case 'first_half': return 'First Half';
      case 'second_half': return 'Second Half';
      default: return 'Full Day';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {showEmployee && (
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{request.employeeName}</span>
                <span className="text-sm text-muted-foreground">• {request.department}</span>
              </div>
            )}
            <CardTitle className="text-lg">
              {LEAVE_TYPE_LABELS[request.leaveType]}
            </CardTitle>
          </div>
          <Badge variant="outline" className={cn("font-medium", statusStyles[request.status])}>
            {STATUS_LABELS[request.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDateRange()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{request.daysCount} {request.daysCount === 1 ? 'day' : 'days'} ({getDayTypeLabel()})</span>
          </div>
        </div>

        {request.reason && (
          <div className="flex items-start gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-muted-foreground line-clamp-2">{request.reason}</p>
          </div>
        )}

        {/* Approval Progress */}
        {request.status === 'pending' && request.approvals.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Approval Progress</p>
            <div className="flex items-center gap-1">
              {['team_lead', 'manager', 'director'].map((stage, index) => {
                const approval = request.approvals.find(a => a.stage === stage);
                const isCompleted = approval?.status === 'approved';
                const isCurrent = request.currentStage === stage;
                
                return (
                  <React.Fragment key={stage}>
                    <div 
                      className={cn(
                        "h-2 flex-1 rounded-full transition-colors",
                        isCompleted ? "bg-success" : isCurrent ? "bg-warning animate-pulse-subtle" : "bg-muted"
                      )}
                    />
                    {index < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {request.status === 'pending' && onApprove && (
              <Button size="sm" onClick={onApprove} className="flex-1">
                Approve
              </Button>
            )}
            {request.status === 'pending' && onReject && (
              <Button size="sm" variant="destructive" onClick={onReject} className="flex-1">
                Reject
              </Button>
            )}
            {request.status === 'pending' && onCancel && (
              <Button size="sm" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {onView && (
              <Button size="sm" variant="outline" onClick={onView}>
                View Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
