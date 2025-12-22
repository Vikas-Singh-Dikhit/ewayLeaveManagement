import React from 'react';
import { LeaveBalance, LeaveType, LEAVE_TYPE_LABELS } from '@/types/leave';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Briefcase, ThermometerSun, Award, Home, Gift } from 'lucide-react';

interface LeaveBalanceCardsProps {
  balance: LeaveBalance;
  className?: string;
}

const leaveTypeConfig: Record<LeaveType, { icon: React.ElementType; colorClass: string }> = {
  casual: { icon: Briefcase, colorClass: 'bg-info/10 text-info border-info/20' },
  sick: { icon: ThermometerSun, colorClass: 'bg-warning/10 text-warning border-warning/20' },
  earned: { icon: Award, colorClass: 'bg-success/10 text-success border-success/20' },
  wfh: { icon: Home, colorClass: 'bg-primary/10 text-primary border-primary/20' },
  comp_off: { icon: Gift, colorClass: 'bg-accent text-accent-foreground border-accent' },
};

export const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({ balance, className }) => {
  const leaveTypes: LeaveType[] = ['casual', 'sick', 'earned', 'wfh', 'comp_off'];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", className)}>
      {leaveTypes.map((type) => {
        const config = leaveTypeConfig[type];
        const Icon = config.icon;
        const value = balance[type];

        return (
          <Card
            key={type}
            className={cn(
              "p-4 border transition-all hover:shadow-md animate-fade-in",
              config.colorClass
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/50">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium opacity-80">{LEAVE_TYPE_LABELS[type]}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
