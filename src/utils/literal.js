const obj = new Proxy(
    {},
    {
        get(target, prop) {
            return prop.toString();
        },
    }
);

export default obj;
