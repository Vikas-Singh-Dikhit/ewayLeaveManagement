import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Eye } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const { auditLogs, getAuditLogsByDateRange } = useHR();
  const [openDetails, setOpenDetails] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Restrict access to HR/Admin only
  if (!user || user.role !== 'hr_admin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied. Only HR Admins can view audit logs.</p>
      </div>
    );
  }

  const filteredLogs = startDate && endDate 
    ? getAuditLogsByDateRange(startDate, endDate)
    : auditLogs;

  const selectedLog = auditLogs.find(l => l.id === openDetails);

  const actionColors: Record<string, string> = {
    approve: 'bg-green-100 text-green-800',
    reject: 'bg-red-100 text-red-800',
    adjustment: 'bg-blue-100 text-blue-800',
    employee_change: 'bg-purple-100 text-purple-800',
    policy_change: 'bg-orange-100 text-orange-800',
    holiday_change: 'bg-yellow-100 text-yellow-800',
    leave_cancel: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Read-only system audit trail (HR Admin)" />

      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full"
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Audit Logs</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredLogs.length} entries
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge className={actionColors[log.action] || 'bg-gray-100 text-gray-800'}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-sm">{log.entityType}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{log.entityDetails}</TableCell>
                        <TableCell className="text-sm">{log.performedByName}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenDetails(log.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!openDetails} onOpenChange={() => setOpenDetails(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this audit log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Log ID</Label>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p className="font-semibold">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <p className="font-semibold capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Entity Type</Label>
                  <p className="font-semibold capitalize">{selectedLog.entityType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Entity ID</Label>
                  <p className="font-mono text-sm">{selectedLog.entityId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Performed By</Label>
                  <p className="font-semibold">{selectedLog.performedByName} ({selectedLog.performedBy})</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Details</Label>
                  <p className="font-semibold">{selectedLog.entityDetails}</p>
                </div>
              </div>

              {selectedLog.oldValue && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground font-semibold">Old Value</Label>
                  <pre className="text-xs overflow-auto mt-2 bg-white p-2 rounded border">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground font-semibold">New Value</Label>
                  <pre className="text-xs overflow-auto mt-2 bg-white p-2 rounded border">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
