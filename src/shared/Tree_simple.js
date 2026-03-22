
//==========================================================
//
//      Mediator

export class Mediator {
    constructor() {
        this.listeners = new Map();  // eventName → Set<callback>
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);  // auto-unsubscribe helper
    }

    off(event, callback) {
        const cbs = this.listeners.get(event);
        if (cbs) {
            cbs.delete(callback);
            if (cbs.size === 0) this.listeners.delete(event);
        }
    }

    emit(event, payload = null) {
        const cbs = this.listeners.get(event);
        if (cbs) {
            // Copy to avoid mutation-while-iterating issues
            [...cbs].forEach(cb => cb(payload));
        }
    }

    // Optional: once (fire once then off)
    once(event, callback) {
        const wrapped = (payload) => {
            callback(payload);
            this.off(event, wrapped);
        };
        return this.on(event, wrapped);
    }

    // Clear all (useful for tests/hot-reload)
    clear() {
        this.listeners.clear();
    }
}


//==========================================================
//
//      Node

class Node {
    #parent = null;
    #children = [];
    #mediator = new Mediator();

    constructor(P) {
        this.P = P;
    }

    add(P) {
        const child = new Node(P);
        child.#parent = this;
        this.#children.push(child);
        this.#mediator.emit('child-added', { child, index: this.#children.length - 1 });

        return child;
    }

    remove(child) {
        const index = this.#children.indexOf(child);
        if (index !== -1) {
            this.#children.splice(index, 1);
            child.#parent = null;
            this.#mediator.emit('child-removed', { child, index });
        }
    }

    getParent() {
        return this.#parent;
    }
    
    getChild(name) {
        return this.#children.find(c => c.P.name === name);
    }

    getChildren() {
        return [...this.#children];
    }

    on(event, callback) {
        return this.#mediator.on(event, callback);
    }

    off(event, callback) {
        this.#mediator.off(event, callback);
    }

    traverse(cb) {
        const stack = [{ node: this, depth: 0 }];

        while (stack.length) {
            const { node, depth } = stack.pop();
            const is_last = node.#parent ?
                node === node.#parent.#children.at(-1) : true

            cb(node.P, {
                depth,
                child_count: node.#children.length,
                is_last
            });

            for (let i = node.#children.length - 1; i >= 0; i--) {
                stack.push({
                    node: node.#children[i],
                    depth: depth + 1
                });
            }
        }
    }

    to_obj() {
        const result = {};
        for (const child of this.#children) {
            result[child.P] = child.to_obj();
        }
        return result;
    }

    to_obj_stack_based() {
        const stack = [{ node: this, result: null, phase: 'descend' }];
        const results = new Map();

        while (stack.length) {
            const entry = stack.pop();
            const { node, phase } = entry;

            if (phase === 'descend') {
                // Mark for ascend phase after children are processed
                stack.push({ node, phase: 'ascend' });

                // Push children in reverse order (so they're popped in correct order)
                for (let i = node.#children.length - 1; i >= 0; i--) {
                    stack.push({ node: node.#children[i], phase: 'descend' });
                }
            } else if (phase === 'ascend') {
                // All children processed, build this node's object
                const obj = {};
                for (const child of node.#children) {
                    obj[child.P] = results.get(child);
                }
                results.set(node, obj);
            }
        }

        return results.get(this);
    }

    to_obj_using_traverse() {
        const stack = [{}]; // stack of partial objects, root starts empty

        this.traverse((payload, info) => {
            if (info.depth === 0) return; // skip root node

            // Trim stack to current depth (clean up from previous branches)
            stack.length = info.depth;

            const obj = {};
            stack[info.depth] = obj;
            stack[info.depth - 1] [payload] = obj;
        });

        return stack[0];
    }        

}

Node.from_obj = function(obj) {

    const root_node = new Node('root');

    const stack = [{
        key: 'root',
        value: obj,
        node: root_node,
    }];

    while (stack.length) {
        const entry = stack.pop();

        if (typeof entry.value !== 'object') continue;
        if (entry.value === null) continue;

        const entries = Object.entries(entry.value); // children

        // iterate children
        for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];

            const child_node = entry.node.add(key);

            stack.push({ key, value, node: child_node });
        }
    }

    return root_node;
}

function obj2node(obj, name = 'root', type = null, config = {}) {
    // Infer type if not provided
    if (type === null) {
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            type = 'group';
            console.warn(`⚠️  Type not specified for node "${name}". Assuming "group". Consider adding explicit type.`);
        } else {
            type = 'property';
        }
    }

    // Reject arrays
    if (Array.isArray(obj)) {
        console.error(`❌ Arrays not supported: "${name}". Use objects instead.`);
        return null;
    }

    const node = new Node({
        name,
        type,
        data: type === 'group' ? {} : { value: obj },
        config
    });

    // Recurse into children if group
    if (type === 'group' && typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
            // Skip metadata fields
            if (key.startsWith('__')) return;

            const childType = value?.__type || null; // explicit type if provided
            const childConfig = value?.__config || {};
            const childValue = value?.__value !== undefined ? value.__value : value;

            const child = obj2node(childValue, key, childType, childConfig);
            if (child) node.add(child);
        });
    }

    return node;
}


//==========================================================
//
//      Property classes

class IPropertyGroup extends Mediator {
    #node;
    #childProperties = new Map();
    #unsubscribers = [];

    constructor(node) {
        super();
        this.#node = node;
        this.#setupNodeListeners();
    }

    #setupNodeListeners() {
        // Watch for structural changes
        const unsubChild = this.#node.on('child-added', ({ child }) => {
            this.emit('child-added', { name: child.P.name, child });
        });

        const unsubRemove = this.#node.on('child-removed', ({ child }) => {
            const name = child.P.name;
            this.#childProperties.delete(name);
            this.emit('child-removed', { name });
        });

        this.#unsubscribers.push(unsubChild, unsubRemove);
    }

    getName() {
        return this.#node.P.name;
    }

    getConfig() {
        return this.#node.P.data?.config || {};
    }

    // Spawn child Property or PropertyGroup on demand
    getChild(childName) {
        if (this.#childProperties.has(childName)) {
            return this.#childProperties.get(childName);
        }
    
        const childNode = this.#node.getChild(childName);
        if (!childNode) return null;
    
        // Determine type from node.P.type, not from children count
        const childProp = childNode.P.type === 'group'
            ? new IPropertyGroup(childNode)
            : new IProperty(childNode);
    
        this.#childProperties.set(childName, childProp);
        return childProp;
    }
    
    // Optional: get all children as Properties
    getChildren() {
        return this.#node.getChildren().map(child => this.getChild(child.P.name));
    }

    addChild(name, type, data = {}, config = {}) {
        const childNode = new Node({
            name,
            type,
            data: type === 'group' ? {} : { value: data },
            config
        });
        this.#node.add(childNode);
        return this.getChild(name); // Return the Property wrapper
    }

    removeChild(name) {
        const childNode = this.#node.getChild(name);
        if (childNode) {
            this.#node.remove(childNode);
            this.#childProperties.delete(name);
            return true;
        }
        return false;
    }

    // Optional: get all children as Properties
    getChildren() {
        return this.#node.getChildren().map(child => this.getChild(child.P.name));
    }

    // Cleanup
    destroy() {
        this.#unsubscribers.forEach(unsub => unsub());
        this.#childProperties.forEach(prop => prop.destroy?.());
        this.clear();
    }
}


class IProperty extends Mediator {
    #node;
    #validator;

    constructor(node, validator = null) {
        super();
        this.#node = node;
        this.#validator = validator;
    }

    getName() {
        return this.#node.P.name;
    }

    getValue() {
        return this.#node.P.data?.value;
    }

    getConfig() {
        return this.#node.P.data?.config || {};
    }

    setValue(newValue) {
        if (this.#validator && !this.#validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = this.getValue();
        if (oldValue === newValue) {
            return { success: true };
        }

        this.#node.P.data.value = newValue;
        this.emit('value-changed', { oldValue, newValue });
        return { success: true };
    }

    // Optional: get full path (useful for debugging or binding)
    getPath() {
        const path = [];
        let current = this.#node;
        while (current) {
            path.unshift(current.P.name);
            current = current.getParent();
        }
        return path;
    }

    // Cleanup
    destroy() {
        this.clear();
    }
}


//==========================================================
//
//      main

const solar_system = {
    Earth: {
        Antarctica: {},
        Australia: {},
        Europe: {
            France: {},
            Italy: {},
        },
        North_America: {
            Canada: {},
            USA: {}
        },
        South_America: {
            Peru: {}
        },
    },
    Moon: {},
    Mars: {},
};

const root = Node.from_obj(solar_system);
root.traverse((payload, info) => {
    const indent = '  '.repeat(info.depth);
    console.log(indent, payload, info);
});

const recovered = root.to_obj();
console.log(JSON.stringify(recovered, null, 2));
console.log('\n');

const recovered2 = root.to_obj_stack_based();
console.log(JSON.stringify(recovered2, null, 2));
console.log('\n');

const recovered3 = root.to_obj_using_traverse();
console.log(JSON.stringify(recovered3, null, 2));
console.log('\n');
