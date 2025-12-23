import { User, LeaveRequest, LeaveBalance, Employee, Holiday, LeavePolicy, AuditLog, LeaveAdjustment, EmployeeHistory, PolicyChangeLog, LeaveYearConfig } from '@/types/leave';

export const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@company.com', role: 'employee', department: 'Engineering', teamId: 'team-1' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'team_lead', department: 'Engineering', teamId: 'team-1' },
  { id: '3', name: 'Michael Brown', email: 'michael@company.com', role: 'manager', department: 'Engineering' },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', role: 'director', department: 'Engineering' },
  { id: '5', name: 'Admin User', email: 'admin@company.com', role: 'hr_admin', department: 'Human Resources' },
];

export const mockLeaveBalance: LeaveBalance = {
  casual: 8,
  sick: 10,
  earned: 15,
  wfh: 12,
  comp_off: 3,
};

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'lr-1',
    employeeId: '1',
    employeeName: 'John Smith',
    department: 'Engineering',
    leaveType: 'casual',
    startDate: '2024-12-26',
    endDate: '2024-12-27',
    dayType: 'full',
    reason: 'Family vacation during holidays',
    status: 'pending',
    currentStage: 'team_lead',
    appliedOn: '2024-12-20',
    daysCount: 2,
    approvals: [
      { stage: 'team_lead', approverId: '2', approverName: 'Sarah Johnson', status: 'pending' },
    ],
  },
  {
    id: 'lr-2',
    employeeId: '1',
    employeeName: 'John Smith',
    department: 'Engineering',
    leaveType: 'sick',
    startDate: '2024-12-10',
    endDate: '2024-12-10',
    dayType: 'first_half',
    reason: 'Doctor appointment',
    status: 'approved',
    currentStage: 'completed',
    appliedOn: '2024-12-08',
    daysCount: 0.5,
    approvals: [
      { stage: 'team_lead', approverId: '2', approverName: 'Sarah Johnson', status: 'approved', comment: 'Approved', timestamp: '2024-12-08T10:30:00' },
      { stage: 'manager', approverId: '3', approverName: 'Michael Brown', status: 'approved', comment: 'Take care', timestamp: '2024-12-08T14:00:00' },
      { stage: 'director', approverId: '4', approverName: 'Emily Davis', status: 'approved', timestamp: '2024-12-09T09:00:00' },
    ],
  },
  {
    id: 'lr-3',
    employeeId: '6',
    employeeName: 'Alice Cooper',
    department: 'Engineering',
    leaveType: 'earned',
    startDate: '2024-12-30',
    endDate: '2025-01-03',
    dayType: 'full',
    reason: 'New Year break with family',
    status: 'pending',
    currentStage: 'manager',
    appliedOn: '2024-12-18',
    daysCount: 5,
    approvals: [
      { stage: 'team_lead', approverId: '2', approverName: 'Sarah Johnson', status: 'approved', comment: 'Approved from my side', timestamp: '2024-12-18T16:00:00' },
      { stage: 'manager', approverId: '3', approverName: 'Michael Brown', status: 'pending' },
    ],
  },
  {
    id: 'lr-4',
    employeeId: '7',
    employeeName: 'Bob Wilson',
    department: 'Engineering',
    leaveType: 'wfh',
    startDate: '2024-12-23',
    endDate: '2024-12-23',
    dayType: 'full',
    reason: 'Internet installation at new apartment',
    status: 'pending',
    currentStage: 'team_lead',
    appliedOn: '2024-12-19',
    daysCount: 1,
    approvals: [
      { stage: 'team_lead', approverId: '2', approverName: 'Sarah Johnson', status: 'pending' },
    ],
  },
  {
    id: 'lr-5',
    employeeId: '8',
    employeeName: 'Carol Martinez',
    department: 'Design',
    leaveType: 'casual',
    startDate: '2024-12-24',
    endDate: '2024-12-25',
    dayType: 'full',
    reason: 'Christmas celebration',
    status: 'pending',
    currentStage: 'director',
    appliedOn: '2024-12-15',
    daysCount: 2,
    approvals: [
      { stage: 'team_lead', approverId: '9', approverName: 'Design Lead', status: 'approved', timestamp: '2024-12-15T11:00:00' },
      { stage: 'manager', approverId: '10', approverName: 'Design Manager', status: 'approved', timestamp: '2024-12-16T09:00:00' },
      { stage: 'director', approverId: '4', approverName: 'Emily Davis', status: 'pending' },
    ],
  },
];

export const mockEmployees: Employee[] = [
  { id: '1', name: 'John Smith', email: 'john@company.com', role: 'employee', department: 'Engineering', teamId: 'team-1', joinDate: '2022-03-15', status: 'active', leaveBalance: mockLeaveBalance },
  { id: '6', name: 'Alice Cooper', email: 'alice@company.com', role: 'employee', department: 'Engineering', teamId: 'team-1', joinDate: '2021-08-01', status: 'active', leaveBalance: { casual: 6, sick: 8, earned: 12, wfh: 10, comp_off: 2 } },
  { id: '7', name: 'Bob Wilson', email: 'bob@company.com', role: 'employee', department: 'Engineering', teamId: 'team-1', joinDate: '2023-01-10', status: 'active', leaveBalance: { casual: 10, sick: 10, earned: 18, wfh: 15, comp_off: 0 } },
  { id: '8', name: 'Carol Martinez', email: 'carol@company.com', role: 'employee', department: 'Design', teamId: 'team-2', joinDate: '2022-06-20', status: 'active', leaveBalance: { casual: 5, sick: 9, earned: 14, wfh: 8, comp_off: 1 } },
  { id: '11', name: 'David Lee', email: 'david@company.com', role: 'employee', department: 'Engineering', teamId: 'team-1', joinDate: '2023-04-01', status: 'active', leaveBalance: mockLeaveBalance },
  { id: '12', name: 'Eva Green', email: 'eva@company.com', role: 'employee', department: 'QA', teamId: 'team-3', joinDate: '2022-11-15', status: 'active', leaveBalance: mockLeaveBalance },
];

export const mockHolidays: Holiday[] = [
  { id: 'h-1', date: '2024-12-25', name: 'Christmas Day', type: 'national' },
  { id: 'h-2', date: '2025-01-01', name: 'New Year Day', type: 'national' },
  { id: 'h-3', date: '2025-01-26', name: 'Republic Day', type: 'national' },
  { id: 'h-4', date: '2025-03-14', name: 'Holi', type: 'national' },
  { id: 'h-5', date: '2025-08-15', name: 'Independence Day', type: 'national' },
  { id: 'h-6', date: '2025-10-02', name: 'Gandhi Jayanti', type: 'national' },
  { id: 'h-7', date: '2025-11-01', name: 'Diwali', type: 'national' },
];

export const mockLeavePolicies: LeavePolicy[] = [
  { id: 'p-1', leaveType: 'casual', name: 'Casual Leave', annualQuota: 12, carryForward: false, maxCarryForward: 0, description: 'For personal matters and short breaks' },
  { id: 'p-2', leaveType: 'sick', name: 'Sick Leave', annualQuota: 12, carryForward: true, maxCarryForward: 6, description: 'For illness and medical appointments' },
  { id: 'p-3', leaveType: 'earned', name: 'Earned Leave', annualQuota: 21, carryForward: true, maxCarryForward: 30, description: 'Earned based on days worked' },
  { id: 'p-4', leaveType: 'wfh', name: 'Work From Home', annualQuota: 24, carryForward: false, maxCarryForward: 0, description: 'Remote work days' },
  { id: 'p-5', leaveType: 'comp_off', name: 'Compensatory Off', annualQuota: 0, carryForward: false, maxCarryForward: 0, description: 'Earned for working on holidays/weekends' },
];

export const mockLeaveAdjustments: LeaveAdjustment[] = [
  { id: 'adj-1', employeeId: '1', employeeName: 'John Smith', leaveType: 'casual', days: 2, reason: 'Bonus casual leave for excellent performance', adjustedBy: '5', adjustedByName: 'Admin User', timestamp: '2024-12-15T10:00:00', oldBalance: 8, newBalance: 10 },
  { id: 'adj-2', employeeId: '6', employeeName: 'Alice Cooper', leaveType: 'sick', days: -1, reason: 'Correction for double counting in sick leave', adjustedBy: '5', adjustedByName: 'Admin User', timestamp: '2024-12-14T14:30:00', oldBalance: 9, newBalance: 8 },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'audit-1', action: 'approve', entityType: 'leave_request', entityId: 'lr-2', entityDetails: 'Leave Request approved', performedBy: '2', performedByName: 'Sarah Johnson', timestamp: '2024-12-08T10:30:00' },
  { id: 'audit-2', action: 'approve', entityType: 'leave_request', entityId: 'lr-2', entityDetails: 'Leave Request approved', performedBy: '3', performedByName: 'Michael Brown', timestamp: '2024-12-08T14:00:00' },
  { id: 'audit-3', action: 'adjustment', entityType: 'adjustment', entityId: 'adj-1', entityDetails: 'Leave adjustment: +2 casual leave', performedBy: '5', performedByName: 'Admin User', timestamp: '2024-12-15T10:00:00', newValue: { days: 2, reason: 'Bonus casual leave for excellent performance' } },
  { id: 'audit-4', action: 'employee_change', entityType: 'employee', entityId: '1', entityDetails: 'Employee role updated', performedBy: '5', performedByName: 'Admin User', timestamp: '2024-12-10T11:00:00', oldValue: { role: 'employee' }, newValue: { role: 'employee' } },
];

export const mockEmployeeHistory: EmployeeHistory[] = [
  { id: 'eh-1', employeeId: '2', fieldChanged: 'role', oldValue: 'employee', newValue: 'team_lead', changedBy: '5', changedByName: 'Admin User', timestamp: '2024-06-15T09:00:00', reason: 'Promoted based on performance' },
  { id: 'eh-2', employeeId: '3', fieldChanged: 'role', oldValue: 'team_lead', newValue: 'manager', changedBy: '5', changedByName: 'Admin User', timestamp: '2024-03-01T10:00:00', reason: 'Promoted to Manager' },
];

export const mockLeaveYearConfig: LeaveYearConfig = {
  id: 'config-1',
  year: 2025,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  yearType: 'calendar',
  isActive: true,
};
