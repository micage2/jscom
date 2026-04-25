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
    getType() { return TYPE_ARRAY; }
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
        const { op, value } = params;
        
        // Default: push
        if (!op || op === '>') {
            return this.#push(value);
        }
        
        if (op === '<') {
            return this.#unshift(value);
        }
        
        // Insert after item with given value
        if (op.startsWith('after:')) {
            const targetValue = op.substring(6);
            const index = this.#array.indexOf(targetValue);
            if (index === -1) {
                console.warn(`ArrayProperty.add(): value '${targetValue}' not found`);
                return null;
            }
            return this.#insert(index + 1, value);
        }
        
        // Insert before item with given value
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
        const oldChildren = Array.from(this.#children.entries())
            .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB));
        
        this.#children.clear();
        
        oldChildren.forEach((child, newIndex) => {
            child.setName(String(newIndex));
            this.#children.set(String(newIndex), child);
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
