import { Tree } from "./Tree.js"

// Inline the Tree class here if not imported
// class Tree { ... }  // paste the full class above

// Build test tree
const root = new Tree({ name: 'Root', value: 1 });
const a = new Tree({ name: 'A', value: 2 });
const a1 = new Tree({ name: 'A1', value: 3.1 });
const a2 = new Tree({ name: 'A2', value: 3.2 });
const b = new Tree({ name: 'B', value: 4 });

root.addChild(a);
root.addChild(b);
a.addChild(a1);

// Helper to print tree for reference
console.log('Test Tree:');
console.log('Root (1)');
console.log('├── A (2)');
console.log('│   └── A1 (3)');
console.log('└── B (4)');

// Test 1: Basic downward propagation (no mutation in visitor)
console.log('\nTest 1: Downward propagation (set in visitor, flows to children)');
root.traverseDfs((payload, { depth, state }) => {
  console.log(`${"  ".repeat(depth)}${payload.name}: incoming state.foo = ${state.foo ?? 'undefined'}`);
  // Mutate incoming state — this will flow to MY children (via copy)
  state.foo = (state.foo ?? 0) + payload.value;
}, { initialState: {} });

// Output:
// Root: incoming state.foo = undefined
//   A: incoming state.foo = 1
//     A1: incoming state.foo = 3
//   B: incoming state.foo = 1  <-- B sees root's mutation, but not A's or A1's (isolation!)

// Test 2: Global accumulation with shared reference
console.log('\nTest 2: Global total (shared ref inside state)');
const shared = { total: 0 };
root.traverseDfs((payload, { depth, state }) => {
  console.log(`${"  ".repeat(depth)}${payload.name}: adding ${payload.value}, current total = ${state.shared.total}`);
  state.shared.total += payload.value;
}, { initialState: { shared } });
console.log('Final global total:', shared.total);

// Output:
// Root: adding 1, current total = 0
//   A: adding 2, current total = 1
//     A1: adding 3, current total = 3
//   B: adding 4, current total = 6
// Final global total: 10  <-- all additions visible globally via shared ref

// Test 3: Per-branch isolation (mutations don't leak to siblings)
console.log('\nTest 3: Per-branch isolation (mutations only affect descendants)');
root.traverseDfs((payload, { depth, state }) => {
  console.log(`${"  ".repeat(depth)}${payload.name}: incoming state.bar = ${state.bar ?? 'undefined'}`);
  // Mutate incoming
  state.bar = (state.bar ?? 0) + payload.value;
}, { initialState: {} });

// Output:
// Root: incoming state.bar = undefined
//   A: incoming state.bar = 1
//     A1: incoming state.bar = 3
//   B: incoming state.bar = 1  <-- B sees only root's 1, not A's 3 or A1's 6 (no leak!)

// Test 4: No shared ref → no global accumulation (as in your example)
console.log('\nTest 4: No global accumulation (primitives copied by value)');
const accum = { total: 0 };
root.traverseDfs((payload, { state }) => {
  state.total = (state.total || 0) + payload.value;
}, { initialState: accum });
console.log('Final accum.total:', accum.total);  // 0 — mutations in copies, not original