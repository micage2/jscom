// registry.js

/**
 * Contract for instance factories (ctors)
 * For specialized registries this could be extended
 * @typedef {Object} IInstance
 * @property {function(): any} getData
 * @property {function(): string} getClassId
 */


function createUniqueId() {
    return "CLS_" + Math.random().toString(36).slice(2, 11);
}

function createRegistryInterface(state) {
    const { klasses } = state;

    return {
        create(clsid, args = {}, role) {
            const entry = klasses.get(clsid);
            if (!entry) {
                console.warn(`No component registered for ${clsid}`);
                return null;
            }

            /** @type {IInstance} */
            const instance = entry.ctor(args);
            if (!instance) return null;

            const as = (r) => {
                const factory = entry.role_ctor(r);
                if (!factory) return null;
                const iface = factory({data: instance.getData()});
                iface.as = as;  // allow chaining
                return iface;
            };

            return as(role);
        },

        register(ctor, role_ctor) {
            if (typeof role_ctor !== "function") {
                throw new Error("role_ctor must be a function(role) => interface factory");
            }
            const clsid = createUniqueId();
            klasses.set(clsid, { ctor, role_ctor });
            return clsid;
        },
    };
}


// ────────────────────────────────────────────────
// Root (singleton) registry

const klasses = new Map();

function registryRoleCtor(role) {
    switch (role) {
        case "IRegistry":
            return () => createRegistryInterface({ klasses });
        default:
            return null;
    }
}

const root = createRegistryInterface({ klasses });

const REGISTRY_CLSID = root.register(
    () => root,
    registryRoleCtor,
    { defaultRole: "IRegistry" }
);

export const Registry = root;
export default REGISTRY_CLSID;