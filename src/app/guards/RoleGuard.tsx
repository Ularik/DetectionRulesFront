'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { roleDashboardPaths, routes, type UserRole } from '@/shared/config';
import { useMe } from '@/services/users/usersQueries';

type Props = {
    children: ReactNode;
    roles: UserRole[];
};

// Раздел → роль, которой он принадлежит
const sectionRoles: [string, UserRole][] = [
    [routes.admin, 'ADMIN'],
    [routes.analyst, 'ANALYST'],
    [routes.viewer, 'VIEWER'],
];

const isForeignSection = (pathname: string, role: UserRole) =>
    sectionRoles.some(
        ([section, sectionRole]) => pathname.startsWith(section) && role !== sectionRole,
    );

export const RoleGuard = ({ children, roles }: Props) => {
    const router = useRouter();
    const pathname = usePathname();

    const { data: user, isLoading } = useMe();

    useEffect(() => {
        if (isLoading) return;

        if (!user || !roles.includes(user.role)) {
            router.replace(routes.login);
            return;
        }

        if (isForeignSection(pathname, user.role)) {
            router.replace(roleDashboardPaths[user.role]);
        }
    }, [isLoading, pathname, roles, router, user]);

    if (isLoading || !user) {
        return null;
    }

    if (!roles.includes(user.role) || isForeignSection(pathname, user.role)) {
        return null;
    }

    return <>{children}</>;
};
