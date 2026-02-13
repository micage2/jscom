// template for general components
// example is fully working

// this component registers itself at the root registry
import { Registry } from "../registry.js";

// define interfaces/roles here
// data is the unpacked return value from ctor(...), see registry.js
// note: IExample({unpacked_data}) returns an object that implements
// IExample.
const IExample = ({ data }) => ({
    log() {
        console.log(`[Example] answer: ${data.answer}`);        
    },
});

const ICalc = () => ({
    add: (a, b) => a + b,
    mul: (a, b) => a * b,
    //... add more methods here!
});

const roleFactories = new Map([
    ['Example', IExample],
    ['Calc', ICalc],
    // ... add more roles here!
]);

const roleProvider = (role = "Example") => roleFactories.get(role) ?? null;

/**
 *  constructor of the instance
 *  @returns {IInstance}
 */
function ctor(args = {}) {
    const some_data = {
        answer: args.value || 13,
    };

    // root registry is expecting these methods
    // some_data is completely opaque for the registry
    // for additional methods a specialized registry would be needed
    return {
        getData() { return some_data; },
        getClassId() { return TEMPLATE_CLSID; }, // do we need it?
    };
}

export const TEMPLATE_CLSID = Registry.register(ctor, roleProvider);