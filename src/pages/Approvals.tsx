import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { LeaveRequestCard } from '@/components/leave/LeaveRequestCard';
import { ApprovalDialog } from '@/components/leave/ApprovalDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { LeaveRequest, ApprovalStage } from '@/types/leave';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const Approvals: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, approveRequest, rejectRequest } = useLeave();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!user) return null;

  const getStage = (): ApprovalStage => {
    if (user.role === 'team_lead') return 'team_lead';
    if (user.role === 'manager') return 'manager';
    return 'director';
  };

  const stage = getStage();
  const pendingRequests = leaveRequests.filter(r => r.currentStage === stage && r.status === 'pending');
  const processedRequests = leaveRequests.filter(r => 
    r.approvals.some(a => a.approverId === user.id && a.status !== 'pending')
  );

  const handleApprove = (requestId: string, comment?: string) => {
    approveRequest(requestId, user.id, user.name, comment);
    toast({ title: 'Request Approved', description: 'The leave request has been approved and forwarded.' });
  };

  const handleReject = (requestId: string, comment: string) => {
    rejectRequest(requestId, user.id, user.name, comment);
    toast({ title: 'Request Rejected', description: 'The leave request has been rejected.', variant: 'destructive' });
  };

  const openDialog = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leave Approvals"
        description={`Review and process leave requests as ${user.role.replace('_', ' ')}`}
      />

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({processedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pending requests to review.
            </div>
          ) : (
            pendingRequests.map(request => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                showEmployee
                showActions
                onApprove={() => handleApprove(request.id)}
                onReject={() => openDialog(request)}
                onView={() => openDialog(request)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {processedRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No processed requests yet.
            </div>
          ) : (
            processedRequests.map(request => (
              <LeaveRequestCard key={request.id} request={request} showEmployee />
            ))
          )}
        </TabsContent>
      </Tabs>

      <ApprovalDialog
        request={selectedRequest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default Approvals;
