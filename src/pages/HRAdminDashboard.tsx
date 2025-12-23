import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  LayoutDashboard,
  FileText,
  Calendar,
  ShieldAlert,
  TrendingUp,
  Settings,
  Lock,
} from 'lucide-react';

const HRAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { employees, policies, holidays, adjustments, auditLogs } = useHR();

  // Restrict access to HR/Admin only
  if (!user || user.role !== 'hr_admin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied. Only HR Admins can access this dashboard.</p>
      </div>
    );
  }

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const inactiveEmployees = employees.filter(e => e.status === 'inactive').length;

  // Department distribution
  const departmentData = employees.reduce((acc, emp) => {
    const dept = acc.find(d => d.name === emp.department);
    if (dept) {
      dept.value += 1;
    } else {
      acc.push({ name: emp.department, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Role distribution
  const roleData = employees.reduce((acc, emp) => {
    const role = acc.find(r => r.name === emp.role);
    if (role) {
      role.value += 1;
    } else {
      acc.push({ name: emp.role, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  // Recent activity
  const recentLogs = auditLogs.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR & Admin Dashboard"
        description="System configuration, policies, and audit control"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value={employees.length}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Active Employees"
          value={activeEmployees}
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Leave Policies"
          value={policies.length}
          icon={FileText}
          variant="warning"
        />
        <StatsCard
          title="Company Holidays"
          value={holidays.length}
          icon={Calendar}
          variant="primary"
        />
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/employees">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Employee Management
              </Button>
            </Link>
            <Link to="/policies">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Leave Policies
              </Button>
            </Link>
            <Link to="/holidays">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Holiday Calendar
              </Button>
            </Link>
            <Link to="/adjustments">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Leave Adjustments
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart className="w-4 h-4 mr-2" />
                Reports & Export
              </Button>
            </Link>
            <Link to="/audit-logs">
              <Button variant="outline" className="w-full justify-start">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Audit Logs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employees by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employees by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Policy Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Policies Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Policy</th>
                  <th className="text-center py-2 px-2">Annual Quota</th>
                  <th className="text-center py-2 px-2">Carry Forward</th>
                  <th className="text-center py-2 px-2">Max Carry Forward</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(policy => (
                  <tr key={policy.id} className="border-b hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium">{policy.name}</td>
                    <td className="text-center py-2 px-2">{policy.annualQuota}</td>
                    <td className="text-center py-2 px-2">
                      <span className={policy.carryForward ? 'text-green-600' : 'text-red-600'}>
                        {policy.carryForward ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">{policy.maxCarryForward || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Latest system changes</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map(log => (
                <div key={log.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{log.entityDetails}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.performedByName} • {log.timestamp}
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                    {log.action}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No activity yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="border-l-4 border-l-red-600 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <ShieldAlert className="w-5 h-5" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-red-900">
          <p>✓ Complete employee management with role hierarchy</p>
          <p>✓ Configurable leave policies with automatic quota reset</p>
          <p>✓ Manual leave balance adjustments with audit trail</p>
          <p>✓ Holiday calendar management and enforcement</p>
          <p>✓ Comprehensive reports with CSV export capability</p>
          <p>✓ Read-only audit logs tracking all system changes</p>
          <p>✓ Strict role-based access control (HR Admin only)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRAdminDashboard;
