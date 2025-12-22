import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { LeaveRequestCard } from '@/components/leave/LeaveRequestCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MyLeaves: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, cancelRequest } = useLeave();
  const [activeTab, setActiveTab] = useState('all');

  if (!user) return null;

  const myRequests = leaveRequests.filter(r => r.employeeId === user.id);
  const filteredRequests = activeTab === 'all' 
    ? myRequests 
    : myRequests.filter(r => r.status === activeTab);

  const handleCancel = (requestId: string) => {
    cancelRequest(requestId);
    toast({ title: 'Leave Cancelled', description: 'Your leave request has been cancelled.' });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Leaves"
        description="View and manage your leave requests"
      >
        <Link to="/apply-leave">
          <Button>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Apply Leave
          </Button>
        </Link>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({myRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({myRequests.filter(r => r.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({myRequests.filter(r => r.status === 'rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No leave requests found.
            </div>
          ) : (
            filteredRequests.map(request => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                showActions={request.status === 'pending'}
                onCancel={() => handleCancel(request.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyLeaves;
