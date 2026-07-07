import { useAuthContext } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';

const useAuthRoles = () => {
    const { userInfo } = useAuthContext();
    const role = userInfo?.role || ROLES.USER;

    return {
        role,
        isAdmin: role === ROLES.ADMIN,
        isSupervisor: role === ROLES.SUPERVISOR,
        isUser: role === ROLES.USER,
        isAdminOrSupervisor: role === ROLES.ADMIN || role === ROLES.SUPERVISOR,
        userInfo
    };
};

export default useAuthRoles;
