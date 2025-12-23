# HR/Admin Module - Quick Reference Guide

## 🎯 Features at a Glance

### 1. Employee Management (`/employees`)
| Feature | Details |
|---------|---------|
| **Add Employee** | Create new employees with role, department, team assignment |
| **Edit Employee** | Update employee information and roles |
| **Deactivate** | Disable employee access (requires reason) |
| **Activate** | Re-enable previously deactivated employees |
| **View History** | See all role and status changes with timestamps |
| **Access Control** | HR Admin only |

### 2. Leave Policies (`/policies`)
| Feature | Details |
|---------|---------|
| **Add Policy** | Create new leave type with quota settings |
| **Edit Policy** | Modify existing policy configurations |
| **Delete Policy** | Remove policy (careful - affects future leaves) |
| **Configure Carry Forward** | Set carry forward rules and limits |
| **Annual Quota** | Define days available per year |
| **Access Control** | HR Admin only |

### 3. Holiday Calendar (`/holidays`)
| Feature | Details |
|---------|---------|
| **Add Holiday** | Register company holidays with date and name |
| **Edit Holiday** | Modify holiday details |
| **Delete Holiday** | Remove holiday from calendar |
| **Holiday Types** | National, Regional, Optional classification |
| **Date Management** | Sort by date automatically |
| **Access Control** | HR Admin only |

### 4. Leave Adjustments (`/adjustments`)
| Feature | Details |
|---------|---------|
| **Credit/Debit** | Add or subtract leave days |
| **Mandatory Reason** | Must provide reason for compliance |
| **History** | View all adjustments per employee |
| **Balance Tracking** | See old and new balance |
| **Performer Info** | Shows who made the adjustment |
| **Access Control** | HR Admin only |
| **Audit Trail** | Automatically logged |

### 5. Reports (`/reports`)
| Feature | Details |
|---------|---------|
| **Employee-wise** | Individual employee leave statistics |
| **Department-wise** | Aggregate department leave data |
| **Date Filtering** | Filter by start and end date |
| **Leave Type Filter** | Filter specific leave types |
| **Summary Stats** | Total days and breakdown by type |
| **CSV Export** | Download report in CSV format |
| **Access Control** | HR Admin & Director |

### 6. Audit Logs (`/audit-logs`)
| Feature | Details |
|---------|---------|
| **All Actions Logged** | Approvals, rejections, adjustments, changes |
| **Read-Only Access** | Cannot edit or delete logs |
| **Date Filtering** | Filter by date range |
| **Detailed Viewer** | See old values, new values, performer |
| **Timestamp** | ISO format timestamp on all entries |
| **Action Types** | Approve, Reject, Adjustment, Employee Change, Policy Change, Holiday Change, Leave Cancel |
| **Access Control** | HR Admin only |

### 7. HR Dashboard (`/dashboard` for HR users)
| Feature | Details |
|---------|---------|
| **Statistics** | Total employees, active, policies, holidays |
| **Quick Access** | Buttons to all HR modules |
| **Charts** | Department distribution, Role distribution |
| **Policy Summary** | All policies at a glance |
| **Recent Activity** | Latest system changes |
| **Key Features** | Overview of capabilities |
| **Access Control** | HR Admin only |

---

## 🔑 Quick Navigation

```
For HR Admin User:
├── Dashboard
│   ├── Employee Management
│   ├── Leave Policy Management  
│   ├── Holiday Calendar
│   ├── Leave Adjustments
│   ├── Reports & Export
│   └── Audit Logs
└── Quick Actions (on Dashboard)
```

---

## 💡 Common Workflows

### Workflow 1: Onboarding a New Employee
1. Go to **Employees** → **Add Employee**
2. Fill in employee details (name, email, role, department)
3. Assign to team
4. Set join date
5. Click "Add Employee"
6. New employee created with default leave balance

### Workflow 2: Adjusting Leave Balance (Bonus/Correction)
1. Go to **Leave Adjustments** → **Adjust Balance**
2. Select employee
3. Choose leave type (Casual, Sick, Earned, etc.)
4. Enter positive number for credit, negative for debit
5. **Provide reason** (mandatory)
6. Click "Confirm Adjustment"
7. Change logged in audit trail

### Workflow 3: Updating Leave Policy
1. Go to **Leave Policies**
2. Find the policy to update
3. Click **Edit** button
4. Modify quota, carry forward rules, or description
5. Click "Update Policy"
6. Change automatically logged in audit

### Workflow 4: Reviewing Leave Report
1. Go to **Reports**
2. Select report type:
   - **Employee-wise**: Select specific employee
   - **Department-wise**: Select department
3. Apply filters (date range, leave type)
4. View summary and detailed data
5. Click "Export as CSV" to download

### Workflow 5: Deactivating an Employee
1. Go to **Employees**
2. Find the employee in the list
3. Click **Lock** (deactivate) icon
4. Enter reason for deactivation
5. Click "Deactivate"
6. Employee loses system access
7. Change tracked in employee history

### Workflow 6: Reviewing Audit Trail
1. Go to **Audit Logs**
2. (Optional) Filter by date range
3. View list of recent actions
4. Click **Eye** icon for action details
5. View old vs new values
6. See performer and timestamp

---

## ⚠️ Important Notes

### Data Retention
- Deactivated employees are not deleted (data retention policy)
- Audit logs are permanent and read-only
- Leave adjustments cannot be reversed (create opposite adjustment instead)

### Access Control
- Only users with `hr_admin` role can access HR pages
- Reports accessible to HR Admin and Directors
- Other roles get "Access Denied" message

### Mandatory Fields
- **Employee Deactivation**: Reason required
- **Leave Adjustment**: Reason required
- **Holiday**: Date and name required
- **Policy**: Name and quota required

### Automatic Logging
- Every HR action is automatically logged
- Old values and new values captured
- Performer (who made the change) tracked
- Timestamp in ISO format

---

## 📊 Available Reports

### Employee-wise Report
Shows:
- All approved leaves for specific employee
- Date range filtering
- Leave type breakdown
- Total days calculation

### Department-wise Report
Shows:
- All approved leaves by department
- Date range filtering
- Leave type breakdown
- Total days calculation

### CSV Export Format
```
Department Leave Report
Department: Engineering
Date Range: 2025-01-01 to 2025-12-31

Leave Details
Employee,Leave Type,Start Date,End Date,Days,Reason
John Smith,casual,2025-01-10,2025-01-12,3,"Vacation"
...

Summary
Leave Type,Days
Casual Leave,10
Sick Leave,5
Earned Leave,15
Total,30
```

---

## 🎯 Role Hierarchy

```
System Roles and Access:
┌─────────────────────────────────────┐
│ HR Admin                            │
│ - Full HR module access            │
│ - All CRUD operations              │
│ - Audit log access                 │
│ - Report access                    │
└─────────────────────────────────────┘
        │
        ├─→ Director
        │   - Report access only
        │   - View leave approvals
        │   - Approve final leaves
        │
        ├─→ Manager
        │   - Approve leaves
        │   - View team leaves
        │
        ├─→ Team Lead
        │   - Approve leaves
        │   - View team leaves
        │
        └─→ Employee
            - Apply leaves
            - View own balance
```

---

## 🔒 Security Best Practices

1. **Change Reasons**: Always provide business reason for adjustments
2. **Audit Review**: Regularly review audit logs for compliance
3. **Access Control**: Ensure only authorized users have HR credentials
4. **Data Privacy**: Don't share employee data beyond need-to-know
5. **Backup**: Data is critical - ensure regular backups

---

## 📞 Support & Troubleshooting

### Cannot see HR pages?
- Check user role is set to `hr_admin`
- Logout and login again
- Clear browser cache

### Adjustment not showing?
- Check audit logs for confirmation
- Verify employee selected correctly
- Check leave type selected

### Report shows no data?
- Verify date range includes approved leaves
- Check employee/department has leaves
- Try without date filter first

### Can't delete policy?
- Ensure no active leaves using this policy
- Check audit logs for recent usage

---

## 🔄 Change Log

### Version 1.0.0 (Production Release)
- ✅ Complete HR/Admin module
- ✅ Employee Management
- ✅ Leave Policy Management
- ✅ Holiday Calendar
- ✅ Leave Adjustments
- ✅ Reports & Export
- ✅ Audit Logs
- ✅ Role-Based Access Control

---

## 📚 Additional Resources

- **Full Documentation**: See `HR_ADMIN_IMPLEMENTATION.md`
- **Data Models**: Check `src/types/leave.ts`
- **Context Code**: See `src/contexts/HRContext.tsx`
- **Mock Data**: View `src/data/mockData.ts`

---

**Last Updated**: December 23, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
