function inferType(value) {
    if (value === null) {
        return null;  // Signal that type inference failed
    }
    if (Array.isArray(value)) return 'array';
    if (value === undefined) return 'group';
    if (typeof value === 'object') return 'group';
    return typeof value;
}

export class _TypeRegistry {
    #types = new Map();

    constructor() {
        if (typeof window !== 'undefined') {
            window.$$$ = { Types: this.#types };
        };

    }

    register(type, PropertyClass) {
        this.#types.set(type, PropertyClass);
        return type;
    }

    create(params) {
        let { name, type, value } = params;
        console.assert(name, '[TypeRegistry.create]', 'No name field.', params);

        if (type === undefined) {
            type = inferType(value);
            
            if (type === null) {
                console.warn(`Skipping property '${name}': null values are not allowed`);
                return null;
            }
        }

        let PropertyClass = this.#types.get(type);

        if (!PropertyClass) {
            const inferredType = inferType(value);
            
            if (inferredType === null) {
                console.warn(`Skipping property '${name}': null values are not allowed`);
                return null;
            }
            
            PropertyClass = this.#types.get(inferredType);

            if (!PropertyClass) {
                console.warn(`Skipping property '${name}': type '${type}' not registered`);
                return null;
            }
        }

        return new PropertyClass(params);
    }

    fromJson(obj, name = 'root') {
        const property = this.create({ name, value: obj });
        
        if (!property) return null;

        if (property.isGroup()) {
            for (const [key, val] of Object.entries(obj)) {
                const child = this.fromJson(val, key);
                if (child) {
                    property.adopt(child);
                }
            }
        }

        return property;
    }

    isExternal(type) {
        const arr = type.split('.');
        return arr.length > 1;
    }
}
export const TypeRegistry = new _TypeRegistry();
