// test of a template component (not DOM-related)
// with role switching using as()
import { Registry } from '../registry.js';
import { TEMPLATE_CLSID } from "../comps/_template.js";

// default role is "Example" (comps decision)
const example = Registry.create(TEMPLATE_CLSID, { value: 42 });
example.log();

// using the "Calc" role
const calc = example.as("Calc");
console.log(`2 + 3 = ${calc.add(2,3)}`);
console.log(`2 * 3 = ${calc.mul(2,3)}`);

// switching back to "Example" role
calc.as("Example").log();
