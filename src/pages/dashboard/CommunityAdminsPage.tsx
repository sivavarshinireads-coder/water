import React from 'react';
import UserListPage from '../../components/UserListPage';
import { getUsersByRole } from '../../api/auth';

const CommunityAdminsPage: React.FC = () => (
  <UserListPage
    title="Community Admins"
    subtitle="Manage all community admin accounts — edit, enable/disable, or delete"
    fetchFn={() => getUsersByRole('COMMUNITY_ADMIN')}
    showRole
    canEdit
    canDelete
    addLabel="Add Admin"
    showAddAdmin
  />
);

export default CommunityAdminsPage;
