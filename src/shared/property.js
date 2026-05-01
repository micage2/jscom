import { Mediator } from "./mediator.js";
import { TypeRegistry } from "./type-registry.js";

// base class, mostly not impl.
export class Property extends Mediator {
    #name;
    #config;
    #parent = null;

    constructor(params) {
        super();
        this.#name = params.name;
        this.#config = params.config;
    }

    getType() { return 'undefined'; }
    isGroup() { return false; }

    add() { throw new Error('[Property.add] not impl.') }
    remove() { throw new Error('[Property.remove] not impl.') }
    removeSelf() {
        if (this.#parent) {
            return this.#parent.remove(this);
        }
        return null;
    }

    get() { return undefined; }
    set() { throw new Error('[Property.set] not impl.') }

    getName() { return this.#name; }
    setName(name) { this.#name = name; }

    getConfig() { return this.#config; }

    getParent() { return this.#parent; }
    setParent(parent) { this.#parent = parent; }

    getChildCount() { return null; } 
    getChildren() { return null; }
    getChild(name) { return null; }

    traverse(cb) {
        const stack = [{ property: this, depth: 0, isLast: true }];
    
        while (stack.length) {
            const { property, depth, isLast } = stack.pop();
            const children = property.getChildren();
            const child_count = children ? children.length : 0;
    
            const info = { depth, child_count, isLast };
            
            const res = cb(property, info);
            if (res === 'stop')
                return;
            if (res === 'skip')
                continue;
    
            if (children) {
                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push({
                        property: children[i],
                        depth: depth + 1,
                        isLast: i === children.length - 1
                    });
                }
            }
        }
    }

    toJson() { return this.get(); }
    log() {
        let str = `${this.getType()}: "${this.getName()}"`;
        console.log(str, this.get());    
    }
}
Property.gen_id = (prefix = "") => `${prefix}` + Math.random().toString(36).slice(2, 11);
Property.visitor = (prop, info) => {
    const indent = '  '.repeat(info.depth);
    console.log(info.depth, indent, `${prop.getName()}`);    
};

export class GroupProperty extends Property {
    #children = new Map();

    constructor(params) {
        super(params);
        
        // Populate children from object value, value itself is not stored
        const value = params.value;
        if (value && typeof value === 'object') {
            for (const [key, val] of Object.entries(value)) {
                this.add({ name: key, value: val });
            }
        }
    }

    getType() { return TYPE_GROUP; }
    isGroup() { return true; }

    add(params) {
        const property = TypeRegistry.create(params);
        if (!property) return null;
        return this.adopt(property);
    }

    adopt(property) {
        property.setParent(this);
        this.#children.set(property.getName(), property);
        this.emit('child-added', property);
        return property;
    }

    abandon(prop) {
        if (!(prop instanceof Property)) {
            console.log('[GroupProperty.abandon]', 'invalid prop:', prop);
            return;
        }
        prop.setParent(null);
        this.#children.delete(prop.getName());
        this.emit('child-removed', prop);
    }

    remove(name) {
        const prop = this.#children.get(name);
        if (prop) {
            this.abandon(prop);
            return true;
        }
        return false;
    }

    clear() {
        this.getChildren().forEach(prop => {
            this.remove(prop.getName());
        });
    }

    getChildCount() { return this.#children.length; } 

    getChild(name) {
        return this.#children.get(name) ?? null;
    }

    getDescendant(name) {
        const path = name.split('.');
        let parent;
        path.forEach((name) => {
            const child = this.#children.get(name);
            if (child) return child;
            parent = child;
        });
        return null;
    }

    getChildren() {
        return [...this.#children.values()];
    }
}
export const TYPE_GROUP = TypeRegistry.register('group', GroupProperty);

class StringProperty extends Property {
    #value;
    #config;
    constructor(params) {
        super(params);
        this.#value = params.value;
        this.#config = params.config;
    }
    getType() { return TYPE_STRING; }
    get() { return this.#value; }
    set(value) {
        console.assert(typeof value === 'string', '[StringProperty.set]', 'value is not a string');
        const oldValue = this.#value;
        this.#value = value;
        this.emit('value-changed', { oldValue, newValue: value });
    }
}
export const TYPE_STRING = TypeRegistry.register('string', StringProperty);

class NumberProperty extends Property {
    #num;
    constructor(params) {
        super(params);
        this.#num = params.value;
        // console.assert(typeof value !== 'number', '[NumberProperty.ctor]', 'value is not a number', this.#num);
    }
    getType() { return TYPE_NUMBER; }
    get() { return this.#num; }
    set(value) {
        // console.assert(typeof value !== 'number', '[NumberProperty.set]', 'value is not a number');
        const oldValue = this.#num;
        this.#num = value;
        this.emit('value-changed', { oldValue, newValue: value });
    }
}
export const TYPE_NUMBER = TypeRegistry.register('number', NumberProperty);

class BoolProperty extends Property {
    #value;
    #config;
    constructor(params) {
        super(params);
        this.#value = params.value;
        this.#config = params.config;
    }
    getType() { return TYPE_BOOLEAN; }
    get() { return this.#value; }
    set(value) {
        console.assert(typeof value === 'boolean', '[BoolProperty.set]', 'value is not a boolean');
        const oldValue = this.#value;
        this.#value = value;
        this.emit('value-changed', { oldValue, newValue: value });
    }
}
export const TYPE_BOOLEAN = TypeRegistry.register('boolean', BoolProperty);

export class ArrayProperty extends Property {
    #array;
    #children = new Map();

    constructor(params) {
        super(params);
        this.#array = Array.isArray(params.value) ? params.value : [];
        
        // Wrap each array element as a child property
        this.#array.forEach((item, index) => {
            this.#addChild(String(index), item);
        });
    }

    #addChild(name, value, config = {}) {
        const index = parseInt(name);
        const property = TypeRegistry.create({ name, value });
        
        if (property) {
            // Sync changes back to array
            property.on('value-changed', ({ newValue }) => {
                this.#array[index] = newValue;
            });
            
            this.adopt(property);
        }
        return property;
    }

    getType() { return TYPE_ARRAY; }
    isGroup() { return true; }

    get() {
        return this.#array;
    }

    set(value) {
        if (!Array.isArray(value)) {
            console.warn(`ArrayProperty.set(): expected array, got ${typeof value}`);
            return;
        }
        
        const oldValue = this.#array;
        this.#array = value;
        
        // Rebuild children to match new array
        this.getChildren().forEach(child => {
            child.setParent(null);
        });
        this.#children.clear();
        
        this.#array.forEach((item, index) => {
            this.#addChild(String(index), item);
        });
        
        this.emit('value-changed', { oldValue, newValue: this.#array });
    }

    add(params) {
        const { op, value } = params;
        
        if (!op || op === '>') {
            return this.#push(value);
        }
        
        if (op === '<') {
            return this.#unshift(value);
        }
        
        if (op.startsWith('after:')) {
            const targetValue = op.substring(6);
            const index = this.#array.indexOf(targetValue);
            if (index === -1) {
                console.warn(`ArrayProperty.add(): value '${targetValue}' not found`);
                return null;
            }
            return this.#insert(index + 1, value);
        }
        
        if (op.startsWith('before:')) {
            const targetValue = op.substring(7);
            const index = this.#array.indexOf(targetValue);
            if (index === -1) {
                console.warn(`ArrayProperty.add(): value '${targetValue}' not found`);
                return null;
            }
            return this.#insert(index, value);
        }
        
        console.warn(`ArrayProperty.add(): unknown operation '${op}'`);
        return null;
    }

    #push(value) {
        const index = this.#array.length;
        this.#array.push(value);
        return this.#addChild(String(index), value);
    }

    #unshift(value) {
        this.#array.unshift(value);
        this.#renumberChildren();
        return this.getChild(0);
    }

    #insert(index, value) {
        if (index < 0 || index > this.#array.length) {
            console.warn(`ArrayProperty.insert(): index ${index} out of bounds`);
            return null;
        }
        this.#array.splice(index, 0, value);
        this.#renumberChildren();
        return this.getChild(index);
    }

    #renumberChildren() {
        this.#children.clear();
        this.#array.forEach((item, index) => {
            this.#addChild(String(index), item);
        });
    }

    adopt(property) {
        property.setParent(this);
        this.#children.set(property.getName(), property);
        this.emit('child-added', property);
        return property;
    }

    remove(index) {
        const key = String(index);
        const property = this.#children.get(key);
        
        if (!property) {
            console.warn(`ArrayProperty.remove(): no item at index ${index}`);
            return false;
        }
        
        property.setParent(null);
        this.#children.delete(key);
        
        // Splice array
        this.#array.splice(index, 1);
        
        // Renumber remaining children
        this.#renumberChildren();
        
        this.emit('child-removed', property);
        return true;
    }

    getChild(indexOrName) {
        const key = String(indexOrName);
        return this.#children.get(key) ?? null;
    }

    getChildCount() { return this.#children.length; }
    
    getChildren() {
        return Array.from(this.#children.values())
            .sort((a, b) => parseInt(a.getName()) - parseInt(b.getName()));
    }

    toJson() {
        return this.#array.map((_, index) => {
            const child = this.getChild(index);
            return child ? child.toJson() : undefined;
        });
    }
}
export const TYPE_ARRAY = TypeRegistry.register('array', ArrayProperty);

// test
if (0) {
    function testArrayProperty() {
        console.log('=== ArrayProperty Tests ===\n');
    
        const root = TypeRegistry.create({ name: 'root' });
    
        const testCases = [
            {
                description: 'Create array from values',
                test: () => {
                    const arr = root.add({ name: 'colors', value: ['red', 'blue', 'green'] });
                    return arr && arr.getType() === TYPE_ARRAY && arr.get().length === 3;
                }
            },
            {
                description: 'Get array value',
                test: () => {
                    const arr = root.add({ name: 'tags', value: ['a', 'b', 'c'] });
                    return JSON.stringify(arr.get()) === JSON.stringify(['a', 'b', 'c']);
                }
            },
            {
                description: 'Access child by index',
                test: () => {
                    const arr = root.add({ name: 'items', value: ['first', 'second', 'third'] });
                    const child = arr.getChild(1);
                    return child && child.get() === 'second';
                }
            },
            {
                description: 'Access child by string index',
                test: () => {
                    const arr = root.add({ name: 'items', value: ['x', 'y', 'z'] });
                    const child = arr.getChild('0');
                    return child && child.get() === 'x';
                }
            },
            {
                description: 'Add item to array (push)',
                test: () => {
                    const arr = root.add({ name: 'list', value: ['a', 'b'] });
                    arr.add({ value: 'c' });
                    return arr.get().length === 3 && arr.getChild(2).get() === 'c';
                }
            },
            {
                description: 'Modify child updates array',
                test: () => {
                    const arr = root.add({ name: 'words', value: ['hello', 'world'] });
                    arr.getChild(0).set('goodbye');
                    return arr.getChild(0).get() === 'goodbye';
                }
            },
            {
                description: 'Remove item splices array',
                test: () => {
                    const arr = root.add({ name: 'nums', value: [10, 20, 30, 40] });
                    arr.remove(1);
                    return arr.get().length === 3 && 
                           arr.getChild(0).get() === 10 && 
                           arr.getChild(1).get() === 30 && 
                           arr.getChild(2).get() === 40;
                }
            },
            {
                description: 'Remove item renumbers children',
                test: () => {
                    const arr = root.add({ name: 'data', value: ['a', 'b', 'c'] });
                    arr.remove(1);
                    return arr.getChild(0) && arr.getChild(1) && !arr.getChild(2);
                }
            },
            {
                description: 'Set new array',
                test: () => {
                    const arr = root.add({ name: 'old', value: ['x', 'y'] });
                    arr.set(['p', 'q', 'r']);
                    return arr.get().length === 3 && arr.getChild(0).get() === 'p';
                }
            },
            {
                description: 'toJson() returns array',
                test: () => {
                    const arr = root.add({ name: 'final', value: ['one', 'two', 'three'] });
                    const json = arr.toJson();
                    return Array.isArray(json) 
                        && json.length === 3 
                        && json[1] === 'two';
                }
            },
            {
                description: 'Add without op (default push)',
                test: () => {
                    const arr = root.add({ name: 'test', value: ['a', 'b'] });
                    const result = arr.add({ value: 'c' });
                    return result !== null && arr.get().length === 3 && arr.getChild(2).get() === 'c';
                }
            },
            {
                description: 'Add with invalid op logs warning',
                test: () => {
                    const arr = root.add({ name: 'test', value: ['a'] });
                    const result = arr.add({ op: 'invalid-op', value: 'x' });
                    return result === null;
                }
            },
            {
                description: 'Set non-array logs warning',
                test: () => {
                    const arr = root.add({ name: 'test', value: ['a'] });
                    arr.set('not an array');
                    return arr.get().length === 1;
                }
            },
            {
                description: 'Remove non-existent index logs warning',
                test: () => {
                    const arr = root.add({ name: 'test', value: ['a', 'b'] });
                    const result = arr.remove(99);
                    return result === false;
                }
            },
            {
                description: 'Nested arrays',
                test: () => {
                    const arr = root.add({ name: 'nested', value: [['a', 'b'], ['c', 'd']] });
                    const firstItem = arr.getChild(0);
                    const child = firstItem.getChild(0);
                    return firstItem && 
                        firstItem.getType() === TYPE_ARRAY && 
                        child.get() === 'a';
                }
            },
            {
                description: 'Array of objects',
                test: () => {
                    const arr = root.add({ name: 'objects', value: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] });
                    const firstItem = arr.getChild(0);
                    const child = firstItem.getChild('name');
                    return firstItem && 
                        firstItem.getType() === TYPE_GROUP && 
                        child.get() === 'Alice';
                }
            },
            {
                description: 'Push operation',
                test: () => {
                    const arr = root.add({ name: 'test', value: ['a'] });
                    arr.add({ op: '>', value: 'b' });
                    return arr.get().length === 2 && arr.getChild(1).get() === 'b';
                }
            },
            {
                description: 'Unshift operation',
                test: () => {
                    const arr = root.add({ name: 'test', value: ['b'] });
                    arr.add({ op: '<', value: 'a' });
                    return arr.get().length === 2 && arr.getChild(0).get() === 'a';
                }
            },
            {
                description: 'Insert after operation',
                test: () => {
                    const arr = root.add({ name: 'test', value: ['a', 'c'] });
                    arr.add({ op: 'after:a', value: 'b' });
                    return arr.get().length === 3 && arr.getChild(1).get() === 'b';
                }
            },
            {
                description: 'child-added event',
                test: () => {
                    const arr = root.add({ name: 'events', value: [] });
                    let eventFired = false;
                    arr.on('child-added', () => { eventFired = true; });
                    arr.add({ value: 'new' });
                    return eventFired;
                }
            },
            {
                description: 'child-removed event',
                test: () => {
                    const arr = root.add({ name: 'events', value: ['x', 'y'] });
                    let eventFired = false;
                    arr.on('child-removed', () => { eventFired = true; });
                    arr.remove(0);
                    return eventFired;
                }
            }
        ];
    
        let passed = 0;
        let failed = 0;
    
        testCases.forEach(({ description, test }) => {
            try {
                const result = test();
                if (result) {
                    console.log(`✅ ${description}`);
                    passed++;
                } else {
                    console.log(`❌ ${description}`);
                    failed++;
                }
            } catch (e) {
                console.log(`❌ ${description}`);
                console.log(`   Error: ${e.message}`);
                failed++;
            }
        });
    
        console.log(`\n=== Results ===`);
        console.log(`Passed: ${passed}/${testCases.length}`);
        console.log(`Failed: ${failed}/${testCases.length}`);
    
        return failed === 0;
    }
    
    // Run tests
    const success = testArrayProperty();
    console.log(`\n${success ? '✅ All tests PASSED' : '❌ Some tests FAILED'}`);    
}