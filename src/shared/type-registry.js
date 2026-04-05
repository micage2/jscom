// src/shared/type-registry.js
//
// Maps data type ids to component clsids.
// Two-level lookup: layout config override wins over registered default.
//
// Usage:
//   TypeRegistry.registerDefault('float', CLSID_FloatEdit);
//   const clsid = TypeRegistry.resolve('float');           // → CLSID_FloatEdit
//   const clsid = TypeRegistry.resolve('float', MY_CLSID); // → MY_CLSID (layout override)

const defaults = new Map();  // typeId → clsid

export const TypeRegistry = {

    registerDefault(typeId, clsid) {
        if (defaults.has(typeId)) {
            console.warn(`[TypeRegistry] Overwriting default for '${typeId}'`);
        }
        defaults.set(typeId, clsid);
    },

    // layoutHint is the optional clsid from the layout config binding.
    // If provided, it wins unconditionally.
    resolve(typeId, layoutHint = null) {
        if (layoutHint) return layoutHint;
        const clsid = defaults.get(typeId);
        if (!clsid) {
            console.warn(`[TypeRegistry] No component registered for type '${typeId}'`);
        }
        return clsid ?? null;
    },

    has(typeId) {
        return defaults.has(typeId);
    },

    // For debugging
    dump() {
        console.table([...defaults.entries()].map(([typeId, clsid]) => ({ typeId, clsid })));
    }
};
