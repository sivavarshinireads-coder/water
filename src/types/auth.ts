export type Role = 'MAIN_ADMIN' | 'COMMUNITY_ADMIN' | 'RESIDENT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  approvalStatus?: string;
  profileCompleted?: boolean;
  phone?: string;
  gender?: string;
  age?: number;
  alternativeEmail?: string;
  communityAdminId?: number;
  communityAdminName?: string;
  communityAdminCode?: string;
  adminCode?: string;
  residentCode?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofImage?: string;
  rejectionReason?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: Role;
  communityAdminId?: number;
  communityAdminCode?: string;
  adminCode?: string;
  residentCode?: string;
  approvalStatus?: string;
  profileCompleted?: boolean;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  apartmentName: string;
  apartmentAddress: string;
  idProofType: string;
  idProofNumber: string;
  idProofImage: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
