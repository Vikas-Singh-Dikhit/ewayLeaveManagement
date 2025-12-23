export type UserRole = 'employee' | 'team_lead' | 'manager' | 'director' | 'hr_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  teamId?: string;
  avatar?: string;
  managerId?: string;
}

export type LeaveType = 'casual' | 'sick' | 'earned' | 'wfh' | 'comp_off';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type DayType = 'full' | 'first_half' | 'second_half';

export type ApprovalStage = 'team_lead' | 'manager' | 'director' | 'completed';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  dayType: DayType;
  reason: string;
  documentUrl?: string;
  status: LeaveStatus;
  currentStage: ApprovalStage;
  appliedOn: string;
  approvals: ApprovalRecord[];
  daysCount: number;
}

export interface ApprovalRecord {
  stage: ApprovalStage;
  approverId: string;
  approverName: string;
  status: 'approved' | 'rejected' | 'pending';
  comment?: string;
  timestamp?: string;
}

export interface LeaveBalance {
  casual: number;
  sick: number;
  earned: number;
  wfh: number;
  comp_off: number;
}

export interface LeavePolicy {
  id: string;
  leaveType: LeaveType;
  name: string;
  annualQuota: number;
  carryForward: boolean;
  maxCarryForward: number;
  description: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'regional' | 'optional';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  teamId: string;
  joinDate: string;
  status: 'active' | 'inactive';
  leaveBalance: LeaveBalance;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  casual: 'Casual Leave',
  sick: 'Sick Leave',
  earned: 'Earned Leave',
  wfh: 'Work From Home',
  comp_off: 'Compensatory Off',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Employee',
  team_lead: 'Team Lead',
  manager: 'Manager',
  director: 'Director',
  hr_admin: 'HR Admin',
};

// HR/Admin specific types
export interface EmployeeHistory {
  id: string;
  employeeId: string;
  fieldChanged: 'role' | 'status' | 'manager' | 'department' | 'teamId';
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByName: string;
  timestamp: string;
  reason?: string;
}

export interface LeaveAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  days: number; // positive for credit, negative for debit
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
  timestamp: string;
  oldBalance: number;
  newBalance: number;
}

export interface AuditLog {
  id: string;
  action: 'approve' | 'reject' | 'adjustment' | 'employee_change' | 'policy_change' | 'holiday_change' | 'leave_cancel';
  entityType: 'leave_request' | 'employee' | 'policy' | 'holiday' | 'adjustment';
  entityId: string;
  entityDetails: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  ipAddress?: string;
}

export interface PolicyChangeLog {
  id: string;
  policyId: string;
  leaveType: LeaveType;
  changes: Record<string, any>;
  changedBy: string;
  changedByName: string;
  timestamp: string;
  effectiveFrom: string;
}

export interface LeaveYearConfig {
  id: string;
  year: number;
  startDate: string; // Calendar or Financial year start
  endDate: string;
  yearType: 'calendar' | 'financial'; // Calendar (Jan-Dec) or Financial (Apr-Mar)
  isActive: boolean;
}

export const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};
