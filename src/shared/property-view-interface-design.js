class _PropertyInterface {
    constructor(tree, path, validator = null) {
        this.tree = tree;
        this.path = path;
        this.validator = validator;
        this.subscribers = new Set();
    }

    get() {
        return this.tree.getAt(this.path);
    }

    set(newValue) {
        // Validate first
        if (this.validator && !this.validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = this.get();
        this.tree.setAt(this.path, newValue);

        // Notify all subscribers
        this.subscribers.forEach(callback => callback(newValue, oldValue));

        return { success: true };
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        // Return unsubscribe function
        return () => this.subscribers.delete(callback);
    }
}

class PropertyInterface {
    constructor(tree, path, validator = null) {
        this.tree = tree;
        this.path = path;
        this.validator = validator;
        this.subscribers = new Set();
    }

    get() {
        return this.tree.getAt(this.path);
    }

    set(newValue) {
        if (this.validator && !this.validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = this.get();
        this.tree.setAt(this.path, newValue);

        // Automatically notify all subscribers
        this.subscribers.forEach(callback => callback(newValue, oldValue));

        return { success: true };
    }

    onChange(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}

class TreeHolder {
    constructor(initialState = {}) {
        this.state = initialState;
        this.propertyCache = new Map(); // Cache PropertyInterfaces
    }

    getPropertyInterface(path, validator = null) {
        const key = `${path}:${validator?.name || 'default'}`;

        if (!this.propertyCache.has(key)) {
            this.propertyCache.set(key, new PropertyInterface(this, path, validator));
        }

        return this.propertyCache.get(key);
    }

    getAt(path) {
        const parts = path.split('/').filter(p => p);
        return parts.reduce((obj, part) => obj?.[part], this.state);
    }

    setAt(path, value) {
        const parts = path.split('/').filter(p => p);
        const lastKey = parts.pop();

        let current = this.state;
        for (const part of parts) {
            if (!(part in current)) current[part] = {};
            current = current[part];
        }

        current[lastKey] = value;
    }
}

const tree = new TreeHolder({
    user: { name: "Alice", age: 30 }
});

// View 1: Name editor
const nameProp = tree.getPropertyInterface("/user/name",
    (val) => typeof val === 'string' && val.length > 0
);

// View 2: Age editor (same property instance if same path)
const ageProp = tree.getPropertyInterface("/user/age",
    (val) => typeof val === 'number' && val > 0
);

// View 3: Age editor (same property instance like View 2)
const ageProp2 = tree.getPropertyInterface("/user/age",
    (val) => typeof val === 'number' && val > 0
);

ageProp.onChange((n, o) => {
    console.log(`View 2 - new value: ${n}, old value: ${o}`);
});

ageProp2.onChange((n, o) => {
    console.log(`View 3 - new value: ${n}, old value: ${o}`);
});

ageProp.set(42);


// Attempt to set
const result = nameProp.set("Bob");
console.log(result); // { success: true }

const failResult = nameProp.set(""); // Empty string fails validation
console.log(failResult); // { success: false, reason: "validation_failed" }