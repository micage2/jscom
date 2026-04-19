// src/shared/type-registry.js
//
// Maps data type ids to component clsids.
// Two-level lookup: layout config override wins over registered default.
//
// Usage:
//   TypeRegistry.register('float', CLSID_FloatEdit);
//   const clsid = TypeRegistry.resolve('float'); // → CLSID_FloatEdit

import PROPSTRING from '../dom-comps/prop-string.js'
import PROPFLOAT from '../dom-comps/prop-float.js'

const defaults = new Map();  // data typeId → view clsid

export const TypeRegistry = {

    register(typeId, clsid) {
        if (defaults.has(typeId)) {
            console.warn(`[TypeRegistry] Overwriting default for '${typeId}'`);
        }
        defaults.set(typeId, clsid);
    },

    resolve(typeId) {
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

TypeRegistry.register('string', PROPSTRING);
TypeRegistry.register('number', PROPFLOAT);