export class ArrayProperty extends Property {
    #name;
    #array;
    #children = new Map();
    #parent = null;

    constructor(name, value = []) {
        super();
        this.#name = name;
        this.#array = Array.isArray(value) ? value : [];
        
        // Wrap each array element as a child property
        this.#array.forEach((item, index) => {
            this.#addChild(String(index), item);
        });
    }

    #addChild(name, value) {
        const property = TypeRegistry.create({ name, value });
        if (property) {
            const index = parseInt(name);
            
            // Sync child changes back to array
            property.on('value-changed', ({ newValue }) => {
                this.#array[index] = newValue;
            });
            
            this.adopt(property);
        }
        return property;
    }

    getName() { return this.#name; }
    setName(name) { this.#name = name; }
    getType() { return 'array'; }
    getParent() { return this.#parent; }
    setParent(parent) { this.#parent = parent; }
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
        const nextIndex = this.#array.length;
        const name = params.name ?? String(nextIndex);
        
        if (!/^\d+$/.test(name)) {
            console.warn(`ArrayProperty.add(): index must be numeric, got '${name}'`);
            return null;
        }
        
        const index = parseInt(name);
        
        if (index !== nextIndex) {
            console.warn(`ArrayProperty.add(): cannot add at index ${index}, next available is ${nextIndex}`);
            return null;
        }
        
        const value = params.value;
        this.#array.push(value);
        
        return this.#addChild(name, value);
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
        const oldChildren = Array.from(this.#children.entries())
            .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB));
        
        this.#children.clear();
        
        oldChildren.forEach(([oldKey, child], newIndex) => {
            const oldIndex = parseInt(oldKey);
            if (oldIndex > index) {
                child.setName(String(newIndex));
                this.#children.set(String(newIndex), child);
            } else {
                this.#children.set(oldKey, child);
            }
        });
        
        this.emit('child-removed', property);
        return true;
    }

    getChild(indexOrName) {
        const key = String(indexOrName);
        return this.#children.get(key) ?? null;
    }

    getChildren() {
        return Array.from(this.#children.values())
            .sort((a, b) => parseInt(a.getName()) - parseInt(b.getName()));
    }

    traverse(cb) {
        const stack = [{ property: this, depth: 0, isLast: true }];

        while (stack.length) {
            const { property, depth, isLast } = stack.pop();
            const children = property.getChildren();
            const child_count = children ? children.length : 0;

            cb(property, { depth, child_count, is_last: isLast });

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

    toJson() {
        return this.#array.map((_, index) => {
            const child = this.getChild(index);
            return child ? child.toJson() : undefined;
        });
    }
}
