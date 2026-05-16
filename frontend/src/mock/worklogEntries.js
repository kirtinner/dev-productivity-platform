export const worklogEntries = [
    {
        id: 1,
        clientId: 101,
        clientName: "Acme Finance",
        taskId: 1001,
        taskName: "Invoice export validation",
        date: "2026-05-11",
        hours: 2.5,
        totalTaskHours: 18.0,
        comment: "Validated invoice export edge cases for empty tax fields and multi-currency totals. Checked generated CSV structure against accounting import requirements and documented mismatches for backend follow-up."
    },
    {
        id: 2,
        clientId: 102,
        clientName: "Northwind Retail",
        taskId: 1002,
        taskName: "Dashboard filters",
        date: "2026-05-11",
        hours: 1.75,
        totalTaskHours: 9.25,
        comment: "Reviewed dashboard filter behavior with saved user preferences. Confirmed date range persistence and identified a small UI state issue when switching between client scopes."
    },
    {
        id: 3,
        clientId: 101,
        clientName: "Acme Finance",
        taskId: 1003,
        taskName: "Auth token refresh",
        date: "2026-05-12",
        hours: 3.0,
        totalTaskHours: 12.5,
        comment: "Investigated token refresh timing and session recovery flow. Added notes for future API persistence around expired token handling and user-facing retry behavior."
    },
    {
        id: 4,
        clientId: 103,
        clientName: "Globex Operations",
        taskId: 1004,
        taskName: "Timesheet review states",
        date: "2026-05-12",
        hours: 0.75,
        totalTaskHours: 6.0,
        comment: "Mapped review state transitions for submitted, approved, and rejected entries. Clarified which states should remain editable by the employee."
    },
    {
        id: 5,
        clientId: 104,
        clientName: "Vertex Health",
        taskId: 1005,
        taskName: "Report layout polish",
        date: "2026-05-13",
        hours: 1.25,
        totalTaskHours: 4.75,
        comment: "Adjusted report spacing and reviewed table density for business users. Focused on making exported summaries easier to scan without increasing page count."
    },
    {
        id: 6,
        clientId: 102,
        clientName: "Northwind Retail",
        taskId: 1006,
        taskName: "Calendar empty state",
        date: "2026-05-13",
        hours: 0.5,
        totalTaskHours: 2.5,
        comment: "Prepared empty state copy and layout notes for days without worklog entries. Kept the message neutral and compact for use inside the monthly calendar view."
    }
];
