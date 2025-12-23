import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Employee, 
  LeavePolicy, 
  Holiday, 
  LeaveAdjustment, 
  AuditLog, 
  EmployeeChangeHistory,
  UserRole,
  LeaveType,
  LeaveBalance
} from '@/types/leave';
import { mockEmployees, mockLeavePolicies, mockHolidays } from '@/data/mockData';

interface HRContextType {
  employees: Employee[];
  policies: LeavePolicy[];
  holidays: Holiday[];
  adjustments: LeaveAdjustment[];
  auditLogs: AuditLog[];
  employeeHistory: EmployeeChangeHistory[];
  
  // Employee Management
  addEmployee: (employee: Omit<Employee, 'id' | 'leaveBalance'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>, changedBy: string, changedByName: string) => void;
  deactivateEmployee: (id: string, changedBy: string, changedByName: string) => void;
  activateEmployee: (id: string, changedBy: string, changedByName: string) => void;
  
  // Policy Management
  updatePolicy: (id: string, updates: Partial<LeavePolicy>, userId: string, userName: string) => void;
  
  // Holiday Management
  addHoliday: (holiday: Omit<Holiday, 'id'>, userId: string, userName: string) => void;
  updateHoliday: (id: string, updates: Partial<Holiday>, userId: string, userName: string) => void;
  deleteHoliday: (id: string, userId: string, userName: string) => void;
  
  // Leave Adjustments
  adjustLeaveBalance: (
    employeeId: string,
    employeeName: string,
    leaveType: LeaveType,
    adjustmentType: 'credit' | 'debit',
    days: number,
    reason: string,
    adjustedBy: string,
    adjustedByName: string
  ) => void;
  
  // Audit
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  // Helpers
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeeHistory: (employeeId: string) => EmployeeChangeHistory[];
  getEmployeeAdjustments: (employeeId: string) => LeaveAdjustment[];
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [policies, setPolicies] = useState<LeavePolicy[]>(mockLeavePolicies);
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);
  const [adjustments, setAdjustments] = useState<LeaveAdjustment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [employeeHistory, setEmployeeHistory] = useState<EmployeeChangeHistory[]>([]);

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const getDefaultLeaveBalance = (): LeaveBalance => ({
    casual: 12,
    sick: 12,
    earned: 21,
    wfh: 24,
    comp_off: 0,
  });

  const addEmployee = useCallback((employee: Omit<Employee, 'id' | 'leaveBalance'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
      leaveBalance: getDefaultLeaveBalance(),
    };
    setEmployees(prev => [...prev, newEmployee]);
    addAuditLog({
      action: 'employee_update',
      entityType: 'employee',
      entityId: newEmployee.id,
      userId: 'system',
      userName: 'System',
      newValue: JSON.stringify(newEmployee),
      description: `New employee ${newEmployee.name} added to ${newEmployee.department}`,
    });
  }, [addAuditLog]);

  const updateEmployee = useCallback((
    id: string, 
    updates: Partial<Employee>, 
    changedBy: string, 
    changedByName: string
  ) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== id) return emp;
      
      // Track changes
      Object.keys(updates).forEach(key => {
        const typedKey = key as keyof Employee;
        if (emp[typedKey] !== updates[typedKey] && ['role', 'status', 'department', 'managerId'].includes(key)) {
          const history: EmployeeChangeHistory = {
            id: `history-${Date.now()}-${key}`,
            employeeId: id,
            changeType: key as 'role' | 'status' | 'department' | 'manager',
            oldValue: String(emp[typedKey] || ''),
            newValue: String(updates[typedKey] || ''),
            changedBy,
            changedByName,
            timestamp: new Date().toISOString(),
          };
          setEmployeeHistory(prev => [history, ...prev]);
        }
      });

      return { ...emp, ...updates };
    }));

    addAuditLog({
      action: 'employee_update',
      entityType: 'employee',
      entityId: id,
      userId: changedBy,
      userName: changedByName,
      oldValue: 'Previous values',
      newValue: JSON.stringify(updates),
      description: `Employee record updated`,
    });
  }, [addAuditLog]);

  const deactivateEmployee = useCallback((id: string, changedBy: string, changedByName: string) => {
    updateEmployee(id, { status: 'inactive' }, changedBy, changedByName);
  }, [updateEmployee]);

  const activateEmployee = useCallback((id: string, changedBy: string, changedByName: string) => {
    updateEmployee(id, { status: 'active' }, changedBy, changedByName);
  }, [updateEmployee]);

  const updatePolicy = useCallback((
    id: string, 
    updates: Partial<LeavePolicy>,
    userId: string,
    userName: string
  ) => {
    setPolicies(prev => prev.map(policy => {
      if (policy.id !== id) return policy;
      return { ...policy, ...updates };
    }));

    addAuditLog({
      action: 'policy_update',
      entityType: 'policy',
      entityId: id,
      userId,
      userName,
      newValue: JSON.stringify(updates),
      description: `Leave policy updated`,
    });
  }, [addAuditLog]);

  const addHoliday = useCallback((
    holiday: Omit<Holiday, 'id'>,
    userId: string,
    userName: string
  ) => {
    const newHoliday: Holiday = {
      ...holiday,
      id: `h-${Date.now()}`,
    };
    setHolidays(prev => [...prev, newHoliday].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

    addAuditLog({
      action: 'holiday_update',
      entityType: 'holiday',
      entityId: newHoliday.id,
      userId,
      userName,
      newValue: JSON.stringify(newHoliday),
      description: `Holiday "${holiday.name}" added on ${holiday.date}`,
    });
  }, [addAuditLog]);

  const updateHoliday = useCallback((
    id: string,
    updates: Partial<Holiday>,
    userId: string,
    userName: string
  ) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));

    addAuditLog({
      action: 'holiday_update',
      entityType: 'holiday',
      entityId: id,
      userId,
      userName,
      newValue: JSON.stringify(updates),
      description: `Holiday updated`,
    });
  }, [addAuditLog]);

  const deleteHoliday = useCallback((id: string, userId: string, userName: string) => {
    const holiday = holidays.find(h => h.id === id);
    setHolidays(prev => prev.filter(h => h.id !== id));

    addAuditLog({
      action: 'holiday_update',
      entityType: 'holiday',
      entityId: id,
      userId,
      userName,
      oldValue: JSON.stringify(holiday),
      description: `Holiday "${holiday?.name}" deleted`,
    });
  }, [holidays, addAuditLog]);

  const adjustLeaveBalance = useCallback((
    employeeId: string,
    employeeName: string,
    leaveType: LeaveType,
    adjustmentType: 'credit' | 'debit',
    days: number,
    reason: string,
    adjustedBy: string,
    adjustedByName: string
  ) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const previousBalance = employee.leaveBalance[leaveType];
    const newBalance = adjustmentType === 'credit' 
      ? previousBalance + days 
      : Math.max(0, previousBalance - days);

    // Update employee balance
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== employeeId) return emp;
      return {
        ...emp,
        leaveBalance: {
          ...emp.leaveBalance,
          [leaveType]: newBalance,
        },
      };
    }));

    // Record adjustment
    const adjustment: LeaveAdjustment = {
      id: `adj-${Date.now()}`,
      employeeId,
      employeeName,
      leaveType,
      adjustmentType,
      days,
      reason,
      adjustedBy,
      adjustedByName,
      timestamp: new Date().toISOString(),
      previousBalance,
      newBalance,
    };
    setAdjustments(prev => [adjustment, ...prev]);

    addAuditLog({
      action: 'adjustment',
      entityType: 'balance',
      entityId: employeeId,
      userId: adjustedBy,
      userName: adjustedByName,
      oldValue: String(previousBalance),
      newValue: String(newBalance),
      description: `${adjustmentType === 'credit' ? 'Credited' : 'Debited'} ${days} ${leaveType} leave days for ${employeeName}. Reason: ${reason}`,
    });
  }, [employees, addAuditLog]);

  const getEmployeeById = useCallback((id: string) => {
    return employees.find(e => e.id === id);
  }, [employees]);

  const getEmployeeHistory = useCallback((employeeId: string) => {
    return employeeHistory.filter(h => h.employeeId === employeeId);
  }, [employeeHistory]);

  const getEmployeeAdjustments = useCallback((employeeId: string) => {
    return adjustments.filter(a => a.employeeId === employeeId);
  }, [adjustments]);

  return (
    <HRContext.Provider value={{
      employees,
      policies,
      holidays,
      adjustments,
      auditLogs,
      employeeHistory,
      addEmployee,
      updateEmployee,
      deactivateEmployee,
      activateEmployee,
      updatePolicy,
      addHoliday,
      updateHoliday,
      deleteHoliday,
      adjustLeaveBalance,
      addAuditLog,
      getEmployeeById,
      getEmployeeHistory,
      getEmployeeAdjustments,
    }}>
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within a HRProvider');
  }
  return context;
};