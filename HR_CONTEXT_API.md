# HR Context API Reference

## Overview
The `HRContext` provides all HR/Admin functionality including employee management, leave policies, holidays, adjustments, and audit logging.

---

## Usage

### Import the Hook
```typescript
import { useHR } from '@/contexts/HRContext';

const MyComponent = () => {
  const {
    employees,
    policies,
    holidays,
    adjustments,
    auditLogs,
    // ... methods
  } = useHR();
  
  return (
    // component JSX
  );
};
```

---

## API Reference

### Employee Management

#### `employees: Employee[]`
Current list of all employees.

**Example:**
```typescript
const { employees } = useHR();
employees.forEach(emp => console.log(emp.name));
```

#### `addEmployee(employee: Omit<Employee, 'id'>): void`
Create a new employee.

**Example:**
```typescript
const { addEmployee } = useHR();

addEmployee({
  name: 'John Doe',
  email: 'john@company.com',
  role: 'employee',
  department: 'Engineering',
  teamId: 'team-1',
  joinDate: '2025-01-15',
  status: 'active',
  leaveBalance: { casual: 12, sick: 12, earned: 21, wfh: 24, comp_off: 0 }
});
```

#### `updateEmployee(id: string, updates: Partial<Employee>, reason?: string): void`
Update employee information. Automatically creates history entries for role/status changes.

**Example:**
```typescript
const { updateEmployee } = useHR();

updateEmployee('emp-1', {
  role: 'team_lead',
  department: 'Engineering'
}, 'Promoted based on performance');
```

#### `deactivateEmployee(id: string, reason?: string): void`
Deactivate an employee (set status to 'inactive'). Automatically logged.

**Example:**
```typescript
const { deactivateEmployee } = useHR();

deactivateEmployee('emp-1', 'Left the company');
```

#### `activateEmployee(id: string): void`
Reactivate a deactivated employee.

**Example:**
```typescript
const { activateEmployee } = useHR();

activateEmployee('emp-1');
```

#### `getEmployeeHistory(employeeId: string): EmployeeHistory[]`
Get all change history for an employee.

**Returns:**
```typescript
[
  {
    id: 'eh-1',
    employeeId: 'emp-1',
    fieldChanged: 'role',
    oldValue: 'employee',
    newValue: 'team_lead',
    changedBy: 'admin-1',
    changedByName: 'Admin User',
    timestamp: '2025-01-15T10:00:00',
    reason: 'Promotion'
  },
  // ... more entries
]
```

---

### Leave Policy Management

#### `policies: LeavePolicy[]`
Current list of all leave policies.

**Example:**
```typescript
const { policies } = useHR();
const casualPolicy = policies.find(p => p.leaveType === 'casual');
```

#### `addPolicy(policy: Omit<LeavePolicy, 'id'>): void`
Create a new leave policy.

**Example:**
```typescript
const { addPolicy } = useHR();

addPolicy({
  leaveType: 'wfh',
  name: 'Work From Home',
  annualQuota: 24,
  carryForward: false,
  maxCarryForward: 0,
  description: 'Remote work days per year'
});
```

#### `updatePolicy(id: string, updates: Partial<LeavePolicy>, reason?: string): void`
Update an existing leave policy. Changes are automatically logged.

**Example:**
```typescript
const { updatePolicy } = useHR();

updatePolicy('p-1', {
  annualQuota: 14,
  carryForward: true,
  maxCarryForward: 5
}, 'Increased CL quota for Q1 2025');
```

#### `deletePolicy(id: string): void`
Delete a leave policy (logged in audit trail).

**Example:**
```typescript
const { deletePolicy } = useHR();

deletePolicy('p-5');
```

---

### Holiday Management

#### `holidays: Holiday[]`
Current list of all company holidays.

**Example:**
```typescript
const { holidays } = useHR();
const decemberHolidays = holidays.filter(h => h.date.includes('2025-12'));
```

#### `addHoliday(holiday: Omit<Holiday, 'id'>): void`
Add a new company holiday.

**Example:**
```typescript
const { addHoliday } = useHR();

addHoliday({
  date: '2025-12-25',
  name: 'Christmas Day',
  type: 'national'
});
```

#### `updateHoliday(id: string, updates: Partial<Holiday>): void`
Update holiday details.

**Example:**
```typescript
const { updateHoliday } = useHR();

updateHoliday('h-1', {
  name: 'Updated Holiday Name',
  type: 'regional'
});
```

#### `deleteHoliday(id: string): void`
Remove a holiday from the calendar.

**Example:**
```typescript
const { deleteHoliday } = useHR();

deleteHoliday('h-1');
```

---

### Leave Adjustments

#### `adjustments: LeaveAdjustment[]`
All leave balance adjustments made.

**Example:**
```typescript
const { adjustments } = useHR();
const employeeAdjustments = adjustments.filter(a => a.employeeId === 'emp-1');
```

#### `adjustLeaveBalance(employeeId: string, leaveType: LeaveType, days: number, reason: string, hrId: string, hrName: string): void`
Manually adjust an employee's leave balance.

**Parameters:**
- `days`: Positive to add, negative to subtract
- `reason`: Mandatory reason for compliance
- `hrId`: ID of HR user making adjustment
- `hrName`: Name of HR user making adjustment

**Example:**
```typescript
const { adjustLeaveBalance } = useHR();
const { user } = useAuth();

adjustLeaveBalance(
  'emp-1',
  'casual',
  2,
  'Bonus casual leave for excellent performance',
  user.id,
  user.name
);
```

#### `getAdjustmentsByEmployee(employeeId: string): LeaveAdjustment[]`
Get all adjustments for a specific employee.

**Returns:**
```typescript
[
  {
    id: 'adj-1',
    employeeId: 'emp-1',
    employeeName: 'John Smith',
    leaveType: 'casual',
    days: 2,
    reason: 'Bonus',
    adjustedBy: 'admin-1',
    adjustedByName: 'Admin User',
    timestamp: '2025-01-15T10:00:00',
    oldBalance: 8,
    newBalance: 10
  }
]
```

---

### Audit Logs

#### `auditLogs: AuditLog[]`
All audit log entries in the system.

**Example:**
```typescript
const { auditLogs } = useHR();
const recentLogs = auditLogs.slice(-10);
```

#### `logAction(action: string, entityType: string, entityId: string, entityDetails: string, performedBy: string, performedByName: string, newValue?: Record<string, any>, oldValue?: Record<string, any>): void`
Manually log an action (usually called automatically).

**Actions:**
- `approve` - Leave approved
- `reject` - Leave rejected
- `adjustment` - Leave balance adjusted
- `employee_change` - Employee record changed
- `policy_change` - Policy modified
- `holiday_change` - Holiday modified
- `leave_cancel` - Leave cancelled

**Example:**
```typescript
const { logAction } = useHR();

logAction(
  'approval',
  'leave_request',
  'lr-1',
  'Leave request approved',
  'user-1',
  'John Manager',
  { status: 'approved' },
  { status: 'pending' }
);
```

#### `getAuditLogsByEntity(entityId: string): AuditLog[]`
Get all log entries for a specific entity.

**Example:**
```typescript
const { getAuditLogsByEntity } = useHR();

const leaveHistory = getAuditLogsByEntity('lr-1');
```

#### `getAuditLogsByDateRange(startDate: string, endDate: string): AuditLog[]`
Filter logs by date range (YYYY-MM-DD format).

**Example:**
```typescript
const { getAuditLogsByDateRange } = useHR();

const janLogs = getAuditLogsByDateRange('2025-01-01', '2025-01-31');
```

---

### Reports

#### `getEmployeeLeaveReport(employeeId: string, startDate?: string, endDate?: string): any`
Generate a leave report for a specific employee.

**Example:**
```typescript
const { getEmployeeLeaveReport } = useHR();

const report = getEmployeeLeaveReport('emp-1', '2025-01-01', '2025-12-31');
```

#### `getDepartmentLeaveReport(department: string, startDate?: string, endDate?: string): any`
Generate a leave report for a department.

**Example:**
```typescript
const { getDepartmentLeaveReport } = useHR();

const report = getDepartmentLeaveReport('Engineering', '2025-01-01', '2025-12-31');
```

---

## Data Structures

### Employee
```typescript
interface Employee {
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
```

### LeavePolicy
```typescript
interface LeavePolicy {
  id: string;
  leaveType: LeaveType;
  name: string;
  annualQuota: number;
  carryForward: boolean;
  maxCarryForward: number;
  description: string;
}
```

### Holiday
```typescript
interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'regional' | 'optional';
}
```

### LeaveAdjustment
```typescript
interface LeaveAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  days: number;
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
  timestamp: string;
  oldBalance: number;
  newBalance: number;
}
```

### AuditLog
```typescript
interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityDetails: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  ipAddress?: string;
}
```

### EmployeeHistory
```typescript
interface EmployeeHistory {
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
```

---

## Complete Example Component

```typescript
import React, { useState } from 'react';
import { useHR } from '@/contexts/HRContext';
import { useAuth } from '@/contexts/AuthContext';

const EmployeeAdjustmentComponent: React.FC = () => {
  const { user } = useAuth();
  const {
    employees,
    adjustLeaveBalance,
    getAdjustmentsByEmployee,
    adjustments
  } = useHR();

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [days, setDays] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const handleAdjustment = () => {
    if (!selectedEmployee || !reason) {
      alert('Please select employee and provide reason');
      return;
    }

    adjustLeaveBalance(
      selectedEmployee,
      'casual',
      days,
      reason,
      user!.id,
      user!.name
    );

    setSelectedEmployee('');
    setDays(0);
    setReason('');
  };

  const employeeAdjustments = getAdjustmentsByEmployee(selectedEmployee);

  return (
    <div>
      <h2>Adjust Leave Balance</h2>
      
      <select onChange={e => setSelectedEmployee(e.target.value)}>
        <option value="">Select Employee</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={days}
        onChange={e => setDays(parseInt(e.target.value))}
        placeholder="Days (positive/negative)"
      />

      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Reason for adjustment"
      />

      <button onClick={handleAdjustment}>Adjust</button>

      <h3>Adjustment History</h3>
      <ul>
        {employeeAdjustments.map(adj => (
          <li key={adj.id}>
            {adj.employeeName}: {adj.days > 0 ? '+' : ''}{adj.days} days
            (Reason: {adj.reason})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeAdjustmentComponent;
```

---

## Notes

1. **Automatic Logging**: Most operations automatically create audit log entries
2. **Timestamp Format**: All timestamps are ISO 8601 format
3. **Access Control**: Check user role before using these functions
4. **Error Handling**: Functions return `void` - errors are handled internally
5. **State Updates**: All state updates trigger component re-renders

---

**API Version**: 1.0.0  
**Last Updated**: December 23, 2025
