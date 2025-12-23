import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LeaveProvider } from "@/contexts/LeaveContext";
import { HRProvider } from "@/contexts/HRContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import Approvals from "./pages/Approvals";
import EmployeeManagement from "./pages/EmployeeManagement";
import LeavePolicyManagement from "./pages/LeavePolicyManagement";
import HolidayManagement from "./pages/HolidayManagement";
import LeaveAdjustments from "./pages/LeaveAdjustments";
import AuditLogs from "./pages/AuditLogs";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LeaveProvider>
          <HRProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="apply-leave" element={<ApplyLeave />} />
                  <Route path="my-leaves" element={<MyLeaves />} />
                  <Route path="approvals" element={<Approvals />} />
                  <Route path="calendar" element={<Dashboard />} />
                  <Route path="team" element={<Dashboard />} />
                  <Route path="teams" element={<Dashboard />} />
                  <Route path="company-calendar" element={<Dashboard />} />
                  <Route path="employees" element={<EmployeeManagement />} />
                  <Route path="policies" element={<LeavePolicyManagement />} />
                  <Route path="holidays" element={<HolidayManagement />} />
                  <Route path="adjustments" element={<LeaveAdjustments />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="departments" element={<Dashboard />} />
                  <Route path="settings" element={<Dashboard />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </HRProvider>
        </LeaveProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
