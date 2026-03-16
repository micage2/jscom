import { Register } from "../registry.js"

const INode = function(inst) {
    const P = inst.P; // payload, opaque
    const children = inst.children;

    return {
        expose: () => this, // makes no sense, but let us be correct
        add(args) {
            const child = ctor(args);
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

                for (let i = node.children.length - 1; i >= 0; i--) {
                    stack.push({
                        node: node.children[i],
                        depth: depth + 1
                    });
                }
        
                cb(node.F, {
                    depth,
                    numChildren: node.children.length,
                    isLast: node.parent
                        && node === node.parent.children.at(-1)
                });
            }
        },
    }
};

const vtbl = new Map([
    ["Node", INode],
]);


//========================================================
//
// constructor
//
function ctor(payload) {
    const inst = { P: payload };
    inst.parent = null;
    inst.children = [];
    
    return {
        getData() => inst;
    };
} 


const class_id = Register(ctor, vtbl);
export default class_id;


