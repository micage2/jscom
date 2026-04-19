import { Create, Register } from "../registry.js"

const INode = function(inst) {
    const P = inst.P; // payload, opaque
    const children = inst.children;

    return {
        expose: () => this, // TODO: really?
        add(args) {
            const child = ctor(args).getData(); // ?!?
            child.parent = inst;
            children.push(child);
            return INode(child);
        },
        up() { // for convenience, not to be used for iteration
            return inst.parent ? INode(inst.parent) : null;
        },
        next() { // for convenience, not to be used for iteration
            if (!inst.parent) return null;
            const children = inst.parent.children;
            let idx = children.indexOf(inst);
            return children[idx+1] ? INode(children[idx+1]) : null;
        },
        traverseDF(cb) {
            const stack = [{ node: inst, depth: 0 }];
        
            while (stack.length) {
                const { node, depth } = stack.pop();
        
                cb(node.P, {
                    depth,
                    numChildren: node.children.length,
                    isLast: node.parent
                        && node === node.parent.children.at(-1)
                });

                for (let i = node.children.length - 1; i >= 0; i--) {
                    stack.push({
                        node: node.children[i],
                        depth: depth + 1
                    });
                }
            }
        },
        for_children(cb) {
            for(const i = 0; i < children.length; i++) {
                cb(children[i]);
            }
        },
        P
    }
};

const IAppNode = function(node) {
    return {
        add(args) {
            const child = ctor(args).getData();
            child.parent = node;
            node.children.push(child);

            return IAppNode(child);
        },
        remove(name) {
            const index = node.children.findIndex((child) => child.P.name === name);
            if (index >= 0) {
                const child = node.children.splice(index, 1)[0];
                return IAppNode(child);
            }
            return null;
        },
        traverse(cb) {
            const stack = [{ node, depth: 0 }];
        
            while (stack.length) {
                const { node, depth } = stack.pop();
        
                cb(node.P, {
                    depth,
                    child_count: node.children.length,
                    is_last: node.parent ?
                        node === node.parent.children.at(-1) : true
                });

                for (let i = node.children.length - 1; i >= 0; i--) {
                    stack.push({
                        node: node.children[i],
                        depth: depth + 1
                    });
                }
            }
        },

        to_obj() {
            const result = {};
            for (const child of node.children) {
                result[child.P.name] = child.to_obj();
            }
            return result;
        },
                
        getChild(name) {
            const child = node.children.find(c => c.P.name === name);
            if (child) return IAppNode(child);
            else return null;
        },

        getChildren() {
            return node.children;
        },

        forChildren(cb) {
            for(let i = node.children.length-1; i >= 0 ; i--) {
                cb(node.children[i]);
            }
        },

        // this is user provided
        P: node.P,
    }
};

const vtbl = new Map([
    ["Node", INode],
    ["AppNode", IAppNode],
]);


//========================================================
//
// constructor
//
function ctor(payload) {
    const inst = {
        parent: null,
        children: [],
        P: payload
    };
    
    return {
        getData: () => inst,
    };
} 


const class_id = Register(ctor, (role) => vtbl.get(role));
export default class_id;


