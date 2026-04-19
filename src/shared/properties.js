
// watches node structur, insertion and deletion
export class IPropertyGroup extends Mediator {
    #node;
    #childProperties = new Map();

    // {name, data, config, type = 'group'} = node.P
    constructor(node) {
        console.assert(typeof node.P.name === 'string', 'Node has no name');
        console.assert(node.P.type === 'group', 'Node is not a group');
        super();
        this.#node = node;
    }

    getName() {
        return this.#node.P.name;
    }

    isGroup() { return true; }

    // Spawn child Property or PropertyGroup on demand
    getChild(childName) {
        if (this.#childProperties.has(childName)) {
            return this.#childProperties.get(childName);
        }

        const childNode = this.#node.getChild((name) => name === childName);
        if (!childNode) return null;
    
        // Determine type from node.P.type, not from children count
        const childProp = childNode.P.type === 'group'
            ? new IPropertyGroup(childNode)
            : new IProperty(childNode);
    
        this.#childProperties.set(childName, childProp);
        return childProp;
    }
    
    getChildren() {
        return this.#node.getChildren().map(child => this.getChild(child.P.name));
    }

    getByPath(path) {
        const parts = path.split('.');
        let current = this;
        
        for (const part of parts) {
            current = current.getChild(part);
            if (!current) return null;
        }
        
        return current;
    }

    addChild(name, type, data = {}, config = {}) {
        const childNode = new Node({
            name,
            type,
            data: type === 'group' ? {} : { value: data },
            config
        });

        this.#node.add(childNode);
        const childProp = this.getChild(name);
        this.emit('prop-added', childProp);

        return childProp;
    }

    addProp(prop) {
        this.#childProperties.set(prop.getName(), prop);
        this.emit('prop-added', prop);
    }

    removeChild(name) {
        const childNode = this.#node.getChild(name);
        if (childNode) {
            this.#node.remove(childNode);
            
            const childProp = this.#childProperties.get(name);
            if (childProp) {
                childProp.#destroy();
            }
            
            this.#childProperties.delete(name);
            this.emit('prop-removed', { name });
            return true;
        }
        return false;
    }

    // Cleanup
    #destroy() {
        this.#childProperties.forEach(prop => prop.#destroy?.());
        this.#childProperties.clear();
        this.clear();
    }
}


// watches value changes
export class IProperty extends Mediator {
    #node;
    #validator;

    constructor(node, validator = null) {
        console.assert(typeof node.P.name === 'string', 'Node has no data');
        console.assert(typeof node.P.value !== 'object' && node.P.value !== undefined, 'Node has no valid type');
        super();
        this.#node = node;
        this.#validator = validator;
    }

    isGroup() { return false; }

    getName() {
        return this.#node.P.name;
    }

    getValue() {
        return this.#node.P.value;
    }

    setValue(newValue) {
        if (this.#validator && !this.#validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = this.getValue();
        if (oldValue === newValue) {
            return { success: true };
        }

        this.#node.P.value = newValue;
        this.emit('value-changed', { oldValue, newValue });
        return { success: true };
    }

    // Optional: get full path (useful for debugging or binding)
    getPath() {
        const path = [];
        let current = this.#node;
        while (current) {
            path.unshift(current.P.name);
            current = current.getParent();
        }
        return path;
    }

    // Cleanup
    #destroy() {
        this.clear();
    }
}
