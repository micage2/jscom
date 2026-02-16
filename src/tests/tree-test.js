import { Registry } from '../registry.js';
import Tree from "../comps/tree.js";
import Example from "../comps/_template.js"; // try this as a payload

// default role is "Example" (comps decision)
const tree = Registry.create(Tree, {name:"root", age: Infinity});
const ch1 = tree.add({ name: "Heinz", age: 31 });
const ch2 = tree.add({ name: "Bob", age: 63 });
ch1.add({ name: "Ute", age: 4 })
    .add({ name: "Rassel", age: "neu" })
    .add({ name: "Windel", age: "2 Tage"});
ch1.add({ name: "Gabi", age: 27 });

tree.traverseDF((payload, info) => {
    const ind = "  ".repeat(info.depth);
    const pre = info.isLast ? "└─" : "├─";
    console.log(`${ind}${pre}${payload?.name} (${payload?.age})`);
});

// tree.log(); // same as above

