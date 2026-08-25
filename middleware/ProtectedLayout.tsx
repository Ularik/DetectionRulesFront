'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { roleDashboardPaths } from '@/constants/main';
import type { UserRole } from '@/types/users';
import { useMe } from '@/services/users/usersQueries';

type Props = {
    children: ReactNode;
    roles: UserRole[];
};

const ProtectedLayout = ({ children, roles }: Props) => {
    const router = useRouter();
    const pathname = usePathname();

    const { data: user, isLoading } = useMe();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        if (!roles.includes(user.role)) {
          router.replace("/login");
          return;
        }

        if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
            router.replace(roleDashboardPaths[user.role]);
            return;
        }

        if (pathname.startsWith('/analyst') && (user.role !== 'ANALYST')) {
            router.replace(roleDashboardPaths[user.role]);
        }

        if (pathname.startsWith('/viewer') && (user.role !== 'VIEWER')) {
            router.replace(roleDashboardPaths[user.role]);
        }

    }, [isLoading, pathname, roles, router, user]);

    if (isLoading || !user) {
        return null;
    }

    if (!roles.includes(user.role)) {
        return null;
    }

    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
        return null;
    }

    if (pathname.startsWith('/analyst') && (user.role !== 'ANALYST')) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedLayout;