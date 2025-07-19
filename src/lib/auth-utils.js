export const AUTH_ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    BUYER_DASHBOARD: '/buyer/dashboard',
    PANGKALAN_DASHBOARD: '/pangkalan/dashboard'
};

export const redirectByRole = (router, user) => {
    if (!user) {
        router.push(AUTH_ROUTES.LOGIN);
        return;
    }

    switch (user.role) {
        case 'pangkalan':
            router.push(AUTH_ROUTES.PANGKALAN_DASHBOARD);
            break;
        case 'user':
        case 'buyer':
        default:
            router.push(AUTH_ROUTES.BUYER_DASHBOARD);
            break;
    }
};

export const isProtectedRoute = (pathname) => {
    return pathname.startsWith('/buyer') || pathname.startsWith('/pangkalan');
};

export const isAuthRoute = (pathname) => {
    return pathname === '/login' || pathname === '/register' || pathname === '/';
};