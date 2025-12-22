import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { LeaveBalanceCards } from '@/components/leave/LeaveBalanceCards';
import { LeaveRequestCard } from '@/components/leave/LeaveRequestCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_LABELS } from '@/types/leave';
import { Link } from 'react-router-dom';
import { CalendarPlus, Clock, CheckCircle, XCircle, Users, FileText, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, leaveBalance, getPendingCount } = useLeave();

  if (!user) return null;

  const myRequests = leaveRequests.filter(r => r.employeeId === user.id);
  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const approvedRequests = myRequests.filter(r => r.status === 'approved');

  const renderEmployeeDashboard = () => (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">Your Leave Balance</h2>
          <p className="text-sm text-muted-foreground">Available days for this year</p>
        </div>
        <Link to="/apply-leave">
          <Button>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Apply Leave
          </Button>
        </Link>
      </div>
      <LeaveBalanceCards balance={leaveBalance} className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Pending Requests" value={pendingRequests.length} icon={Clock} variant="warning" />
        <StatsCard title="Approved This Year" value={approvedRequests.length} icon={CheckCircle} variant="success" />
        <StatsCard title="Total Days Taken" value={approvedRequests.reduce((sum, r) => sum + r.daysCount, 0)} icon={TrendingUp} />
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
          <div className="grid gap-4">
            {pendingRequests.slice(0, 3).map(request => (
              <LeaveRequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderApproverDashboard = () => {
    const stage = user.role === 'team_lead' ? 'team_lead' : user.role === 'manager' ? 'manager' : 'director';
    const pendingApprovals = getPendingCount(stage);
    const allPendingRequests = leaveRequests.filter(r => r.currentStage === stage && r.status === 'pending');

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Pending Approvals" value={pendingApprovals} icon={Clock} variant="warning" />
          <StatsCard title="Approved Today" value={3} icon={CheckCircle} variant="success" />
          <StatsCard title="Rejected" value={1} icon={XCircle} variant="destructive" />
          <StatsCard title="Team Members" value={12} icon={Users} />
        </div>

        {allPendingRequests.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Approvals</CardTitle>
              <Link to="/approvals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="grid gap-4">
              {allPendingRequests.slice(0, 3).map(request => (
                <LeaveRequestCard key={request.id} request={request} showEmployee />
              ))}
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  const renderHRDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Employees" value={156} icon={Users} variant="primary" />
        <StatsCard title="On Leave Today" value={8} icon={Clock} variant="warning" />
        <StatsCard title="Pending Requests" value={12} icon={FileText} />
        <StatsCard title="Avg. Days/Employee" value={4.2} icon={TrendingUp} variant="success" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/employees"><Button variant="outline" className="w-full">Manage Employees</Button></Link>
            <Link to="/policies"><Button variant="outline" className="w-full">Leave Policies</Button></Link>
            <Link to="/holidays"><Button variant="outline" className="w-full">Holiday Calendar</Button></Link>
            <Link to="/reports"><Button variant="outline" className="w-full">Generate Reports</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>• John Smith applied for 2 days casual leave</p>
            <p>• Alice Cooper's leave was approved by Director</p>
            <p>• New employee David Lee added to Engineering</p>
            <p>• Holiday policy updated for Q1 2025</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}!`}
        description={`${ROLE_LABELS[user.role]} Dashboard`}
      />

      {user.role === 'employee' && renderEmployeeDashboard()}
      {['team_lead', 'manager', 'director'].includes(user.role) && renderApproverDashboard()}
      {user.role === 'hr_admin' && renderHRDashboard()}
    </div>
  );
};

export default Dashboard;
