
// watches node structur, insertion and deletion
class IPropertyGroup extends Mediator {
    #node;
    #childProperties = new Map();
    #unsubscribers = [];

    constructor(node) {
        super();
        this.#node = node;
        this.#setupNodeListeners();
    }

    #setupNodeListeners() {
        // Watch for structural changes
        const unsubChild = this.#node.on('child-added', ({ child }) => {
            this.emit('child-added', { name: child.P.name, child });
        });

        const unsubRemove = this.#node.on('child-removed', ({ child }) => {
            const name = child.P.name;
            this.#childProperties.delete(name);
            this.emit('child-removed', { name });
        });

        this.#unsubscribers.push(unsubChild, unsubRemove);
    }

    getName() {
        return this.#node.P.name;
    }

    getConfig() {
        return this.#node.P.data?.config || {};
    }

    // Spawn child Property or PropertyGroup on demand
    getChild(childName) {
        if (this.#childProperties.has(childName)) {
            return this.#childProperties.get(childName);
        }

        const childNode = this.#node.getChild(childName);
        if (!childNode) return null;

        // Determine if child is a group or leaf
        const childProp = childNode.#children.length > 0
            ? new IPropertyGroup(childNode)
            : new IProperty(childNode);

        this.#childProperties.set(childName, childProp);
        return childProp;
    }

    getChildren() {
        return this.#node.getChildren().map(child => this.getChild(child.P.name));
    }

    // Cleanup
    destroy() {
        this.#unsubscribers.forEach(unsub => unsub());
        this.#childProperties.forEach(prop => prop.destroy?.());
        this.clear();
    }
}

// watches value changes
class IProperty extends Mediator {
    #node;
    #validator;

    constructor(node, validator = null) {
        super();
        this.#node = node;
        this.#validator = validator;
    }

    getName() {
        return this.#node.P.name;
    }

    getValue() {
        return this.#node.P.data?.value;
    }

    getConfig() {
        return this.#node.P.data?.config || {};
    }

    setValue(newValue) {
        if (this.#validator && !this.#validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = this.getValue();
        if (oldValue === newValue) {
            return { success: true };
        }

        this.#node.P.data.value = newValue;
        this.emit('value-changed', { oldValue, newValue });
        return { success: true };
    }

    // Optional: get full path (useful for debugging or binding)
    getPath() {
        const path = [];
        let current = this.#node;
        while (current) {
            path.unshift(current.P.name);
            current = current.#parent;
        }
        return path;
    }

    // Cleanup
    destroy() {
        this.clear();
    }
}