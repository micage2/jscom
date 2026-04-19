import { Node } from "./node.js";
import { Property } from "./property.js";

const data = {
    blocks: {
        block1: {
            house1: { price: 1000 },
            house2: { price: 1500 },
        },
        block2: {
            house1: { price: 2000 },
            house2: { price: 2500 },
        },
    },
    roads: {
        Kastanienallee: {}
    }
};

// const root = NamedNode.from_obj('root', data);
const root = AppNode.from2(data);
root.traverse((node, info) => {
    console.log('  '.repeat(info.depth), node);
});

const root_prop = new IPropertyGroup(root);

const stack = []; //[root_prop];
while (stack.length) {
    const prop = stack.pop();

    console.log(prop.getName()); // pre-order

    if (!prop.isGroup()) continue;

    const children = prop.getChildren();
    children.forEach((v,i,a)  => {
        stack.push(v);            
    });
}

