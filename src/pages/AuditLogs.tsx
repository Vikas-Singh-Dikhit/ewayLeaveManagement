import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { useLeave } from '@/contexts/LeaveContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Shield, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const { auditLogs } = useHR();
  const { leaveRequests } = useLeave();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  if (!user || user.role !== 'hr_admin') {
    return <div className="p-8 text-center text-muted-foreground">Access denied. HR Admin only.</div>;
  }

  // Combine audit logs from HR context with approval actions from leave requests
  const approvalLogs = leaveRequests.flatMap(req => 
    req.approvals
      .filter(a => a.status !== 'pending' && a.timestamp)
      .map(a => ({
        id: `approval-${req.id}-${a.stage}`,
        action: a.status === 'approved' ? 'approval' : 'rejection',
        entityType: 'leave_request',
        entityId: req.id,
        userId: a.approverId,
        userName: a.approverName,
        oldValue: 'pending',
        newValue: a.status,
        description: `${a.status === 'approved' ? 'Approved' : 'Rejected'} ${req.employeeName}'s ${req.leaveType} leave (${req.daysCount} days)${a.comment ? `. Comment: ${a.comment}` : ''}`,
        timestamp: a.timestamp!,
      }))
  );

  const allLogs = [...auditLogs, ...approvalLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approval':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'rejection':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case 'adjustment':
        return <Badge className="bg-blue-100 text-blue-700">Adjustment</Badge>;
      case 'employee_update':
        return <Badge className="bg-purple-100 text-purple-700">Employee</Badge>;
      case 'policy_update':
        return <Badge className="bg-orange-100 text-orange-700">Policy</Badge>;
      case 'holiday_update':
        return <Badge className="bg-cyan-100 text-cyan-700">Holiday</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'leave_request':
        return '📋';
      case 'employee':
        return '👤';
      case 'policy':
        return '📜';
      case 'holiday':
        return '📅';
      case 'balance':
        return '💰';
      default:
        return '📝';
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Audit Logs"
        description="Read-only view of all system actions and changes"
      />

      {/* Info Banner */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Audit Trail</p>
              <p className="text-sm text-muted-foreground">
                This log captures all approval actions, leave balance changes, HR adjustments, and system configuration updates. 
                Data is read-only and cannot be modified.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{allLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-xl">✓</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{allLogs.filter(l => l.action === 'approval').length}</p>
                <p className="text-sm text-muted-foreground">Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-xl">✗</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{allLogs.filter(l => l.action === 'rejection').length}</p>
                <p className="text-sm text-muted-foreground">Rejections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{allLogs.filter(l => l.action === 'adjustment').length}</p>
                <p className="text-sm text-muted-foreground">Adjustments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="rejection">Rejections</SelectItem>
                <SelectItem value="adjustment">Adjustments</SelectItem>
                <SelectItem value="employee_update">Employee Updates</SelectItem>
                <SelectItem value="policy_update">Policy Updates</SelectItem>
                <SelectItem value="holiday_update">Holiday Updates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Log ({filteredLogs.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Old → New</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <span className="text-lg mr-2">{getEntityIcon(log.entityType)}</span>
                      <span className="capitalize text-sm">{log.entityType.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate">{log.description}</p>
                    </TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>
                      {log.oldValue && log.newValue && (
                        <span className="text-sm text-muted-foreground">
                          {log.oldValue.length > 20 ? '...' : log.oldValue} → {log.newValue.length > 20 ? '...' : log.newValue}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;