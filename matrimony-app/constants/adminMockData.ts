export type AdminUserRecord = {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'pending' | 'blocked';
  registeredAt: string;
};

export type AdminApprovalRecord = {
  id: string;
  name: string;
  phone: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type AdminNotificationRecord = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const adminDashboardStats = {
  totalUsers: 1284,
  pendingApprovals: 23,
  activeToday: 156,
  newRegistrations: 18,
};

export const adminApprovals: AdminApprovalRecord[] = [
  { id: 'P-501', name: 'Kavitha M', phone: '9876001234', submittedAt: '13 Mar 2026', status: 'pending' },
  { id: 'P-502', name: 'Ramesh P', phone: '8765432109', submittedAt: '13 Mar 2026', status: 'pending' },
  { id: 'P-503', name: 'Meena T', phone: '9654321098', submittedAt: '12 Mar 2026', status: 'pending' },
  { id: 'P-504', name: 'Balaji K', phone: '9543210987', submittedAt: '11 Mar 2026', status: 'approved' },
];

export const adminNotifications: AdminNotificationRecord[] = [
  {
    id: 'N-1',
    title: 'New profile submitted',
    body: 'Kavitha M submitted a biodata for review.',
    time: '10 min ago',
    read: false,
  },
  {
    id: 'N-2',
    title: 'User registration spike',
    body: '18 new users registered in the last 24 hours.',
    time: '2 hr ago',
    read: false,
  },
  {
    id: 'N-3',
    title: 'Profile approved',
    body: 'Balaji K profile was approved successfully.',
    time: 'Yesterday',
    read: true,
  },
];
