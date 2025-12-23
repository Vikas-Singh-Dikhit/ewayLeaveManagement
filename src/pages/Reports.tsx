import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { useHR } from '@/contexts/HRContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download } from 'lucide-react';
import { LEAVE_TYPE_LABELS } from '@/types/leave';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests } = useLeave();
  const { employees } = useHR();
  const [reportType, setReportType] = useState('employee');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('');

  // Restrict access to HR/Admin and Director only
  if (!user || (user.role !== 'hr_admin' && user.role !== 'director')) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied. Only HR Admins and Directors can view reports.</p>
      </div>
    );
  }

  const departments = [...new Set(employees.map(e => e.department))];

  // Generate employee leave report
  const getEmployeeReport = () => {
    if (!selectedEmployee) return [];

    let filtered = leaveRequests.filter(lr => lr.employeeId === selectedEmployee && lr.status === 'approved');

    if (startDate) filtered = filtered.filter(lr => lr.startDate >= startDate);
    if (endDate) filtered = filtered.filter(lr => lr.endDate <= endDate);
    if (leaveType) filtered = filtered.filter(lr => lr.leaveType === leaveType);

    return filtered;
  };

  // Generate department leave report
  const getDepartmentReport = () => {
    if (!selectedDepartment) return [];

    let filtered = leaveRequests.filter(lr => lr.department === selectedDepartment && lr.status === 'approved');

    if (startDate) filtered = filtered.filter(lr => lr.startDate >= startDate);
    if (endDate) filtered = filtered.filter(lr => lr.endDate <= endDate);
    if (leaveType) filtered = filtered.filter(lr => lr.leaveType === leaveType);

    return filtered;
  };

  const reportData = reportType === 'employee' ? getEmployeeReport() : getDepartmentReport();

  // Calculate summary
  const totalDays = reportData.reduce((sum, lr) => sum + lr.daysCount, 0);
  const byType = reportData.reduce((acc, lr) => {
    acc[lr.leaveType] = (acc[lr.leaveType] || 0) + lr.daysCount;
    return acc;
  }, {} as Record<string, number>);

  // Export to CSV
  const exportToCSV = () => {
    let csv = '';
    if (reportType === 'employee') {
      const emp = employees.find(e => e.id === selectedEmployee);
      csv = `Employee Leave Report\n`;
      csv += `Employee: ${emp?.name}\n`;
      csv += `Department: ${emp?.department}\n`;
      csv += `Date Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}\n\n`;
    } else {
      csv = `Department Leave Report\n`;
      csv += `Department: ${selectedDepartment}\n`;
      csv += `Date Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}\n\n`;
    }

    csv += 'Leave Details\n';
    csv += 'Employee,Leave Type,Start Date,End Date,Days,Reason\n';

    reportData.forEach(lr => {
      csv += `${lr.employeeName},${lr.leaveType},${lr.startDate},${lr.endDate},${lr.daysCount},"${lr.reason}"\n`;
    });

    csv += '\n\nSummary\n';
    csv += 'Leave Type,Days\n';
    Object.entries(byType).forEach(([type, days]) => {
      csv += `${LEAVE_TYPE_LABELS[type as any]},${days}\n`;
    });
    csv += `Total,${totalDays}\n`;

    // Download
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', `leave-report-${Date.now()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Reports & Export" description="Generate leave reports with export capability" />
        <Button onClick={exportToCSV} disabled={reportData.length === 0} className="bg-red-600 hover:bg-red-700">
          <Download className="w-4 h-4 mr-2" />
          Export as CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee-wise Report</SelectItem>
                  <SelectItem value="department">Department-wise Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'employee' ? (
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="leaveType">Leave Type (Optional)</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger id="leaveType">
                  <SelectValue placeholder="All leave types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="earned">Earned Leave</SelectItem>
                  <SelectItem value="wfh">Work From Home</SelectItem>
                  <SelectItem value="comp_off">Compensatory Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Days</p>
                <p className="text-3xl font-bold">{totalDays}</p>
              </div>
              {Object.entries(byType).map(([type, days]) => (
                <div key={type}>
                  <p className="text-muted-foreground text-sm">{LEAVE_TYPE_LABELS[type as any]}</p>
                  <p className="text-2xl font-bold">{days}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Report Data</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {reportData.length} records
          </p>
        </CardHeader>
        <CardContent>
          {reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map(lr => (
                    <TableRow key={lr.id}>
                      <TableCell className="font-medium">{lr.employeeName}</TableCell>
                      <TableCell>{lr.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{LEAVE_TYPE_LABELS[lr.leaveType]}</Badge>
                      </TableCell>
                      <TableCell>{lr.startDate}</TableCell>
                      <TableCell>{lr.endDate}</TableCell>
                      <TableCell className="font-semibold">{lr.daysCount}</TableCell>
                      <TableCell className="max-w-xs truncate">{lr.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {reportType === 'employee' && !selectedEmployee
                ? 'Select an employee to view report'
                : reportType === 'department' && !selectedDepartment
                  ? 'Select a department to view report'
                  : 'No data available for selected criteria'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
