import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  CalendarDays, 
  Users, 
  FileCheck, 
  Settings, 
  LogOut,
  Building2,
  FileText,
  Calendar,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import { ROLE_LABELS } from '@/types/leave';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuth();
  const { getPendingCount } = useLeave();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const baseItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    switch (user.role) {
      case 'employee':
        return [
          ...baseItems,
          { to: '/apply-leave', icon: CalendarPlus, label: 'Apply Leave' },
          { to: '/my-leaves', icon: CalendarDays, label: 'My Leaves' },
          { to: '/calendar', icon: Calendar, label: 'Calendar' },
        ];
      case 'team_lead':
        return [
          ...baseItems,
          { to: '/apply-leave', icon: CalendarPlus, label: 'Apply Leave' },
          { to: '/my-leaves', icon: CalendarDays, label: 'My Leaves' },
          { to: '/approvals', icon: FileCheck, label: 'Approvals', badge: getPendingCount('team_lead') },
          { to: '/team', icon: Users, label: 'My Team' },
          { to: '/calendar', icon: Calendar, label: 'Team Calendar' },
        ];
      case 'manager':
        return [
          ...baseItems,
          { to: '/apply-leave', icon: CalendarPlus, label: 'Apply Leave' },
          { to: '/my-leaves', icon: CalendarDays, label: 'My Leaves' },
          { to: '/approvals', icon: FileCheck, label: 'Approvals', badge: getPendingCount('manager') },
          { to: '/teams', icon: Users, label: 'Teams Overview' },
          { to: '/calendar', icon: Calendar, label: 'Calendar' },
        ];
      case 'director':
        return [
          ...baseItems,
          { to: '/approvals', icon: FileCheck, label: 'Final Approvals', badge: getPendingCount('director') },
          { to: '/company-calendar', icon: Calendar, label: 'Company Calendar' },
          { to: '/reports', icon: FileText, label: 'Reports' },
          { to: '/departments', icon: Building2, label: 'Departments' },
        ];
      case 'hr_admin':
        return [
          ...baseItems,
          { to: '/employees', icon: Users, label: 'Employees' },
          { to: '/policies', icon: FileText, label: 'Leave Policies' },
          { to: '/holidays', icon: Calendar, label: 'Holidays' },
          { to: '/reports', icon: FileText, label: 'Reports' },
          { to: '/settings', icon: UserCog, label: 'Settings' },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">LeaveMS</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* User Info */}
      <div className={cn(
        "p-4 border-b border-sidebar-border",
        collapsed && "flex justify-center"
      )}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{ROLE_LABELS[user.role]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
              isActive 
                ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {'badge' in item && item.badge && item.badge > 0 && (
              <Badge 
                className={cn(
                  "ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-5 flex items-center justify-center",
                  collapsed && "absolute -top-1 -right-1"
                )}
              >
                {item.badge}
              </Badge>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
        >
          <Bell className="w-5 h-5" />
          {!collapsed && <span className="ml-3 text-sm">Notifications</span>}
        </Button>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className={cn(
            "w-full text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3 text-sm">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};
