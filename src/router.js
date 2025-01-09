export const router = (() => {
    const routes = [];

    const register = (path, callback) => {
        const keys = [];
        const regex = pathToRegex(path, keys);
        routes.push({ regex, keys, callback });
    };

    const navigate = (path) => {
        window.history.pushState({}, path, window.location.origin + path);
        render();
    };

    const render = () => {
        const path = window.location.pathname;
        for (const route of routes) {
            const match = route.regex.exec(path);
            if (match) {
                const params = getParams(match, route.keys);
                route.callback(params);
                return;
            }
        }
        // If no route matches, call the 404 route if defined
        const notFoundRoute = routes.find(
            (route) => route.regex.source === '^\\/404$'
        );
        if (notFoundRoute) notFoundRoute.callback();
    };

    const pathToRegex = (path, keys) => {
        const regex = path.replace(/:(\w+)/g, (_, key) => {
            keys.push(key);
            return '([^\\/]+)';
        });
        return new RegExp(`^${regex}$`);
    };

    const getParams = (match, keys) => {
        const params = {};
        keys.forEach((key, index) => {
            params[key] = match[index + 1];
        });
        return params;
    };

    window.onpopstate = render;

    return { register, navigate };
})();
