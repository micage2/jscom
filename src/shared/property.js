import { Mediator } from "./mediator.js";

class _TypeRegistry {
    #types = new Map();

    register(type, PropertyClass) {
        this.#types.set(type, PropertyClass);
        return type;
    }

    create(type, name, value = undefined, config = {}) {
        const PropertyClass = this.#types.get(type);
        if (!PropertyClass) {
            console.warn('[TypeRegistry.create]', 'type not registered: ', type);
            return null;            
        }

        return new PropertyClass(name, value, config);
    }


    fromJson(obj, name = 'root') {
        const type = obj === null ? 'null'
                   : typeof obj === 'object' ? 'group'
                   : typeof obj;

        const property = this.create(type, name, obj);

        // Recursively add children for groups
        if (type === 'group') {
            for (const [key, val] of Object.entries(obj)) {
                property.add(key, val);
            }
        }

        return property;
    }
}

export const TypeRegistry = new _TypeRegistry();

// contract
export class Property extends Mediator {
    constructor() {
        super();
    }

    add(type, name, value, config = {}) {
        throw new Error('[Property.add] not impl.')
    }

    remove(name) {
        throw new Error('[Property.remove] not impl.')
    }

    get() {
        return undefined;
    }

    set(value) {
        throw new Error('[Property.set] not impl.')
    }

    getName() {
        throw new Error('[Property.set] not impl.')
    }

    getType() {
        return 'undefined';
    }

    getConfig() {
        throw new Error('[Property.set] not impl.')
    }

    isGroup() {
        return false;
    }

    getParent() {
        throw new Error('[Property.getParent] not impl.')
    }

    getChildren() {
        throw new Error('[Property.getChildren] not impl.')
    }

    getChild(name) {
        throw new Error('[Property.getChild] not impl.')
    }

    _traverse(cb) {
        const stack = [{ property: this, depth: 0 }];

        while (stack.length) {
            const { property, depth } = stack.pop();
            const children = property.getChildren();
            const child_count = children ? children.length : 0;

            const parentNode = null; // TODO: concept for this!
            
            // const is_last = parentNode ? property.#node === parentNode.getChildren().at(-1) : true;
            const is_last = true;

            cb(property, { depth, child_count, is_last });

            if (children) {
                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push({
                        property: children[i],
                        depth: depth + 1
                    });
                }
            }
        }
    }

    traverse(cb) {
        const stack = [{ property: this, depth: 0, isLast: true }];
    
        while (stack.length) {
            const { property, depth, isLast } = stack.pop();
            const children = property.getChildren();
            const child_count = children ? children.length : 0;
    
            const res = cb(property, { depth, child_count, isLast });
            if (res === 'stop')
                return;
    
            if (children) {
                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push({
                        property: children[i],
                        depth: depth + 1,
                        isLast: i === children.length - 1
                    });
                }
            }
        }
    }
}

export class GroupProperty extends Property {
    #name;
    #children = new Map();

    constructor(name) {
        super();
        this.#name = name;
    }

    add(name, value = undefined, type = null, config = {}) {
        if (!type) {
            // Determine type from value
            type = value === null        ? 'null'
            : typeof value === 'object' ? 'group'
            : typeof value;
        }
        const childprop = TypeRegistry.create(type, name, value, config);
        if (childprop) {
            this.#children.set(name, childprop);

            this.emit('prop-added', childprop);

            return childprop;
        }

        return null;
    }
    remove(name) {
        // const childNode = this.#node.getChild(child => child.P.name === name);
        // if (childNode) {
        //     this.#node.remove(childNode);
        //     const childProperty = TypeRegistry.create(childNode);
        //     this.emit('prop-removed', childProperty);
        //     return true;
        // }
        return false;
    }

    getName() {
        return this.#name;
    }

    getType() {
        return 'group';
    }

    isGroup() {
        return true;
    }

    getChild(name) {
        return this.#children.get(name) ?? null;
    }

    getChildren() {
        return [...this.#children.values()];
    }
}
export const TYPE_GROUP = TypeRegistry.register('group', GroupProperty);

class StringProperty extends Property {
    #name;
    #str;
    #config;
    constructor(name, str, config) {
        super();
        this.#name = name;
        this.#str = str;
        this.#config = config;
    }
    get() { return this.#str; }
    set(value) {
        console.assert(typeof value === 'string', '[StringProperty.set]', 'value is not a string');
        const oldValue = this.#str;
        this.#str = value;
        this.emit('value-changed', { oldValue, newValue: value });
    }
}
TypeRegistry.register('string', StringProperty);

class NumberProperty extends Property {
    #name;
    #num;
    #config;
    constructor(name, value, config) {
        console.assert(typeof value === 'number', '[NumberProperty.ctor]', 'value is not a number', value);
        super();
        this.#name = name;
        this.#num = value;
        this.#config = config;
    }
    get() { return this.#num; }
    set(value) {
        console.assert(typeof value === 'number', '[NumberProperty.set]', 'value is not a number');
        const oldValue = this.#num;
        this.#num = value;
        this.emit('value-changed', { oldValue, newValue: value });
    }
}
TypeRegistry.register('number', NumberProperty);

class BoolProperty extends Property {
    #name;
    #value;
    #config;
    constructor(name, value, config) {
        super();
        this.#name = name;
        this.#value = value;
        this.#config = config;
    }
    get() { return this.#value; }
    set(value) {
        console.assert(typeof value === 'boolean', '[BoolProperty.set]', 'value is not a boolean');
        const oldValue = this.#value;
        this.#value = value;
        this.emit('value-changed', { oldValue, newValue: value });
    }
}
TypeRegistry.register('boolean', BoolProperty);

