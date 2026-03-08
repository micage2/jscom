import { Tree } from "./Tree.js"

const root = new Tree({ name: "Root", type: "frame", value: 1 });

const childA = new Tree({ name: "A", type: "circle", value: 2 });
const childB = new Tree({ name: "B", type: "rect", value: 4 });
const childB1 = new Tree({ name: "B1", type: "rect", value: 4 });
const childB2 = new Tree({ name: "B2", type: "rect", value: 4 });

root.addChild(childA);
root.addChild(childB);
childB.addChild(childB1);
childB.addChild(childB2);

// Basic traversal
console.log(`\nBasic traversal`);
root.traverseDfs((payload, { depth, parentPayload, state }) => {
    console.log(`${"  ".repeat(depth)}${payload.name} (parent: ${parentPayload?.name ?? "none"})`);
});

// With neighbours
console.log(`\nWith neighbours`);
root.traverseDfs((payload, { depth, prevSiblingPayload, nextSiblingPayload }) => {
    console.log(`${"  ".repeat(depth)}${payload.name}  ← ${prevSiblingPayload?.name ?? "-"}   → ${nextSiblingPayload?.name ?? "-"}`);
}, { provideNeighbours: true });

// With state accumulation (e.g. transform)
const accum = { total: 0 };
console.log(`\nWith state accumulation`);
root.traverseDfs((payload, { state }) => {
    state.total += (payload.value || 0);
}, { initialState: accum });

console.log("Total:", accum.total); // if you kept reference to initialState