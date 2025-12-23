import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Employee, 
  LeavePolicy, 
  Holiday, 
  AuditLog, 
  LeaveAdjustment, 
  EmployeeHistory,
  UserRole,
  LeaveType
} from '@/types/leave';
import { 
  mockEmployees, 
  mockLeavePolicies, 
  mockHolidays, 
  mockAuditLogs,
  mockLeaveAdjustments,
  mockEmployeeHistory
} from '@/data/mockData';

interface HRContextType {
  // Employee Management
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>, reason?: string) => void;
  deactivateEmployee: (id: string, reason?: string) => void;
  activateEmployee: (id: string) => void;
  getEmployeeHistory: (employeeId: string) => EmployeeHistory[];

  // Leave Policy Management
  policies: LeavePolicy[];
  updatePolicy: (id: string, updates: Partial<LeavePolicy>, reason?: string) => void;
  addPolicy: (policy: Omit<LeavePolicy, 'id'>) => void;
  deletePolicy: (id: string) => void;

  // Holiday Management
  holidays: Holiday[];
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  updateHoliday: (id: string, updates: Partial<Holiday>) => void;
  deleteHoliday: (id: string) => void;

  // Leave Adjustments
  adjustments: LeaveAdjustment[];
  adjustLeaveBalance: (employeeId: string, leaveType: LeaveType, days: number, reason: string, hrId: string, hrName: string) => void;
  getAdjustmentsByEmployee: (employeeId: string) => LeaveAdjustment[];

  // Audit Logs
  auditLogs: AuditLog[];
  getAuditLogsByEntity: (entityId: string) => AuditLog[];
  getAuditLogsByDateRange: (startDate: string, endDate: string) => AuditLog[];
  logAction: (action: string, entityType: string, entityId: string, entityDetails: string, performedBy: string, performedByName: string, newValue?: Record<string, any>, oldValue?: Record<string, any>) => void;

  // Reports
  getEmployeeLeaveReport: (employeeId: string, startDate?: string, endDate?: string) => any;
  getDepartmentLeaveReport: (department: string, startDate?: string, endDate?: string) => any;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [policies, setPolicies] = useState<LeavePolicy[]>(mockLeavePolicies);
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [adjustments, setAdjustments] = useState<LeaveAdjustment[]>(mockLeaveAdjustments);
  const [employeeHistory, setEmployeeHistory] = useState<EmployeeHistory[]>(mockEmployeeHistory);

  // Employee Management
  const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
    };
    setEmployees(prev => [...prev, newEmployee]);
    logAction('employee_add', 'employee', newEmployee.id, `New employee added: ${newEmployee.name}`, 'system', 'System', newEmployee);
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>, reason?: string) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    // Track history for role or status changes
    if (updates.role && updates.role !== employee.role) {
      const historyEntry: EmployeeHistory = {
        id: `eh-${Date.now()}`,
        employeeId: id,
        fieldChanged: 'role',
        oldValue: employee.role,
        newValue: updates.role,
        changedBy: 'system', // Should be passed from context
        changedByName: 'System',
        timestamp: new Date().toISOString(),
        reason,
      };
      setEmployeeHistory(prev => [...prev, historyEntry]);
    }

    if (updates.status && updates.status !== employee.status) {
      const historyEntry: EmployeeHistory = {
        id: `eh-${Date.now()}`,
        employeeId: id,
        fieldChanged: 'status',
        oldValue: employee.status,
        newValue: updates.status,
        changedBy: 'system',
        changedByName: 'System',
        timestamp: new Date().toISOString(),
        reason,
      };
      setEmployeeHistory(prev => [...prev, historyEntry]);
    }

    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    logAction('employee_change', 'employee', id, `Employee updated: ${employee.name}`, 'system', 'System', updates, employee);
  }, [employees]);

  const deactivateEmployee = useCallback((id: string, reason?: string) => {
    updateEmployee(id, { status: 'inactive' }, reason);
  }, [updateEmployee]);

  const activateEmployee = useCallback((id: string) => {
    updateEmployee(id, { status: 'active' });
  }, [updateEmployee]);

  const getEmployeeHistory = useCallback((employeeId: string) => {
    return employeeHistory.filter(h => h.employeeId === employeeId);
  }, [employeeHistory]);

  // Leave Policy Management
  const updatePolicy = useCallback((id: string, updates: Partial<LeavePolicy>, reason?: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;

    setPolicies(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    logAction('policy_change', 'policy', id, `Policy updated: ${policy.name}`, 'system', 'System', updates, policy);
  }, [policies]);

  const addPolicy = useCallback((policy: Omit<LeavePolicy, 'id'>) => {
    const newPolicy: LeavePolicy = {
      ...policy,
      id: `p-${Date.now()}`,
    };
    setPolicies(prev => [...prev, newPolicy]);
    logAction('policy_add', 'policy', newPolicy.id, `New policy added: ${newPolicy.name}`, 'system', 'System', newPolicy);
  }, []);

  const deletePolicy = useCallback((id: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;

    setPolicies(prev => prev.filter(p => p.id !== id));
    logAction('policy_delete', 'policy', id, `Policy deleted: ${policy.name}`, 'system', 'System', {}, policy);
  }, [policies]);

  // Holiday Management
  const addHoliday = useCallback((holiday: Omit<Holiday, 'id'>) => {
    const newHoliday: Holiday = {
      ...holiday,
      id: `h-${Date.now()}`,
    };
    setHolidays(prev => [...prev, newHoliday]);
    logAction('holiday_add', 'holiday', newHoliday.id, `Holiday added: ${newHoliday.name}`, 'system', 'System', newHoliday);
  }, []);

  const updateHoliday = useCallback((id: string, updates: Partial<Holiday>) => {
    const holiday = holidays.find(h => h.id === id);
    if (!holiday) return;

    setHolidays(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
    logAction('holiday_change', 'holiday', id, `Holiday updated: ${updates.name || holiday.name}`, 'system', 'System', updates, holiday);
  }, [holidays]);

  const deleteHoliday = useCallback((id: string) => {
    const holiday = holidays.find(h => h.id === id);
    if (!holiday) return;

    setHolidays(prev => prev.filter(h => h.id !== id));
    logAction('holiday_delete', 'holiday', id, `Holiday deleted: ${holiday.name}`, 'system', 'System', {}, holiday);
  }, [holidays]);

  // Leave Adjustments
  const adjustLeaveBalance = useCallback((employeeId: string, leaveType: LeaveType, days: number, reason: string, hrId: string, hrName: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const oldBalance = employee.leaveBalance[leaveType];
    const newBalance = oldBalance + days;

    // Update employee balance
    const updatedBalance = { ...employee.leaveBalance, [leaveType]: newBalance };
    setEmployees(prev => prev.map(e => (e.id === employeeId ? { ...e, leaveBalance: updatedBalance } : e)));

    // Create adjustment record
    const adjustment: LeaveAdjustment = {
      id: `adj-${Date.now()}`,
      employeeId,
      employeeName: employee.name,
      leaveType,
      days,
      reason,
      adjustedBy: hrId,
      adjustedByName: hrName,
      timestamp: new Date().toISOString(),
      oldBalance,
      newBalance,
    };
    setAdjustments(prev => [...prev, adjustment]);

    logAction('adjustment', 'adjustment', adjustment.id, `Leave adjustment: ${days > 0 ? '+' : ''}${days} ${leaveType}`, hrId, hrName, { days, reason, newBalance }, { oldBalance });
  }, [employees]);

  const getAdjustmentsByEmployee = useCallback((employeeId: string) => {
    return adjustments.filter(a => a.employeeId === employeeId);
  }, [adjustments]);

  // Audit Logs
  const logAction = useCallback((action: string, entityType: string, entityId: string, entityDetails: string, performedBy: string, performedByName: string, newValue?: Record<string, any>, oldValue?: Record<string, any>) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      action: action as any,
      entityType: entityType as any,
      entityId,
      entityDetails,
      performedBy,
      performedByName,
      timestamp: new Date().toISOString(),
      newValue,
      oldValue,
    };
    setAuditLogs(prev => [...prev, log]);
  }, []);

  const getAuditLogsByEntity = useCallback((entityId: string) => {
    return auditLogs.filter(log => log.entityId === entityId);
  }, [auditLogs]);

  const getAuditLogsByDateRange = useCallback((startDate: string, endDate: string) => {
    return auditLogs.filter(log => {
      const logDate = log.timestamp.split('T')[0];
      return logDate >= startDate && logDate <= endDate;
    });
  }, [auditLogs]);

  // Reports
  const getEmployeeLeaveReport = useCallback((employeeId: string, startDate?: string, endDate?: string) => {
    // This would aggregate leave data for a specific employee
    return {
      employeeId,
      report: 'Employee leave data',
    };
  }, []);

  const getDepartmentLeaveReport = useCallback((department: string, startDate?: string, endDate?: string) => {
    // This would aggregate leave data for a department
    return {
      department,
      report: 'Department leave data',
    };
  }, []);

  return (
    <HRContext.Provider value={{
      employees,
      addEmployee,
      updateEmployee,
      deactivateEmployee,
      activateEmployee,
      getEmployeeHistory,
      policies,
      updatePolicy,
      addPolicy,
      deletePolicy,
      holidays,
      addHoliday,
      updateHoliday,
      deleteHoliday,
      adjustments,
      adjustLeaveBalance,
      getAdjustmentsByEmployee,
      auditLogs,
      getAuditLogsByEntity,
      getAuditLogsByDateRange,
      logAction,
      getEmployeeLeaveReport,
      getDepartmentLeaveReport,
    }}>
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
