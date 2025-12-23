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
  managerId?: string;
  teamLeadId?: string;
}

export interface LeaveAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  adjustmentType: 'credit' | 'debit';
  days: number;
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
  timestamp: string;
  previousBalance: number;
  newBalance: number;
}

export interface AuditLog {
  id: string;
  action: 'approval' | 'rejection' | 'balance_change' | 'employee_update' | 'policy_update' | 'holiday_update' | 'adjustment';
  entityType: 'leave_request' | 'employee' | 'policy' | 'holiday' | 'balance';
  entityId: string;
  userId: string;
  userName: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  timestamp: string;
}

export interface EmployeeChangeHistory {
  id: string;
  employeeId: string;
  changeType: 'role' | 'status' | 'department' | 'manager';
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByName: string;
  timestamp: string;
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

export const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const DEPARTMENT_LIST = [
  'Engineering',
  'Design',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'QA',
  'Operations',
] as const;
