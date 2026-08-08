import api from './axios';
import type { AuthResponse, SignupPayload, LoginPayload, User } from '../types/auth';

// ===== Auth =====
export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/signup', payload);
  return data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};

// Community admin invites a resident — creates account + sends email with credentials
export const inviteResident = async (payload: { name: string; email: string; householdId?: number }) => {
  const { data } = await api.post('/auth/invite-resident', payload);
  return data;
};

// Resident completes profile on first login
export const completeProfile = async (payload: {
  name: string;
  phone: string;
  gender?: string;
  age?: number;
  alternativeEmail?: string;
}) => {
  const { data } = await api.post('/auth/complete-profile', payload);
  return data;
};

// Change password
export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  await api.post('/auth/change-password', payload);
};

// Main Admin: pending approvals
export const getPendingApprovals = async () => {
  const { data } = await api.get('/auth/pending-approvals');
  return data;
};

// Main Admin: approve or reject a community admin
export const approveOrRejectAdmin = async (adminId: number, payload: { action: string; rejectionReason?: string }) => {
  const { data } = await api.put(`/auth/approve/${adminId}`, payload);
  return data;
};

// ===== Dashboard Summaries =====
export const getUserSummary = async () => {
  const { data } = await api.get('/dashboard/user/summary');
  return data;
};

export const getAdminSummary = async () => {
  const { data } = await api.get('/dashboard/admin/summary');
  return data;
};

export const getMainAdminSummary = async () => {
  const { data } = await api.get('/dashboard/main-admin/summary');
  return data;
};

// ===== User Management =====
export const getCommunityAdmins = async () => {
  const { data } = await api.get('/dashboard/main-admin/admins');
  return data;
};

export const getAllResidents = async () => {
  const { data } = await api.get('/dashboard/main-admin/users');
  return data;
};

// Community admin: returns ONLY residents they manage
export const getResidents = async () => {
  const { data } = await api.get('/dashboard/admin/residents');
  return data;
};

export const getMyResidents = async () => {
  const { data } = await api.get('/api/users/my-residents');
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get('/api/users');
  return data;
};

export const getUsersByRole = async (role: string) => {
  const { data } = await api.get(`/api/users/role/${role}`);
  return data;
};

export const updateUser = async (id: number, payload: { name: string; enabled?: boolean }) => {
  const { data } = await api.put(`/api/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/api/users/${id}`);
};

// ===== Apartments =====
export const getApartments = async () => {
  const { data } = await api.get('/api/apartments');
  return data;
};

export const getApartmentsByAdmin = async (adminId: number) => {
  const { data } = await api.get(`/api/apartments/admin/${adminId}`);
  return data;
};

export const createApartment = async (payload: { name: string; address?: string; adminId?: number }) => {
  const { data } = await api.post('/api/apartments', payload);
  return data;
};

export const updateApartment = async (id: number, payload: { name: string; address?: string; adminId?: number; baseRate?: number | null; higherRate?: number | null }) => {
  const { data } = await api.put(`/api/apartments/${id}`, payload);
  return data;
};

export const createUser = async (payload: any) => {
  const { data } = await api.post('/api/users', payload);
  return data;
};

export const deleteApartment = async (id: number) => {
  await api.delete(`/api/apartments/${id}`);
};

// ===== Households =====
export const getHouseholds = async () => {
  const { data } = await api.get('/api/households');
  return data;
};

export const getHouseholdsByApartment = async (apartmentId: number) => {
  const { data } = await api.get(`/api/households/apartment/${apartmentId}`);
  return data;
};

export const getHouseholdsByResident = async (residentId: number) => {
  const { data } = await api.get(`/api/households/resident/${residentId}`);
  return data;
};

export const createHousehold = async (payload: { unitNumber: string; apartmentId: number; residentId?: number }) => {
  const { data } = await api.post('/api/households', payload);
  return data;
};

export const updateHousehold = async (id: number, payload: { unitNumber: string; apartmentId: number; residentId?: number }) => {
  const { data } = await api.put(`/api/households/${id}`, payload);
  return data;
};

export const deleteHousehold = async (id: number) => {
  await api.delete(`/api/households/${id}`);
};

// ===== Water Usage =====
export const getWaterUsage = async (month?: string) => {
  const { data } = await api.get('/api/water-usage', { params: month ? { month } : {} });
  return data;
};

export const getWaterUsageByHousehold = async (householdId: number) => {
  const { data } = await api.get(`/api/water-usage/household/${householdId}`);
  return data;
};

export const getWaterUsageByUser = async (userId: number) => {
  const { data } = await api.get(`/api/water-usage/user/${userId}`);
  return data;
};

export const getWaterUsageByUserAndMonth = async (userId: number, month: string) => {
  const { data } = await api.get(`/api/water-usage/user/${userId}/month/${month}`);
  return data;
};

export const logWaterUsage = async (payload: { householdId: number; readingDate: string; liters: number; meterSerialNumber?: string }) => {
  const { data } = await api.post('/api/water-usage', payload);
  return data;
};

export const updateWaterUsage = async (id: number, payload: { householdId: number; readingDate: string; liters: number; meterSerialNumber?: string }) => {
  const { data } = await api.put(`/api/water-usage/${id}`, payload);
  return data;
};

export const deleteWaterUsage = async (id: number) => {
  await api.delete(`/api/water-usage/${id}`);
};

export const uploadCsv = async (householdId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/api/water-usage/upload-csv/${householdId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ===== Tariff Plans =====
export const getTariffs = async () => {
  const { data } = await api.get('/api/tariffs');
  return data;
};

export const getActiveTariff = async () => {
  const { data } = await api.get('/api/tariffs/active');
  return data;
};

export const createTariff = async (payload: any) => {
  const { data } = await api.post('/api/tariffs', payload);
  return data;
};

export const updateTariff = async (id: number, payload: any) => {
  const { data } = await api.put(`/api/tariffs/${id}`, payload);
  return data;
};

export const deleteTariff = async (id: number) => {
  await api.delete(`/api/tariffs/${id}`);
};

// ===== Billing =====
export const getMyBills = async () => {
  const { data } = await api.get('/api/billing/my-bills');
  return data;
};

export const getMyBill = async (month: string) => {
  const { data } = await api.get(`/api/billing/my-bill/${month}`);
  return data;
};

export const getHouseholdBills = async (month?: string) => {
  const { data } = await api.get('/api/billing/household-bills', { params: month ? { month } : {} });
  return data;
};

export const getBillingCycles = async () => {
  const { data } = await api.get('/api/billing/cycles');
  return data;
};

// Main Admin: billing cycle lifecycle management (open -> finalize -> archive)
export const createBillingCycle = async (payload: { name: string; startDate: string; endDate: string; dueDate: string }) => {
  const { data } = await api.post('/api/billing/cycles', payload);
  return data;
};

export const deleteBillingCycle = async (id: number) => {
  await api.delete(`/api/billing/cycles/${id}`);
};

export const finalizeBillingCycle = async (id: number) => {
  const { data } = await api.post(`/api/billing/cycles/${id}/finalize`);
  return data;
};

export const archiveBillingCycle = async (id: number) => {
  const { data } = await api.post(`/api/billing/cycles/${id}/archive`);
  return data;
};

export const payBill = async (billId: number) => {
  const { data } = await api.post(`/api/billing/pay/${billId}`);
  return data;
};

export const payBillByMonth = async (householdId: number, month: string) => {
  const { data } = await api.post(`/api/billing/pay/household/${householdId}/month/${month}`);
  return data;
};
export const getNotifications = async () => { const { data } = await api.get('/api/notifications/my'); return data; };
export const getUsageAlerts = async () => { const { data } = await api.get('/api/alerts/my'); return data; };

// ===== Reports =====
export const getResidentReport = async () => {
  const { data } = await api.get('/api/reports/resident');
  return data;
};

export const getAdminReport = async () => {
  const { data } = await api.get('/api/reports/admin');
  return data;
};

export const getMainAdminReport = async () => {
  const { data } = await api.get('/api/reports/main-admin');
  return data;
};

// ===== Support Tickets =====
export const raiseSupportTicket = async (payload: { subject: string; description: string; category?: string }) => {
  const { data } = await api.post('/api/support-tickets', payload);
  return data;
};

export const getMySupportTickets = async () => {
  const { data } = await api.get('/api/support-tickets/mine');
  return data;
};

export const getAllSupportTickets = async (status?: string) => {
  const { data } = await api.get('/api/support-tickets', { params: status ? { status } : {} });
  return data;
};

export const respondToSupportTicket = async (id: number, payload: { response?: string; status?: string }) => {
  const { data } = await api.put(`/api/support-tickets/${id}/respond`, payload);
  return data;
};
