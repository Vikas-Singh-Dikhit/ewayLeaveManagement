import React, { createContext, useContext, useState, useCallback } from 'react';
import { LeaveRequest, LeaveBalance, LeaveStatus, ApprovalStage } from '@/types/leave';
import { mockLeaveRequests, mockLeaveBalance } from '@/data/mockData';

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  leaveBalance: LeaveBalance;
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'status' | 'currentStage' | 'appliedOn' | 'approvals'>) => void;
  approveRequest: (requestId: string, approverId: string, approverName: string, comment?: string) => void;
  rejectRequest: (requestId: string, approverId: string, approverName: string, comment: string) => void;
  cancelRequest: (requestId: string) => void;
  getRequestsByStage: (stage: ApprovalStage) => LeaveRequest[];
  getRequestsByEmployee: (employeeId: string) => LeaveRequest[];
  getPendingCount: (stage: ApprovalStage) => number;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [leaveBalance] = useState<LeaveBalance>(mockLeaveBalance);

  const applyLeave = useCallback((request: Omit<LeaveRequest, 'id' | 'status' | 'currentStage' | 'appliedOn' | 'approvals'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: `lr-${Date.now()}`,
      status: 'pending',
      currentStage: 'team_lead',
      appliedOn: new Date().toISOString().split('T')[0],
      approvals: [
        { stage: 'team_lead', approverId: '', approverName: '', status: 'pending' },
      ],
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  }, []);

  const getNextStage = (currentStage: ApprovalStage): ApprovalStage | null => {
    const stages: ApprovalStage[] = ['team_lead', 'manager', 'director', 'completed'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  const approveRequest = useCallback((requestId: string, approverId: string, approverName: string, comment?: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const updatedApprovals = req.approvals.map(a => 
        a.stage === req.currentStage 
          ? { ...a, approverId, approverName, status: 'approved' as const, comment, timestamp: new Date().toISOString() }
          : a
      );

      const nextStage = getNextStage(req.currentStage);
      
      if (nextStage === 'completed') {
        return {
          ...req,
          status: 'approved' as LeaveStatus,
          currentStage: 'completed',
          approvals: updatedApprovals,
        };
      }

      return {
        ...req,
        currentStage: nextStage!,
        approvals: [
          ...updatedApprovals,
          { stage: nextStage!, approverId: '', approverName: '', status: 'pending' as const },
        ],
      };
    }));
  }, []);

  const rejectRequest = useCallback((requestId: string, approverId: string, approverName: string, comment: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const updatedApprovals = req.approvals.map(a => 
        a.stage === req.currentStage 
          ? { ...a, approverId, approverName, status: 'rejected' as const, comment, timestamp: new Date().toISOString() }
          : a
      );

      return {
        ...req,
        status: 'rejected' as LeaveStatus,
        approvals: updatedApprovals,
      };
    }));
  }, []);

  const cancelRequest = useCallback((requestId: string) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'cancelled' as LeaveStatus } : req
    ));
  }, []);

  const getRequestsByStage = useCallback((stage: ApprovalStage) => {
    return leaveRequests.filter(req => req.currentStage === stage && req.status === 'pending');
  }, [leaveRequests]);

  const getRequestsByEmployee = useCallback((employeeId: string) => {
    return leaveRequests.filter(req => req.employeeId === employeeId);
  }, [leaveRequests]);

  const getPendingCount = useCallback((stage: ApprovalStage) => {
    return leaveRequests.filter(req => req.currentStage === stage && req.status === 'pending').length;
  }, [leaveRequests]);

  return (
    <LeaveContext.Provider value={{
      leaveRequests,
      leaveBalance,
      applyLeave,
      approveRequest,
      rejectRequest,
      cancelRequest,
      getRequestsByStage,
      getRequestsByEmployee,
      getPendingCount,
    }}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
