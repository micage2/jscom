export
class Tree {
    constructor(payload) {
        this.payload = payload;           // completely opaque — can be anything
        this.children = [];
        this.parent = null;

        // Optional callbacks — can be set per instance
        this.onAddChild = null;           // (childTree) => {}
        this.onRemoveChild = null;        // (childTree) => {}
    }

    get parent() {
        return this.parent;
    }

    addChild(child) {
        if (!(child instanceof Tree)) {
            throw new Error("Child must be a Tree instance");
        }
        if (child.parent) {
            child.parent.removeChild(child);
        }
        this.children.push(child);
        child.parent = this;

        if (typeof this.onAddChild === 'function') {
            this.onAddChild(child);
        }

        return child; // fluent
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index === -1) return false;

        this.children.splice(index, 1);
        child.parent = null;

        if (typeof this.onRemoveChild === 'function') {
            this.onRemoveChild(child);
        }

        return true;
    }

    /**
     * Depth-first traversal (pre-order).
     *
     * @param {function(payload: any, info: object): void} visitor
     * @param {object} [options]
     * @param {boolean} [options.provideNeighbours=false]   include prev/next sibling payloads
     * @param {object} [options.initialState={}]            starting state object
     * @param {function(any): boolean} [options.filter]     skip nodes where filter(payload) === false
     */
    traverseDfs(visitor, options = {}) {
        const {
            provideNeighbours = false,
            initialState = {},
            filter = null
        } = options;

        const stack = [{
            node: this,
            depth: 0,
            parentPayload: null,
            prevSiblingPayload: null,
            nextSiblingPayload: null,
            state: { ...initialState }   // initial shallow copy
        }];

        while (stack.length) {
            const frame = stack.pop();
            const { node, depth, parentPayload, prevSiblingPayload, nextSiblingPayload, state } = frame;

            if (filter && !filter(node.payload)) {
                continue;
            }

            // Call visitor with current payload + context
            visitor(node.payload, {
                depth,
                parentPayload,
                prevSiblingPayload: provideNeighbours ? prevSiblingPayload : undefined,
                nextSiblingPayload: provideNeighbours ? nextSiblingPayload : undefined,
                state
            });

            // Push children in reverse order → left-to-right visual processing
            const children = node.children;
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];

                let prev = null;
                let next = null;
                if (provideNeighbours) {
                    prev = (i + 1 < children.length) ? children[i + 1].payload : null;
                    next = (i > 0) ? children[i - 1].payload : null;
                }

                // Shallow copy for this child branch
                const childState = { ...state };

                stack.push({
                    node: child,
                    depth: depth + 1,
                    parentPayload: node.payload,
                    prevSiblingPayload: prev,
                    nextSiblingPayload: next,
                    state: childState
                });
            }
        }
    }

    // Optional: simple string representation for debugging
    toString(indent = '') {
        let s = `${indent}${this.payload?.toString?.() || '[Tree]'}\n`;
        for (const child of this.children) {
            s += child.toString(indent + '  ');
        }
        return s;
    }
}
