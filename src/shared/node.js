//==========================================================
//
//      Node
// 
//  treats param P, the nodes' payload, opaque
//  it's any user provided data

export class Node {
    #parent = null;
    #children = [];

    constructor(P) {
        this.P = P;
    }

    add(P) {
        const child = new Node(P);
        child.#parent = this;
        this.#children.push(child);

        return child;
    }

    remove(child) {
        const index = this.#children.indexOf(child);
        if (index !== -1) {
            this.#children.splice(index, 1);
            child.#parent = null;
        }
    }

    getParent() {
        return this.#parent;
    }
    
    getChild(finder) {
        console.assert(typeof finder === 'function');
        return this.#children.find(finder);
    }

    getChildren() {
        return this.#children;
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

    toJson() {
        const result = {};
        
        for (const child of this.#children) {
            const { name, value, type } = child.P;
            
            if (type === 'group') {
                result[name] = child.toJson();
            } else {
                result[name] = value;
            }
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

Node.from_obj = function(obj, name) {

    const root_node = new Node(name || 'root');

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

Node.from_obj_2 = function(obj, name = 'root', type = null, config = {}) {
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

// recursion
Node._from = function(obj) {
    function buildNode(node, value) {
        if (typeof value !== 'object' || value === null) {
            // Leaf node — primitive value, nothing to recurse into
            return;
        }

        for (const [key, val] of Object.entries(value)) {
            if (typeof val === 'object' && val !== null) {
                // Branch node — recurse into nested object
                const child = node.add(key);
                buildNode(child, val);
            } else {
                // Leaf node — primitive value, store as "key: value"
                node.add(`${key}: ${val}`);
            }
        }
    }

    const root = new Node('root');
    buildNode(root, obj);
    return root;
};

// stack-based
Node.from = function(obj, name = 'root') {
    const root = new Node({name, type: 'group'});
    const stack = [[root, obj]];

    while (stack.length > 0) {
        const [node, value] = stack.pop();

        if (typeof value !== 'object' || value === null) {
            continue;
        }

        for (const [key, val] of Object.entries(value)) {
            if (typeof val === 'object' && val !== null) {
                // Branch node — push onto stack for later processing
                const child = node.add({name: key, type: 'group'});
                stack.push([child, val]);
            } else {
                // Leaf node — primitive value
                node.add({name: key, type: 'prop', value: val});
            }
        }
    }

    return root;
};


// this class is owning P
export class AppNode extends Node {
    constructor(name, value, type, config = {}) {
        super({name, value, type, config});
    }
    getName() { return this.P.name; }
    getValue() { return this.P.value; }
    getType() { return this.P.type; }
    getConfig() { return this.P.config; }
    getChild(name) { return this.P[name]; }
}

AppNode.from_obj = function(name, obj) {
    const root_node = new AppNode(name, {});

    const stack = [{
        key: name,
        value: obj,
        node: root_node,
    }];

    while (stack.length) {
        const entry = stack.pop();

        if (typeof entry.value !== 'object') continue;
        if (entry.value === null) continue; // 'null' is of type 'object'

        const entries = Object.entries(entry.value); // children

        // iterate children
        for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];

            const child_node = entry.node.add({
                name: key, data: value, config: {}, type: ''
            });

            stack.push({ key, value, node: child_node });
        }
    }

    return root_node;
}

