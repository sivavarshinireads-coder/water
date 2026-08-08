export const adminCode = (user?: { adminCode?: string; communityAdminCode?: string; userCode?: string; id?: number } | null) =>
  user?.adminCode || user?.communityAdminCode || user?.userCode ||
  (user?.id == null ? 'Unassigned' : `ADM${String(user.id).padStart(3, '0')}`);

export const residentCode = (user?: { residentCode?: string; userCode?: string; communityAdminCode?: string; communityAdminId?: number; id?: number } | null) => {
  if (user?.residentCode) return user.residentCode;
  if (user?.userCode) return user.userCode;
  if (user?.id == null) return 'Unassigned';
  const parentAdmin = user?.communityAdminCode || (user?.communityAdminId ? `ADM${String(user.communityAdminId).padStart(3, '0')}` : 'ADM001');
  return `${parentAdmin}-R${String(user.id).padStart(3, '0')}`;
};
