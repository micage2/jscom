import { Registry } from "../registry.js";

const INode = function({data: inst}) {
    const P = inst.P; // payload, opaque
    const children = inst.children;
    const parent = inst.parent;

    return {
        expose: () => this, // makes no sense, but let us be correct
        add(payload) {
            const child = create(payload);
            child.parent = inst;
            children.push(child);
            return INode({data: child});
        },
        up() {
            return parent ? INode(parent) : null;
        },
        next() { // for convenience, not to be used for iteration
            if (!parent) return null;
            let idx = parent.children.indexOf(inst);
            return parent.children[idx+1] ? INode(parent.children[idx+1]) : null;
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
        
                cb(node.P, {
                    depth,
                    numChildren: node.children.length,
                    isLast: !node.parent
                        || node === node.parent.children.at(-1)
                });
            }
        },
        log() {
            this.traverseDF((P, {depth, numChildren, isLast}) => {
                const indent = "  ".repeat(depth);
                const prefix = isLast ? "└─" : "├─";
                console.log(`${indent}${prefix}${P?.name} {d: ${depth} c:${numChildren} l:${isLast?1:0}}`);
            });
        }
    }
};

const roles = new Map([
    ["Node", INode],
]);
const roleSelector = (role = "Node") => roles.get(role) ?? null;

function create(payload) {
    const inst = { P: payload };
    inst.parent = null;
    inst.children = [];
    return inst;
}


//========================================================
//
// constructor
//
function ctor(payload) {
    const inst = create(payload);
    
    return {
        getData: () => inst,
    };
}



const class_id = Registry.register(ctor, roleSelector);
export default class_id;


