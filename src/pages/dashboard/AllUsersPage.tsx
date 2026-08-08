import React from 'react';
import UserListPage from '../../components/UserListPage';
import { getUsersByRole } from '../../api/auth';

const AllUsersPage: React.FC = () => (
  <UserListPage
    title="All Users"
    subtitle="View and manage all registered residents across the system"
    fetchFn={() => getUsersByRole('RESIDENT')}
    showRole
    canEdit
    canDelete
  />
);

export default AllUsersPage;
