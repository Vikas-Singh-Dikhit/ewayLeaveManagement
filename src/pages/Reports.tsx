import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { useLeave } from '@/contexts/LeaveContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveType, LEAVE_TYPE_LABELS, DEPARTMENT_LIST, STATUS_LABELS } from '@/types/leave';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText, Filter, Users, Calendar, BarChart3 } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { employees } = useHR();
  const { leaveRequests } = useLeave();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');

  if (!user || user.role !== 'hr_admin') {
    return <div className="p-8 text-center text-muted-foreground">Access denied. HR Admin only.</div>;
  }

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      const matchesDepartment = filterDepartment === 'all' || req.department === filterDepartment;
      const matchesLeaveType = filterLeaveType === 'all' || req.leaveType === filterLeaveType;
      
      let matchesDate = true;
      if (dateFrom && dateTo) {
        const startDate = parseISO(req.startDate);
        matchesDate = isWithinInterval(startDate, { start: parseISO(dateFrom), end: parseISO(dateTo) });
      }

      return matchesDepartment && matchesLeaveType && matchesDate;
    });
  }, [leaveRequests, filterDepartment, filterLeaveType, dateFrom, dateTo]);

  const departmentStats = useMemo(() => {
    const stats: Record<string, { total: number; approved: number; pending: number; days: number }> = {};
    
    filteredRequests.forEach(req => {
      if (!stats[req.department]) {
        stats[req.department] = { total: 0, approved: 0, pending: 0, days: 0 };
      }
      stats[req.department].total++;
      if (req.status === 'approved') {
        stats[req.department].approved++;
        stats[req.department].days += req.daysCount;
      }
      if (req.status === 'pending') {
        stats[req.department].pending++;
      }
    });

    return stats;
  }, [filteredRequests]);

  const leaveTypeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
    filteredRequests.filter(r => r.status === 'approved').forEach(req => {
      stats[req.leaveType] = (stats[req.leaveType] || 0) + req.daysCount;
    });

    return stats;
  }, [filteredRequests]);

  const handleExportCSV = () => {
    const headers = ['Employee', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Applied On'];
    const rows = filteredRequests.map(req => [
      req.employeeName,
      req.department,
      LEAVE_TYPE_LABELS[req.leaveType],
      req.startDate,
      req.endDate,
      req.daysCount,
      STATUS_LABELS[req.status],
      req.appliedOn,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leave-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Report exported as CSV');
  };

  const handleExportPDF = () => {
    // In a real app, this would generate a proper PDF using a library like jspdf or react-pdf
    toast.info('PDF export would be implemented with a PDF library in production');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        description="Generate and export leave reports"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENT_LIST.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={filterLeaveType} onValueChange={setFilterLeaveType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="employee">By Employee</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Leave Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Total Requests</span>
                    <span className="font-bold text-lg">{filteredRequests.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>Approved</span>
                    <span className="font-bold text-lg text-green-600">
                      {filteredRequests.filter(r => r.status === 'approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span>Pending</span>
                    <span className="font-bold text-lg text-yellow-600">
                      {filteredRequests.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span>Rejected</span>
                    <span className="font-bold text-lg text-red-600">
                      {filteredRequests.filter(r => r.status === 'rejected').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Days by Leave Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(leaveTypeStats).map(([type, days]) => (
                    <div key={type} className="flex justify-between items-center p-3 border rounded-lg">
                      <span>{LEAVE_TYPE_LABELS[type as LeaveType]}</span>
                      <Badge variant="secondary">{days} days</Badge>
                    </div>
                  ))}
                  {Object.keys(leaveTypeStats).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No approved leaves in this period</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department-wise Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Total Requests</TableHead>
                    <TableHead className="text-center">Approved</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Total Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(departmentStats).map(([dept, stats]) => (
                    <TableRow key={dept}>
                      <TableCell className="font-medium">{dept}</TableCell>
                      <TableCell className="text-center">{stats.total}</TableCell>
                      <TableCell className="text-center text-green-600">{stats.approved}</TableCell>
                      <TableCell className="text-center text-yellow-600">{stats.pending}</TableCell>
                      <TableCell className="text-center font-medium">{stats.days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee">
          <Card>
            <CardHeader>
              <CardTitle>Employee-wise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Total Requests</TableHead>
                    <TableHead className="text-center">Days Taken</TableHead>
                    <TableHead>Current Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.filter(e => e.status === 'active').map(emp => {
                    const empRequests = filteredRequests.filter(r => r.employeeId === emp.id);
                    const daysTaken = empRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.daysCount, 0);
                    
                    return (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell className="text-center">{empRequests.length}</TableCell>
                        <TableCell className="text-center">{daysTaken}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(emp.leaveBalance).slice(0, 3).map(([type, bal]) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type.toUpperCase().slice(0, 2)}: {bal}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Leave Report ({filteredRequests.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.employeeName}</TableCell>
                      <TableCell>{req.department}</TableCell>
                      <TableCell>{LEAVE_TYPE_LABELS[req.leaveType]}</TableCell>
                      <TableCell>
                        {format(parseISO(req.startDate), 'MMM dd')} - {format(parseISO(req.endDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-center">{req.daysCount}</TableCell>
                      <TableCell>
                        <Badge variant={
                          req.status === 'approved' ? 'default' :
                          req.status === 'pending' ? 'secondary' :
                          req.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {STATUS_LABELS[req.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(parseISO(req.appliedOn), 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;