import { Mediator } from './mediator.js';


class __IProperty {
    constructor(node, validator = null) {
        this.node = node;
        this.validator = validator;
        this.subscribers = new Set();
    }

    get() {
        return this.node.payload;
    }

    set(newValue) {
        if (this.validator && !this.validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = this.get();
        this.node.payload = newValue;

        this.subscribers.forEach(callback => callback(newValue, oldValue));

        return { success: true };
    }

    onChange(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}


class __IPropertyGroup {
    constructor(node) {
        this.node = node;
        this.properties = new Map();
        this.deleteCallbacks = new Set();
    }

    get_prop(propertyName, validator = null) {
        const key = `${propertyName}:${validator?.name || 'default'}`;
        if (!this.properties.has(key)) {
            this.properties.set(key, new IProperty(this.node, propertyName, validator));
        }
        return this.properties.get(key);
    }

    onDelete(callback) {
        this.deleteCallbacks.add(callback);
    }

    notifyDelete() {
        this.deleteCallbacks.forEach(cb => cb());
    }
}


const _IProperty = (node, validator = null) => {
    const subscribers = new Set();    

    const get = () => node.payload;

    const set = (newValue) => {
        if (validator && !validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = node.payload;
        node.payload = newValue;

        subscribers.forEach(callback => callback(newValue, oldValue));

        return { success: true };
    };

    const on_change = (callback) => {
        subscribers.add(callback);
        return () => subscribers.delete(callback);
    };

    return { get, set, on_change };
};

// node.P has { name, data = { value, config = {} } } guaranteed
export const IPropertyGroup = (node, validator = null) => {
    const { value, config = {} } = node.P.data;
    const properties = new Map();
    const mediator = new Mediator();
    const get_name = () => node.P.name;
    const get_config = () => config;

    const get = () => node.P.data.value;
    const set = (newValue) => {
        if (validator && !validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = node.P.value.value;
        node.P.value.value = newValue;

        if (oldValue !== newValue)
            mediator.emit('prop-changed', newValue);

        return { success: true };
    };

    // spawn child PropertyGroups on demand
    const get_prop = (propertyName, validator = null) => {
        const prop = properties.get(propertyName);
        if (prop) { return prop; }

        const child = node.get_child(propertyName);
        if (child) {
            return IPropertyGroup(node, validator);
        }
        return null;
    };

    const on = (msg, cb) => mediator.on(msg, cb);

    return { get_name, get_config, get, set, get_prop, on }
}

