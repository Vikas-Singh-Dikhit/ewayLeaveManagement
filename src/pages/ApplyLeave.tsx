import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { LeaveApplicationForm } from '@/components/leave/LeaveApplicationForm';
import { LeaveBalanceCards } from '@/components/leave/LeaveBalanceCards';
import { useLeave } from '@/contexts/LeaveContext';
import { useNavigate } from 'react-router-dom';

const ApplyLeave: React.FC = () => {
  const { leaveBalance } = useLeave();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave request"
      />
      
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Current Balance</h3>
        <LeaveBalanceCards balance={leaveBalance} />
      </div>

      <LeaveApplicationForm onSuccess={() => navigate('/my-leaves')} />
    </div>
  );
};

export default ApplyLeave;
